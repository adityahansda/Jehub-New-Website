/**
 * Script to create the Telegram Members collection specifically
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

async function createTelegramMembersCollection() {
  try {
    console.log('🚀 Creating Telegram Members collection...\n');

    const collectionId = 'telegram_members';
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      collectionId,
      'Telegram Members',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    console.log('✅ Collection created:', collection.name);

    // Create attributes
    const attributes = [
      { key: 'username', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: false },
      { key: 'firstName', type: 'string', size: 255, required: false },
      { key: 'lastName', type: 'string', size: 255, required: false },
      { key: 'joinedAt', type: 'datetime', required: false },
      { key: 'is_wishlist_verified', type: 'boolean', required: false, default: false },
      { key: 'verifiedAt', type: 'datetime', required: false }
    ];

    for (const attr of attributes) {
      try {
        let attributeResult;
        
        switch (attr.type) {
          case 'string':
            attributeResult = await databases.createStringAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.size,
              attr.required,
              attr.default || null
            );
            break;
          case 'boolean':
            attributeResult = await databases.createBooleanAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required,
              attr.default || null
            );
            break;
          case 'datetime':
            attributeResult = await databases.createDatetimeAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required,
              attr.default || null
            );
            break;
          default:
            console.log(`⚠️  Unknown attribute type: ${attr.type}`);
            continue;
        }

        console.log(`  ✓ Added attribute: ${attr.key} (${attr.type})`);
      } catch (attrError) {
        console.log(`  ⚠️  Failed to create attribute ${attr.key}:`, attrError.message);
      }
    }

    console.log(`\n🎉 Telegram Members collection setup complete!`);
    
    // Add a test member for demonstration
    console.log('\n📝 Adding a test member...');
    try {
      const testMember = await databases.createDocument(
        DATABASE_ID,
        collectionId,
        ID.unique(),
        {
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          joinedAt: new Date().toISOString(),
          is_wishlist_verified: true,
          verifiedAt: new Date().toISOString()
        }
      );
      console.log('✅ Test member added:', testMember.username);
    } catch (docError) {
      console.log('⚠️  Failed to add test member:', docError.message);
    }

    console.log('\n📋 Next steps:');
    console.log('1. The telegram_members collection is now ready');
    console.log('2. You can now test the wishlist registration with username "testuser"');
    console.log('3. Set up your Telegram bot to populate this collection automatically');

  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️  Telegram Members collection already exists');
      
      // Try to add the test member even if collection exists
      try {
        const testMember = await databases.createDocument(
          DATABASE_ID,
          'telegram_members',
          ID.unique(),
          {
            username: 'testuser',
            firstName: 'Test', 
            lastName: 'User',
            joinedAt: new Date().toISOString(),
            is_wishlist_verified: true,
            verifiedAt: new Date().toISOString()
          }
        );
        console.log('✅ Test member added to existing collection:', testMember.username);
      } catch (docError) {
        console.log('⚠️  Test member may already exist or there was an error:', docError.message);
      }
    } else {
      console.error('❌ Error creating Telegram Members collection:', error.message);
    }
  }
}

// Run the script
createTelegramMembersCollection();
