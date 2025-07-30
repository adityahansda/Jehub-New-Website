/**
 * Script to list all collections in the Appwrite database
 * This will show how many collections exist and their details
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

async function listAllCollections() {
  try {
    console.log('🔍 Fetching all collections from Appwrite database...');
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log('=====================================');
    
    // Get all collections
    const response = await databases.listCollections(DATABASE_ID);
    
    console.log(`\n📊 Total Collections Found: ${response.total}`);
    console.log('=====================================\n');
    
    if (response.collections && response.collections.length > 0) {
      response.collections.forEach((collection, index) => {
        console.log(`${index + 1}. Collection: ${collection.name}`);
        console.log(`   ID: ${collection.$id}`);
        console.log(`   Documents: ${collection.documentsTotal}`);
        console.log(`   Attributes: ${collection.attributes?.length || 0}`);
        console.log(`   Indexes: ${collection.indexes?.length || 0}`);
        console.log(`   Created: ${new Date(collection.$createdAt).toLocaleDateString()}`);
        console.log(`   Updated: ${new Date(collection.$updatedAt).toLocaleDateString()}`);
        console.log('   ---');
      });
      
      // Show collection IDs in a format for easy copying
      console.log('\n📋 Collection IDs (for easy copying):');
      console.log('=====================================');
      response.collections.forEach((collection) => {
        console.log(`${collection.name}: ${collection.$id}`);
      });
      
      // Compare with configured collections
      console.log('\n🔧 Configured Collections in appwriteConfig.ts:');
      console.log('=====================================');
      const configuredCollections = {
        'notes': process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID || '686d382f00119e0bf90b',
        'users': process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40',
        'activities': process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID || '6873f96f003939323c73',
        'reports': process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID || 'reports_collection_placeholder',
        'comments': process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID || '687f1e59000770d11274',
        'pageIndexing': process.env.NEXT_PUBLIC_APPWRITE_PAGE_INDEXING_COLLECTION_ID || 'page_indexing',
        'notifications': process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
        'shares': process.env.NEXT_PUBLIC_APPWRITE_SHARES_COLLECTION_ID || 'shares_collection_id',
      };
      
      Object.entries(configuredCollections).forEach(([name, id]) => {
        const exists = response.collections.find(col => col.$id === id);
        const status = exists ? '✅ EXISTS' : '❌ NOT FOUND';
        console.log(`${name}: ${id} ${status}`);
      });
      
    } else {
      console.log('No collections found in the database.');
    }
    
  } catch (error) {
    console.error('❌ Error fetching collections:', error.message);
    if (error.code === 401) {
      console.error('Make sure your APPWRITE_API_KEY is set correctly in .env file');
    }
  }
}

// Run the script
listAllCollections();

module.exports = { listAllCollections };
