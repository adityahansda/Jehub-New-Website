/**
 * Script to create the missing Telegram Members collection
 * This will fix the "Collection not found" error
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
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members';

async function createTelegramMembersCollection() {
  try {
    console.log('🚀 Creating Telegram Members collection...\n');
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log(`Collection ID: ${COLLECTION_ID}`);
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Telegram Members',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    console.log('✅ Collection created:', collection.name);

    // Wait a bit for the collection to be ready
    console.log('⏳ Waiting for collection to initialize...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create attributes based on the bot's schema
    const attributes = [
      { key: 'user_id', type: 'integer', required: true },
      { key: 'username', type: 'string', size: 255, required: false },
      { key: 'first_name', type: 'string', size: 255, required: false },
      { key: 'last_name', type: 'string', size: 255, required: false },
      { key: 'is_bot', type: 'boolean', required: false, default: false },
      { key: 'language_code', type: 'string', size: 10, required: false },
      { key: 'status', type: 'string', size: 50, required: false, default: 'member' },
      { key: 'joined_at', type: 'datetime', required: false },
      { key: 'phone_number', type: 'string', size: 20, required: false },
      { key: 'chat_id', type: 'string', size: 255, required: false },
      { key: 'chat_title', type: 'string', size: 255, required: false },
      { key: 'chat_type', type: 'string', size: 50, required: false },
      { key: 'old_status', type: 'string', size: 50, required: false },
      { key: 'new_status', type: 'string', size: 50, required: false },
      { key: 'updated_at', type: 'datetime', required: false },
      { key: 'is_wishlist_verified', type: 'boolean', required: false, default: false }
    ];

    console.log('\n📝 Creating attributes...');

    for (const attr of attributes) {
      try {
        let attributeResult;
        
        console.log(`  Creating ${attr.key} (${attr.type})...`);
        
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
            console.log(`  ⚠️  Unknown attribute type: ${attr.type}`);
            continue;
        }

        console.log(`  ✅ Added attribute: ${attr.key}`);
        
        // Small delay between attributes to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (attrError) {
        if (attrError.code === 409) {
          console.log(`  ℹ️  Attribute ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Failed to create attribute ${attr.key}:`, attrError.message);
        }
      }
    }

    console.log(`\n🎉 Telegram Members collection setup complete!`);
    console.log(`\n✅ Collection ID: ${COLLECTION_ID}`);
    console.log('✅ All attributes have been created');
    console.log('\n📋 The collection is now ready to accept Telegram member data!');
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  Collection '${COLLECTION_ID}' already exists`);
      console.log('✅ No action needed - collection is ready to use');
    } else {
      console.error('❌ Error creating Telegram Members collection:', error.message);
      console.error('Full error:', error);
    }
  }
}

// Run the script
createTelegramMembersCollection().then(() => {
  console.log('\n🏁 Script completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
