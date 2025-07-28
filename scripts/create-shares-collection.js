/**
 * Script to create the shares collection in Appwrite
 * Run this script to set up the shares collection with proper attributes and indexes
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY); // You need to add this to your .env file

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = 'shares_collection_id'; // You can change this to match your preference

async function createSharesCollection() {
  try {
    console.log('Creating shares collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'shares',
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('Collection created:', collection.name);

    // Create attributes
    const attributes = [
      { key: 'shareId', type: 'string', size: 255, required: true },
      { key: 'resourceType', type: 'string', size: 50, required: true },
      { key: 'resourceId', type: 'string', size: 255, required: true },
      { key: 'resourceTitle', type: 'string', size: 500, required: true },
      { key: 'resourceUrl', type: 'string', size: 1000, required: true },
      { key: 'sharerId', type: 'string', size: 255, required: true },
      { key: 'sharerName', type: 'string', size: 255, required: true },
      { key: 'sharerEmail', type: 'string', size: 255, required: false },
      { key: 'platform', type: 'string', size: 50, required: true },
      { key: 'shareMessage', type: 'string', size: 2000, required: true },
      { key: 'customData', type: 'string', size: 5000, required: false }, // JSON string
      { key: 'isPublic', type: 'boolean', required: true },
      { key: 'expiresAt', type: 'datetime', required: false },
      { key: 'accessCount', type: 'integer', required: true },
      { key: 'lastAccessedAt', type: 'datetime', required: false },
      { key: 'tags', type: 'string', size: 1000, required: false }, // JSON array as string
      { key: 'status', type: 'string', size: 20, required: true }
    ];

    console.log('Creating attributes...');
    for (const attr of attributes) {
      try {
        let attribute;
        switch (attr.type) {
          case 'string':
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.size,
              attr.required
            );
            break;
          case 'boolean':
            attribute = await databases.createBooleanAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
          case 'integer':
            attribute = await databases.createIntegerAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
          case 'datetime':
            attribute = await databases.createDatetimeAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
        }
        console.log(`✓ Created attribute: ${attr.key}`);
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`✗ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    // Wait for attributes to be ready
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create indexes
    const indexes = [
      { key: 'shareId_idx', type: 'key', attributes: ['shareId'], orders: ['ASC'] },
      { key: 'sharerId_idx', type: 'key', attributes: ['sharerId'], orders: ['ASC'] },
      { key: 'resourceId_idx', type: 'key', attributes: ['resourceId'], orders: ['ASC'] },
      { key: 'platform_idx', type: 'key', attributes: ['platform'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'createdAt_idx', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
      { key: 'expiresAt_idx', type: 'key', attributes: ['expiresAt'], orders: ['ASC'] },
      { key: 'isPublic_idx', type: 'key', attributes: ['isPublic'], orders: ['ASC'] }
    ];

    console.log('Creating indexes...');
    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`✓ Created index: ${index.key}`);
        
        // Wait a bit between index creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`✗ Error creating index ${index.key}:`, error.message);
      }
    }

    console.log('✅ Shares collection setup complete!');
    console.log(`Collection ID: ${COLLECTION_ID}`);
    console.log('Remember to update your .env file with the collection ID if needed:');
    console.log(`NEXT_PUBLIC_APPWRITE_SHARES_COLLECTION_ID=${COLLECTION_ID}`);

  } catch (error) {
    console.error('❌ Error creating shares collection:', error);
  }
}

// Function to check if collection exists
async function checkCollectionExists() {
  try {
    await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Setting up shares collection for custom sharing feature...');
  
  const exists = await checkCollectionExists();
  if (exists) {
    console.log('⚠️  Collection already exists. Skipping creation.');
    return;
  }

  await createSharesCollection();
}

// Run the script
main().catch(console.error);

module.exports = { createSharesCollection, checkCollectionExists };
