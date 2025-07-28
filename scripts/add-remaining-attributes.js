/**
 * Script to add the remaining missing attributes (phone and pincode)
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';

async function addRemainingAttributes() {
  try {
    console.log('🔧 Adding remaining missing attributes...');
    
    const remainingAttributes = [
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'pincode', type: 'string', size: 10, required: false }
    ];

    for (const attr of remainingAttributes) {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`✅ Added attribute: ${attr.key}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error adding attribute ${attr.key}:`, error.message);
      }
    }
    
    // Wait and add phone index
    console.log('⏳ Waiting before adding phone index...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        'phone_idx',
        'key',
        ['phone'],
        ['ASC']
      );
      console.log('✅ Added phone index');
    } catch (error) {
      console.error('❌ Error adding phone index:', error.message);
    }
    
    console.log('🎉 Remaining attributes added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addRemainingAttributes();
