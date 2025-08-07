require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixBannedDevicesCollection() {
  try {
    console.log('🔧 Fixing banned devices collection...');
    
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = 'banned_devices_collection';
    
    console.log(`Database ID: ${databaseId}`);
    console.log(`Collection ID: ${collectionId}`);
    
    // Add the missing isActive attribute
    try {
      console.log('Adding isActive boolean attribute...');
      
      await databases.createBooleanAttribute(
        databaseId,
        collectionId,
        'isActive',
        false, // not required
        true   // default value
      );
      
      console.log('✅ Successfully added isActive attribute');
      
      // Wait a moment for the attribute to be ready
      console.log('⏳ Waiting for attribute to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (attrError) {
      if (attrError.code === 409) {
        console.log('⚠️ isActive attribute already exists');
      } else {
        throw attrError;
      }
    }
    
    console.log('🎉 Banned devices collection is now properly configured!');
    
  } catch (error) {
    console.error('❌ Error fixing banned devices collection:', error.message);
  }
}

fixBannedDevicesCollection();
