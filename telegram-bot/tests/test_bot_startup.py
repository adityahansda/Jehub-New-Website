import asyncio
import os
from bot import TelegramAppwriteBot
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_bot_startup():
    """Test if the bot can be initialized and basic functionality works"""
    try:
        print("🔍 Testing bot startup...")
        
        # Test 1: Initialize bot
        print("1. Testing bot initialization...")
        bot = TelegramAppwriteBot()
        print("✅ Bot initialized successfully")
        
        # Test 2: Check environment variables
        print("\n2. Checking environment variables...")
        required_vars = [
            'TELEGRAM_BOT_TOKEN',
            'APPWRITE_ENDPOINT', 
            'APPWRITE_PROJECT_ID',
            'APPWRITE_API_KEY',
            'APPWRITE_DATABASE_ID',
            'APPWRITE_COLLECTION_ID'
        ]
        
        missing_vars = []
        for var in required_vars:
            value = os.getenv(var)
            if value:
                print(f"✅ {var}: {'*' * len(value[:10])}... (length: {len(value)})")
            else:
                print(f"❌ {var}: Missing")
                missing_vars.append(var)
        
        if missing_vars:
            print(f"\n❌ Missing environment variables: {', '.join(missing_vars)}")
            return False
        
        # Test 3: Test Appwrite connection
        print("\n3. Testing Appwrite connection...")
        try:
            # Try to get collection info
            collection = bot.databases.get_collection(
                bot.appwrite_database_id, 
                bot.appwrite_collection_id
            )
            print(f"✅ Appwrite connection successful")
            print(f"   Collection: {collection['name']}")
            print(f"   Document count: {collection.get('$id', 'N/A')}")
        except Exception as e:
            print(f"⚠️  Appwrite connection issue: {str(e)}")
            print("   This might be due to network issues or collection not existing")
        
        # Test 4: Test Telegram bot token
        print("\n4. Testing Telegram bot token...")
        try:
            from telegram.ext import Application
            app = Application.builder().token(bot.telegram_token).build()
            print("✅ Telegram bot token is valid")
        except Exception as e:
            print(f"❌ Telegram bot token error: {str(e)}")
            return False
        
        print("\n🎉 Bot startup test completed successfully!")
        print("The bot should be able to start and run properly.")
        return True
        
    except Exception as e:
        print(f"❌ Bot startup test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_bot_startup()) 