/**
 * Script to create missing collections for templates and settings
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

async function createTemplatesCollection() {
  const COLLECTION_ID = 'share_templates';
  
  try {
    console.log('Creating templates collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Share Templates',
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Templates collection created:', collection.name);

    // Create attributes
    const attributes = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'platforms', type: 'string', size: 500, required: false }, // JSON array as string
      { key: 'isActive', type: 'boolean', required: true },
      { key: 'isDefault', type: 'boolean', required: true },
      { key: 'createdAt', type: 'datetime', required: false },
      { key: 'updatedAt', type: 'datetime', required: false }
    ];

    console.log('Creating template attributes...');
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    // Wait for attributes to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    const indexes = [
      { key: 'name_idx', type: 'key', attributes: ['name'], orders: ['ASC'] },
      { key: 'isActive_idx', type: 'key', attributes: ['isActive'], orders: ['ASC'] },
      { key: 'isDefault_idx', type: 'key', attributes: ['isDefault'], orders: ['ASC'] },
      { key: 'createdAt_idx', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] }
    ];

    console.log('Creating template indexes...');
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

    return COLLECTION_ID;
  } catch (error) {
    console.error('❌ Error creating templates collection:', error);
    return null;
  }
}

async function createSettingsCollection() {
  const COLLECTION_ID = 'settings';
  
  try {
    console.log('Creating settings collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'App Settings',
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Settings collection created:', collection.name);

    // Create attributes
    const attributes = [
      { key: 'key', type: 'string', size: 255, required: true },
      { key: 'value', type: 'string', size: 5000, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'createdAt', type: 'datetime', required: false },
      { key: 'updatedAt', type: 'datetime', required: false }
    ];

    console.log('Creating settings attributes...');
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    // Wait for attributes to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    const indexes = [
      { key: 'key_idx', type: 'unique', attributes: ['key'], orders: ['ASC'] },
      { key: 'type_idx', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'createdAt_idx', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] }
    ];

    console.log('Creating settings indexes...');
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

    return COLLECTION_ID;
  } catch (error) {
    console.error('❌ Error creating settings collection:', error);
    return null;
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
  console.log('🚀 Setting up missing collections...');
  
  // Check and create templates collection
  const templatesExists = await checkCollectionExists('share_templates');
  if (!templatesExists) {
    await createTemplatesCollection();
  } else {
    console.log('⚠️ Templates collection already exists');
  }
  
  // Check and create settings collection
  const settingsExists = await checkCollectionExists('settings');
  if (!settingsExists) {
    await createSettingsCollection();
  } else {
    console.log('⚠️ Settings collection already exists');
  }
  
  console.log('✅ Collection setup complete!');
}

main().catch(console.error);
