/**
 * Script to check existing attributes in a specific collection
 * This will help us understand what fields are available
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
const COLLECTION_ID = '6873f4f10034ced70a40'; // User Account collection

async function checkCollectionAttributes() {
  try {
    console.log('🔍 Checking collection attributes...');
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log(`Collection ID: ${COLLECTION_ID}`);
    
    // Get collection details
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    
    console.log('\n📋 Collection Details:');
    console.log(`Name: ${collection.name}`);
    console.log(`Total Documents: ${collection.documentsTotal}`);
    console.log(`Created: ${collection.$createdAt}`);
    console.log(`Updated: ${collection.$updatedAt}`);
    
    console.log('\n📊 Existing Attributes:');
    console.log('=====================================');
    
    if (collection.attributes && collection.attributes.length > 0) {
      collection.attributes.forEach((attr, index) => {
        console.log(`${index + 1}. ${attr.key}`);
        console.log(`   Type: ${attr.type}`);
        console.log(`   Required: ${attr.required}`);
        if (attr.size) console.log(`   Size: ${attr.size}`);
        if (attr.default !== undefined) console.log(`   Default: ${attr.default}`);
        console.log('   ---');
      });
    } else {
      console.log('No attributes found.');
    }
    
    console.log('\n🔗 Indexes:');
    console.log('=====================================');
    
    if (collection.indexes && collection.indexes.length > 0) {
      collection.indexes.forEach((index, i) => {
        console.log(`${i + 1}. ${index.key}`);
        console.log(`   Type: ${index.type}`);
        console.log(`   Attributes: ${index.attributes.join(', ')}`);
        console.log(`   Orders: ${index.orders.join(', ')}`);
        console.log('   ---');
      });
    } else {
      console.log('No indexes found.');
    }
    
  } catch (error) {
    console.error('❌ Error checking collection:', error.message);
  }
}

// Run the script
checkCollectionAttributes();

module.exports = { checkCollectionAttributes };
