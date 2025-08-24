/**
 * Script to fix missing attributes in Study Bundles collection
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = 'study_bundles';

async function fixMissingAttributes() {
  try {
    console.log('🔧 Fixing missing attributes in Study Bundles collection...');
    
    // Missing attributes that need to be created
    const missingAttributes = [
      { key: 'price', type: 'float', required: true },
      { key: 'access', type: 'enum', elements: ['free', 'premium', 'purchase'], required: true },
      { key: 'notesCount', type: 'integer', required: true },
      { key: 'status', type: 'enum', elements: ['draft', 'published', 'archived'], required: true },
      { key: 'videos', type: 'string', size: 5000, required: false }
    ];

    for (const attr of missingAttributes) {
      try {
        let attribute;
        switch (attr.type) {
          case 'float':
            attribute = await databases.createFloatAttribute(
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
          case 'enum':
            attribute = await databases.createEnumAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.elements,
              attr.required
            );
            break;
          case 'string':
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.size,
              attr.required
            );
            break;
        }
        console.log(`✅ Created missing attribute: ${attr.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.message && error.message.includes('Attribute already exists')) {
          console.log(`⚠️ Attribute ${attr.key} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Wait for attributes to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create missing indexes
    const missingIndexes = [
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'access_idx', type: 'key', attributes: ['access'], orders: ['ASC'] },
      { key: 'price_idx', type: 'key', attributes: ['price'], orders: ['ASC'] },
      { key: 'category_status_idx', type: 'key', attributes: ['category', 'status'], orders: ['ASC', 'ASC'] },
      { key: 'access_status_idx', type: 'key', attributes: ['access', 'status'], orders: ['ASC', 'ASC'] }
    ];

    console.log('Creating missing indexes...');
    for (const index of missingIndexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`✅ Created missing index: ${index.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.message && error.message.includes('Index with the requested ID already exists')) {
          console.log(`⚠️ Index ${index.key} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating index ${index.key}:`, error.message);
        }
      }
    }

    console.log('✅ Missing attributes and indexes fix complete!');

  } catch (error) {
    console.error('❌ Error fixing missing attributes:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Fixing Study Bundles collection attributes...');
  await fixMissingAttributes();
  console.log('✅ Fix complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixMissingAttributes
};
