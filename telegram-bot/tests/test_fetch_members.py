import asyncio
import os
from bot import TelegramAppwriteBot
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_fetch_members():
    """Test the fetch members functionality"""
    try:
        # Initialize bot
        bot = TelegramAppwriteBot()
        
        # Get group ID from environment (you can set this in .env if needed)
        group_id = os.getenv('TELEGRAM_GROUP_ID', '-1002061803414')  # Using the group ID from parent .env
        
        if not group_id:
            print("❌ No TELEGRAM_GROUP_ID found in environment variables")
            return
        
        print(f"Testing fetch members for group ID: {group_id}")
        
        # Create application for testing
        from telegram.ext import Application
        bot.application = Application.builder().token(bot.telegram_token).build()
        
        # Initialize the application
        await bot.application.initialize()
        
        try:
            # Test fetching members
            members_count = await bot.fetch_all_group_members(int(group_id), "Test Group")
            print(f"✅ Successfully fetched {members_count} members")
        finally:
            # Clean up
            await bot.application.shutdown()
        
    except Exception as e:
        print(f"❌ Error testing fetch members: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_fetch_members())
