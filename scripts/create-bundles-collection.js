/**
 * Script to create Study Bundles collection with proper schema
 * Based on the current bundle data model from the codebase
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = 'study_bundles';

async function createStudyBundlesCollection() {
  try {
    console.log('🚀 Creating Study Bundles collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Study Bundles',
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Study Bundles collection created:', collection.name);

    // Define attributes based on current bundle data model
    const attributes = [
      // Core bundle information
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'level', type: 'string', size: 50, required: false }, // Beginner, Intermediate, Advanced
      { key: 'duration', type: 'string', size: 50, required: false }, // e.g., "6 weeks"
      { key: 'instructor', type: 'string', size: 255, required: false },
      { key: 'tags', type: 'string', size: 100, required: false, array: true },
      
      // Pricing and access
      { key: 'price', type: 'float', required: true }, // 0 for free bundles
      { key: 'originalPrice', type: 'float', required: false },
      { key: 'discount', type: 'integer', required: false }, // Percentage discount
      { key: 'access', type: 'string', size: 20, required: true }, // free, premium, purchase
      
      // Content counts
      { key: 'notesCount', type: 'integer', required: true },
      { key: 'videosCount', type: 'integer', required: false },
      
      // Statistics
      { key: 'totalDownloads', type: 'integer', required: false },
      { key: 'totalSales', type: 'integer', required: false },
      { key: 'revenue', type: 'float', required: false },
      { key: 'rating', type: 'float', required: false }, // Average rating
      { key: 'reviews', type: 'integer', required: false }, // Number of reviews
      { key: 'views', type: 'integer', required: false },
      
      // Bundle status and metadata
      { key: 'status', type: 'string', size: 20, required: true }, // draft, published, archived
      { key: 'isPopular', type: 'boolean', required: false },
      { key: 'thumbnail', type: 'string', size: 512, required: false }, // URL to thumbnail image
      
      // Bundle content (stored as JSON strings)
      { key: 'notes', type: 'string', size: 10000, required: false }, // JSON array of note objects
      { key: 'videos', type: 'string', size: 5000, required: false }, // JSON array of video objects
      
      // Creator information
      { key: 'createdBy', type: 'string', size: 255, required: false }, // User ID of creator
      { key: 'createdAt', type: 'datetime', required: false },
      { key: 'updatedAt', type: 'datetime', required: false }
    ];

    console.log('Creating bundle attributes...');
    for (const attr of attributes) {
      try {
        let attribute;
        switch (attr.type) {
          case 'string':
            if (attr.key === 'status') {
              // Create enum for status field
              attribute = await databases.createEnumAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr.key,
                ['draft', 'published', 'archived'],
                attr.required,
                'published'
              );
            } else if (attr.key === 'access') {
              // Create enum for access field
              attribute = await databases.createEnumAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr.key,
                ['free', 'premium', 'purchase'],
                attr.required,
                'free'
              );
            } else if (attr.key === 'level') {
              // Create enum for level field
              attribute = await databases.createEnumAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr.key,
                ['Beginner', 'Intermediate', 'Advanced'],
                attr.required
              );
            } else {
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr.key,
                attr.size,
                attr.required,
                null,
                attr.array || false
              );
            }
            break;
          case 'integer':
            attribute = await databases.createIntegerAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required,
              null,
              null,
              attr.key === 'notesCount' || attr.key === 'totalDownloads' || attr.key === 'totalSales' || attr.key === 'reviews' || attr.key === 'views' ? 0 : null
            );
            break;
          case 'float':
            attribute = await databases.createFloatAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required,
              null,
              null,
              attr.key === 'price' ? 0.0 : null
            );
            break;
          case 'boolean':
            attribute = await databases.createBooleanAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required,
              false
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
        console.log(`✅ Created attribute: ${attr.key}`);
        // Wait between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    // Wait for attributes to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create indexes for better performance
    const indexes = [
      { key: 'title_idx', type: 'key', attributes: ['title'], orders: ['ASC'] },
      { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'access_idx', type: 'key', attributes: ['access'], orders: ['ASC'] },
      { key: 'price_idx', type: 'key', attributes: ['price'], orders: ['ASC'] },
      { key: 'rating_idx', type: 'key', attributes: ['rating'], orders: ['DESC'] },
      { key: 'popular_idx', type: 'key', attributes: ['isPopular'], orders: ['DESC'] },
      { key: 'downloads_idx', type: 'key', attributes: ['totalDownloads'], orders: ['DESC'] },
      { key: 'created_at_idx', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
      { key: 'updated_at_idx', type: 'key', attributes: ['$updatedAt'], orders: ['DESC'] },
      { key: 'category_status_idx', type: 'key', attributes: ['category', 'status'], orders: ['ASC', 'ASC'] },
      { key: 'access_status_idx', type: 'key', attributes: ['access', 'status'], orders: ['ASC', 'ASC'] },
      { key: 'search_idx', type: 'fulltext', attributes: ['title', 'description'], orders: ['ASC', 'ASC'] }
    ];

    console.log('Creating bundle indexes...');
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
        console.log(`✅ Created index: ${index.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating index ${index.key}:`, error.message);
      }
    }

    console.log('✅ Study Bundles collection setup complete!');
    return COLLECTION_ID;

  } catch (error) {
    console.error('❌ Error creating Study Bundles collection:', error);
    throw error;
  }
}

async function checkCollectionExists(collectionId) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up Study Bundles collection...');
  
  // Check if collection already exists
  const bundlesExists = await checkCollectionExists(COLLECTION_ID);
  if (bundlesExists) {
    console.log('⚠️ Study Bundles collection already exists');
    console.log('If you want to recreate it, please delete the existing collection first.');
    return;
  }
  
  await createStudyBundlesCollection();
  console.log('✅ Setup complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createStudyBundlesCollection,
  COLLECTION_ID
};
