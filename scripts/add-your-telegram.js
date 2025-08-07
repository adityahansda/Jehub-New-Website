require('dotenv').config();
const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addYourTelegram() {
  try {
    console.log('🔗 Adding your Telegram username to the database...');
    
    // Replace 'your_actual_username' with your real Telegram username (without @)
    const yourTelegramUsername = 'your_actual_username'; // Change this!
    
    if (yourTelegramUsername === 'your_actual_username') {
      console.log('❌ Please edit this script and replace "your_actual_username" with your actual Telegram username');
      console.log('For example, if your Telegram is @john_doe, use "john_doe"');
      return;
    }
    
    const member = {
      username: yourTelegramUsername,
      userId: '999999999', // Fake user ID for testing
      firstName: 'Your Name',
      lastName: 'Test',
      joinedAt: new Date().toISOString(),
      is_wishlist_verified: true,
      verifiedAt: new Date().toISOString()
    };

    const result = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID,
      ID.unique(),
      member
    );
    
    console.log(`✅ Successfully added @${yourTelegramUsername} as verified member!`);
    console.log(`Document ID: ${result.$id}`);
    console.log('\n🎉 You can now use your Telegram username in the beta wishlist form!');
    console.log(`Go to: http://localhost:3000/beta-wishlist`);
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Username @${yourTelegramUsername} already exists in the database`);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

addYourTelegram();
