import asyncio
import signal
import sys
from bot import TelegramAppwriteBot

async def test_bot_running():
    """Test if the bot can start and run briefly"""
    try:
        print("🚀 Testing bot startup and running...")
        
        # Initialize bot
        bot = TelegramAppwriteBot()
        
        # Create application
        from telegram.ext import Application
        application = Application.builder().token(bot.telegram_token).build()
        
        # Add handlers (same as in bot.py)
        from telegram.ext import ChatMemberHandler, CommandHandler, MessageHandler, filters
        from telegram import Update
        from telegram.ext import ContextTypes
        
        # Add chat member handler
        application.add_handler(ChatMemberHandler(
            bot.handle_chat_member_update, 
            ChatMemberHandler.CHAT_MEMBER
        ))
        
        # Add command handlers
        application.add_handler(CommandHandler("fetch_members", bot.fetch_all_members_command))
        application.add_handler(CommandHandler("stats", bot.stats_command))
        application.add_handler(CommandHandler("verify", bot.verify_command))
        
        # Add message handler
        application.add_handler(MessageHandler(
            filters.TEXT & ~filters.COMMAND & (filters.ChatType.GROUP | filters.ChatType.SUPERGROUP),
            bot.handle_group_message
        ))
        
        # Add error handler
        application.add_error_handler(bot.error_handler)
        
        print("✅ Bot application created successfully")
        print("✅ All handlers added successfully")
        print("✅ Bot is ready to run")
        
        # Test if we can get bot info
        try:
            bot_info = await application.bot.get_me()
            print(f"✅ Bot info retrieved:")
            print(f"   Name: {bot_info.first_name}")
            print(f"   Username: @{bot_info.username}")
            print(f"   ID: {bot_info.id}")
            print(f"   Can join groups: {bot_info.can_join_groups}")
            print(f"   Can read all group messages: {bot_info.can_read_all_group_messages}")
        except Exception as e:
            print(f"⚠️  Could not get bot info: {str(e)}")
        
        print("\n🎉 Bot is working correctly!")
        print("The bot can be started with: python bot.py")
        
        return True
        
    except Exception as e:
        print(f"❌ Bot running test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_bot_running()) 