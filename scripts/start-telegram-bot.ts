#!/usr/bin/env node

const dotenv = require('dotenv');
const telegramService = require('../src/services/telegramService').default;

// Load environment variables
dotenv.config();

async function startBot() {
  try {
    console.log('🤖 Starting Telegram Bot...');
    
    // Check if required environment variables are set
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
      process.exit(1);
    }
    
    if (!process.env.TELEGRAM_GROUP_CHAT_ID) {
      console.error('❌ TELEGRAM_GROUP_CHAT_ID is not set in .env file');
      console.log('ℹ️  To get your group chat ID:');
      console.log('   1. Add your bot to the group');
      console.log('   2. Send a message in the group');
      console.log('   3. Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates');
      console.log('   4. Look for "chat":{"id":-1001234567890} in the response');
      process.exit(1);
    }
    
    console.log('✅ Environment variables loaded');
    console.log(`🏠 Group Chat ID: ${process.env.TELEGRAM_GROUP_CHAT_ID}`);
    
    // Start the bot
    await telegramService.startBot();
    
    console.log('🚀 Telegram Bot is now running!');
    console.log('📊 The bot will automatically sync group member changes');
    console.log('🔄 To manually sync all members, you can call the sync API endpoint');
    
  } catch (error) {
    console.error('❌ Failed to start Telegram Bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Telegram Bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Telegram Bot...');
  process.exit(0);
});

// Start the bot
startBot();
