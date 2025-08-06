import logging
import os
from datetime import datetime
from typing import Optional

from telegram import Update
from telegram.ext import Application, ChatMemberHandler, ContextTypes, CommandHandler, MessageHandler, filters
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging to stdout
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

class BotHandler:
    def __init__(self):
        # Get configuration from environment variables
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.appwrite_endpoint = os.getenv('APPWRITE_ENDPOINT')
        self.appwrite_project_id = os.getenv('APPWRITE_PROJECT_ID')
        self.appwrite_api_key = os.getenv('APPWRITE_API_KEY')
        self.appwrite_database_id = os.getenv('APPWRITE_DATABASE_ID')
        self.appwrite_collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        # Validate required environment variables
        required_vars = {
            'TELEGRAM_BOT_TOKEN': 'telegram_token',
            'APPWRITE_ENDPOINT': 'appwrite_endpoint',
            'APPWRITE_PROJECT_ID': 'appwrite_project_id',
            'APPWRITE_API_KEY': 'appwrite_api_key',
            'APPWRITE_DATABASE_ID': 'appwrite_database_id',
            'APPWRITE_COLLECTION_ID': 'appwrite_collection_id'
        }
        
        missing_vars = [var for var, attr in required_vars.items() if not getattr(self, attr, None)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        # Initialize Appwrite client
        self.client = Client()
        self.client.set_endpoint(self.appwrite_endpoint)
        self.client.set_project(self.appwrite_project_id)
        self.client.set_key(self.appwrite_api_key)
        
        self.databases = Databases(self.client)
        
        logger.info("BotHandler initialized successfully")

    async def handle_chat_member_update(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle chat member updates (joins, leaves, status changes)"""
        try:
            chat_member_update = update.chat_member
            if not chat_member_update:
                return
                
            user = chat_member_update.new_chat_member.user
            old_status = chat_member_update.old_chat_member.status
            new_status = chat_member_update.new_chat_member.status
            chat = chat_member_update.chat
            
            logger.info(f"Chat member update: User {user.username or user.first_name} "
                       f"(ID: {user.id}) status changed from {old_status} to {new_status} "
                       f"in chat {chat.title or chat.id}")
            
            # Prepare member document data
            member_data = {
                'user_id': user.id,  # integer as per collection schema
                'username': user.username or '',
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'is_bot': user.is_bot,
                'language_code': user.language_code or '',
                'status': new_status,
                'joined_at': datetime.now().isoformat(),
                'phone_number': '',
                'chat_id': str(chat.id),
                'chat_title': chat.title or '',
                'chat_type': chat.type,
                'old_status': old_status,
                'new_status': new_status,
                'updated_at': datetime.now().isoformat(),
                'is_wishlist_verified': False  # Default to not verified
            }
            
            # Create unique document ID based on user_id
            document_id = f"user_{user.id}"
            
            # Upsert member document to Appwrite
            await self.upsert_member_document(document_id, member_data)
            
        except Exception as e:
            logger.error(f"Error handling chat member update: {str(e)}", exc_info=True)
    
    async def handle_group_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle messages in group to capture member data when they interact"""
        try:
            if not update.message or not update.message.from_user:
                return
            
            user = update.message.from_user
            chat = update.message.chat
            
            # Only process group messages
            if chat.type not in ['group', 'supergroup']:
                return
            
            # Skip bot messages
            if user.is_bot:
                return
            
            logger.info(f"Capturing member data from message: {user.first_name} (@{user.username}) in {chat.title}")
            
            # Prepare member data from message interaction
            member_data = {
                'user_id': user.id,
                'username': user.username or '',
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'is_bot': user.is_bot,
                'language_code': user.language_code or '',
                'status': 'member',  # Default status for regular members who send messages
                'joined_at': datetime.now().isoformat(),
                'phone_number': '',
                'chat_id': str(chat.id),
                'chat_title': chat.title or '',
                'chat_type': chat.type,
                'old_status': 'unknown',
                'new_status': 'member',
                'updated_at': datetime.now().isoformat(),
                'is_wishlist_verified': False  # Default to not verified
            }
            
            document_id = f"user_{user.id}"
            
            # Store member data (will update if already exists)
            await self.upsert_member_document(document_id, member_data)
            
        except Exception as e:
            logger.error(f"Error handling group message: {str(e)}", exc_info=True)

    async def upsert_member_document(self, document_id: str, member_data: dict) -> None:
        """Upsert member document in Appwrite database"""
        try:
            # Try to update existing document first
            try:
                result = self.databases.update_document(
                    database_id=self.appwrite_database_id,
                    collection_id=self.appwrite_collection_id,
                    document_id=document_id,
                    data=member_data
                )
                logger.info(f"Updated member document for user {member_data['user_id']} in chat {member_data['chat_id']}")
                
            except AppwriteException as e:
                # If document doesn't exist, create it
                if e.code == 404:
                    result = self.databases.create_document(
                        database_id=self.appwrite_database_id,
                        collection_id=self.appwrite_collection_id,
                        document_id=document_id,
                        data=member_data
                    )
                    logger.info(f"Created new member document for user {member_data['user_id']} in chat {member_data['chat_id']}")
                else:
                    raise e
                    
        except AppwriteException as e:
            logger.error(f"Appwrite error while upserting member document: {e.message} "
                        f"(Code: {e.code}, Type: {e.type})")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error while upserting member document: {str(e)}")
            raise e

    async def fetch_all_members_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Command handler to fetch all group members"""
        try:
            chat = update.effective_chat
            user = update.effective_user
            
            # Check if command is used in a group
            if chat.type not in ['group', 'supergroup']:
                await update.message.reply_text("This command can only be used in groups!")
                return
            
            # Check if user is admin (optional security check)
            try:
                chat_member = await context.bot.get_chat_member(chat.id, user.id)
                if chat_member.status not in ['creator', 'administrator']:
                    await update.message.reply_text("Only group administrators can use this command!")
                    return
            except Exception as e:
                logger.warning(f"Could not check admin status: {e}")
            
            await update.message.reply_text("Fetching all group members... This may take a moment.")
            
            # Fetch all members
            members_count = await self.fetch_all_group_members(chat.id, chat.title or str(chat.id))
            
            # Get total member count for the response
            try:
                total_count = await context.bot.get_chat_member_count(chat.id)
                response_msg = f"""
✅ **Member Fetch Complete!**

📊 **Statistics:**
• Stored administrators: {members_count}
• Total group members: {total_count}
• Regular members: {total_count - members_count}

🔄 **How to capture all members:**
• **Real-time monitoring:** Members are automatically captured when they join/leave
• **Message interaction:** Members are captured when they send messages
• **Status changes:** Any status changes are automatically tracked

💡 **Tip:** The bot will gradually build a complete member database as members interact with the group!
                """
                await update.message.reply_text(response_msg)
            except:
                await update.message.reply_text(f"✅ Successfully fetched and stored {members_count} administrators! Regular members will be captured as they interact.")
            
        except Exception as e:
            logger.error(f"Error in fetch_all_members_command: {str(e)}", exc_info=True)
            await update.message.reply_text(f"❌ Error fetching members: {str(e)}")
    
    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Show statistics of captured members"""
        try:
            chat = update.effective_chat
            
            if chat.type not in ['group', 'supergroup']:
                await update.message.reply_text("This command can only be used in groups!")
                return
            
            await update.message.reply_text("📈 Fetching member statistics...")
            
            # Get total group member count
            try:
                total_count = await context.bot.get_chat_member_count(chat.id)
            except:
                total_count = "Unknown"
            
            # Count stored members from database (this would require a query to Appwrite)
            # For now, we'll show what we can
            
            stats_msg = f"""
📈 **Member Statistics**

👥 **Group Info:**
• Total members: {total_count}
• Group: {chat.title}
• Chat ID: {chat.id}

💾 **Database Capture:**
• Members are captured when they:
  - Join/leave the group
  - Send messages
  - Have status changes
  - Use bot commands

🔄 **Real-time Monitoring:** Active
✅ **Auto-capture:** Enabled
            """
            
            await update.message.reply_text(stats_msg)
            
        except Exception as e:
            logger.error(f"Error in stats_command: {str(e)}", exc_info=True)
            await update.message.reply_text(f"❌ Error getting stats: {str(e)}")

    async def verify_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Verify user for wishlist submission"""
        try:
            user = update.effective_user
            chat = update.effective_chat

            if chat.type not in ['group', 'supergroup']:
                await update.message.reply_text("This command can only be used in the main group.")
                return

            # Document ID is based on user ID
            document_id = f"user_{user.id}"
            
            try:
                # Check if the user is already in our database
                existing_doc = self.databases.get_document(
                    self.appwrite_database_id,
                    self.appwrite_collection_id,
                    document_id
                )
                
                # Update the verification status
                updated_data = {
                    'is_wishlist_verified': True,
                    'updated_at': datetime.now().isoformat()
                }
                
                self.databases.update_document(
                    self.appwrite_database_id,
                    self.appwrite_collection_id,
                    document_id,
                    data=updated_data
                )
                
                logger.info(f"Verified user {user.first_name} (@{user.username}) for wishlist")
                await update.message.reply_text(f"✅ {user.first_name}, you are now verified! You can now submit your wishlist on the website.")

            except AppwriteException as e:
                if e.code == 404:  # User not in database yet
                    logger.info(f"User {user.first_name} (@{user.username}) not found for verification. Creating new record.")
                    
                    # Create a new record for the user
                    new_member_data = {
                        'user_id': user.id,
                        'username': user.username or '',
                        'first_name': user.first_name or '',
                        'last_name': user.last_name or '',
                        'is_bot': user.is_bot,
                        'language_code': user.language_code or '',
                        'status': 'member',
                        'joined_at': datetime.now().isoformat(),
                        'phone_number': '',
                        'chat_id': str(chat.id),
                        'chat_title': chat.title or '',
                        'chat_type': chat.type,
                        'old_status': 'unknown',
                        'new_status': 'member',
                        'updated_at': datetime.now().isoformat(),
                        'is_wishlist_verified': True  # Verify them immediately
                    }
                    
                    self.databases.create_document(
                        self.appwrite_database_id,
                        self.appwrite_collection_id,
                        document_id,
                        data=new_member_data
                    )
                    
                    await update.message.reply_text(f"✅ {user.first_name}, you have been successfully verified! You can now submit your wishlist.")
                else:
                    raise e

        except Exception as e:
            logger.error(f"Error in verify_command: {str(e)}", exc_info=True)
            await update.message.reply_text("❌ An error occurred during verification. Please try again or contact an admin.")
    
    async def fetch_all_group_members(self, chat_id: int, chat_title: str) -> int:
        """Fetch available group members and store them in database
        
        Note: Due to Telegram Bot API limitations, regular bots can only:
        1. Get administrators
        2. Get member count
        3. Monitor real-time joins/leaves
        
        To get all members, you would need:
        - A userbot (not recommended due to ToS)
        - Members to interact with the bot
        - Use the real-time monitoring feature
        """
        try:
            logger.info(f"Starting to fetch available members for chat {chat_id} ({chat_title})")
            
            members_count = 0
            
            # Get chat administrators (this is what we can fetch)
            try:
                administrators = await self.application.bot.get_chat_administrators(chat_id)
                logger.info(f"Found {len(administrators)} administrators")
                
                for admin in administrators:
                    user = admin.user
                    if user.is_bot and user.username != self.application.bot.username:
                        continue  # Skip other bots
                    
                    # Prepare member data using full collection schema
                    member_data = {
                        'user_id': user.id,  # integer as per collection schema
                        'username': user.username or '',
                        'first_name': user.first_name or '',
                        'last_name': user.last_name or '',
                        'is_bot': user.is_bot,
                        'language_code': user.language_code or '',
                        'status': admin.status,
                        'joined_at': datetime.now().isoformat(),
                        'phone_number': '',
                        'chat_id': str(chat_id),
                        'chat_title': chat_title,
                        'chat_type': 'supergroup',
                        'old_status': 'unknown',
                        'new_status': admin.status,
                        'updated_at': datetime.now().isoformat(),
                        'is_wishlist_verified': False  # Default to not verified
                    }
                    
                    # Create unique document ID
                    document_id = f"user_{user.id}"
                    
                    # Store in database with retry logic
                    try:
                        await self.upsert_member_document(document_id, member_data)
                        members_count += 1
                        logger.info(f"Stored admin: {user.first_name} (@{user.username}) - Status: {admin.status}")
                    except Exception as store_error:
                        logger.error(f"Failed to store admin {user.first_name}: {str(store_error)}")
                        # Continue with next member instead of failing completely
            
            except Exception as e:
                logger.error(f"Error fetching administrators: {str(e)}")
            
            # Get total member count (this tells us how many members are in the group)
            try:
                total_member_count = await self.application.bot.get_chat_member_count(chat_id)
                logger.info(f"Total member count in group: {total_member_count}")
                logger.info(f"📊 Group Statistics:")
                logger.info(f"   Total members: {total_member_count}")
                logger.info(f"   Stored admins: {members_count}")
                logger.info(f"   Regular members: {total_member_count - members_count} (will be captured as they join/leave/interact)")
            except Exception as e:
                logger.warning(f"Could not get member count: {str(e)}")
            
            logger.info(f"Successfully processed {members_count} administrators")
            logger.info(f"ℹ️  To capture regular members, they need to:")
            logger.info(f"   - Join the group (auto-captured)")
            logger.info(f"   - Leave the group (auto-captured)")
            logger.info(f"   - Have their status changed (auto-captured)")
            
            return members_count
            
        except Exception as e:
            logger.error(f"Error fetching group members: {str(e)}", exc_info=True)
            raise e
    
    async def error_handler(self, update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle errors that occur during bot operation"""
        logger.error(f"Exception while handling an update: {context.error}", exc_info=True)

    def run(self):
        """Start the bot with long polling"""
        try:
            # Create application
            self.application = Application.builder().token(self.telegram_token).build()
            
            # Add chat member handler
            self.application.add_handler(ChatMemberHandler(
                self.handle_chat_member_update, 
                ChatMemberHandler.CHAT_MEMBER
            ))
            
            # Add command handler for fetching all members
            self.application.add_handler(CommandHandler("fetch_members", self.fetch_all_members_command))

            # Add command handler for member statistics
            self.application.add_handler(CommandHandler("stats", self.stats_command))
            
            # Add command handler for wishlist verification
            self.application.add_handler(CommandHandler("verify", self.verify_command))
            
            # Add message handler to capture member data when they interact
            # Only handle text messages in groups (not commands)
            self.application.add_handler(MessageHandler(
                filters.TEXT & ~filters.COMMAND & (filters.ChatType.GROUP | filters.ChatType.SUPERGROUP),
                self.handle_group_message
            ))
            
            # Add error handler
            self.application.add_error_handler(self.error_handler)
            
            logger.info("Starting bot with long polling...")
            
            # Start polling
            self.application.run_polling(
                allowed_updates=Update.ALL_TYPES,
                drop_pending_updates=True
            )
            
        except Exception as e:
            logger.error(f"Error starting bot: {str(e)}", exc_info=True)
            raise e

def main():
    """Main function to start the bot"""
    try:
        bot = TelegramAppwriteBot()
        bot.run()
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)

if __name__ == '__main__':
    main()


def create_bot_application() -> Application:
    """Creates and configures the Telegram bot application."""
    bot_handler = BotHandler()

    # Create the Application and pass it your bot's token.
    application = Application.builder().token(bot_handler.telegram_token).build()

    # Add handlers
    application.add_handler(ChatMemberHandler(bot_handler.handle_chat_member_update, ChatMemberHandler.CHAT_MEMBER))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, bot_handler.handle_group_message))
    application.add_handler(CommandHandler("fetch_members", bot_handler.fetch_all_members_command))

    return application
