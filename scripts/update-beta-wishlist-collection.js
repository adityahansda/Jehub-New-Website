/**
 * Script to update the beta wishlist collection to match the registration form fields
 * This will add missing attributes that are used in the beta registration form
 */

const { Client, Databases, Permission, Role, ID } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration  
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = 'beta_wishlist_collection';

async function updateBetaWishlistCollection() {
  try {
    console.log('🚀 Updating Beta Wishlist collection attributes...\n');

    // Additional attributes needed for the registration form that might be missing
    const requiredAttributes = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'branch', type: 'string', size: 255, required: true },
      { key: 'yearsOfStudy', type: 'string', size: 50, required: true },
      { key: 'degree', type: 'string', size: 100, required: true },
      { key: 'collegeName', type: 'string', size: 500, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'telegramId', type: 'string', size: 255, required: true },
      { key: 'referCode', type: 'string', size: 100, required: false },
      { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'isPremium', type: 'boolean', required: false, default: false },
      { key: 'hidden', type: 'boolean', required: false, default: false },
    ];

    // First, get the current collection to see what attributes exist
    try {
      const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log(`📦 Found existing collection: ${collection.name}`);
      
      const existingAttributes = collection.attributes.map(attr => attr.key);
      console.log('🔍 Existing attributes:', existingAttributes.join(', '));
      
    } catch (error) {
      console.error('❌ Error getting collection:', error.message);
      return;
    }

    // Add missing attributes
    for (const attr of requiredAttributes) {
      try {
        let attributeResult;
        
        switch (attr.type) {
          case 'string':
            attributeResult = await databases.createStringAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.size,
              attr.required,
              attr.default || null
            );
            break;
          case 'integer':
            attributeResult = await databases.createIntegerAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required,
              null, // min
              null, // max
              attr.default || null
            );
            break;
          case 'boolean':
            attributeResult = await databases.createBooleanAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required,
              attr.default || null
            );
            break;
          case 'datetime':
            attributeResult = await databases.createDatetimeAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required,
              attr.default || null
            );
            break;
          default:
            console.log(`⚠️  Unknown attribute type: ${attr.type}`);
            continue;
        }

        console.log(`  ✅ Added attribute: ${attr.key} (${attr.type})`);
      } catch (attrError) {
        if (attrError.code === 409) {
          console.log(`  ℹ️  Attribute ${attr.key} already exists, skipping...`);
        } else {
          console.log(`  ⚠️  Failed to create attribute ${attr.key}:`, attrError.message);
        }
      }
    }

    console.log('\n🎉 Beta Wishlist collection update complete!');
    console.log('📝 The collection now supports all required fields for beta registration.');

  } catch (error) {
    console.error('❌ Error updating beta wishlist collection:', error);
    process.exit(1);
  }
}

// Run the script
updateBetaWishlistCollection();
