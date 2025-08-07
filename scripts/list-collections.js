require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function listCollections() {
  try {
    console.log('Fetching collections...');
    
    const collections = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    
    console.log('Available Collections:');
    console.log('=====================');
    
    collections.collections.forEach(col => {
      console.log(`- ${col.name}: ${col.$id}`);
    });
    
    console.log('\n🎯 Looking for Telegram Members collection...');
    
    const telegramCollection = collections.collections.find(col => 
      col.name.toLowerCase().includes('telegram') || 
      col.name.toLowerCase().includes('member')
    );
    
    if (telegramCollection) {
      console.log(`✅ Found: ${telegramCollection.name} (${telegramCollection.$id})`);
      console.log('\nUpdate your .env file with:');
      console.log(`NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID=${telegramCollection.$id}`);
    } else {
      console.log('❌ No Telegram Members collection found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listCollections();
