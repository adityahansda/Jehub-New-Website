/**
 * Script to create missing Appwrite collections
 * This will create all the collections that are referenced in the code but missing from the database
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

async function createCollections() {
  try {
    console.log('🚀 Starting collection creation...\n');

    // Collection definitions
    const collections = [
      {
        id: 'device_tracking_collection',
        name: 'Device Tracking',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'userId', type: 'string', size: 255, required: true },
          { key: 'userEmail', type: 'string', size: 255, required: true },
          { key: 'ipAddress', type: 'string', size: 45, required: true },
          { key: 'userAgent', type: 'string', size: 1000, required: false },
          { key: 'fingerprint', type: 'string', size: 255, required: false },
          { key: 'firstSeen', type: 'datetime', required: true },
          { key: 'lastSeen', type: 'datetime', required: true },
          { key: 'loginCount', type: 'integer', required: false, default: 1 },
          { key: 'isSuspicious', type: 'boolean', required: false, default: false },
          { key: 'suspiciousReason', type: 'string', size: 500, required: false },
          { key: 'flaggedAt', type: 'datetime', required: false }
        ]
      },
      {
        id: 'banned_devices_collection',
        name: 'Banned Devices',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'ipAddress', type: 'string', size: 45, required: true },
          { key: 'reason', type: 'string', size: 500, required: true },
          { key: 'bannedBy', type: 'string', size: 255, required: true },
          { key: 'bannedAt', type: 'datetime', required: true },
          { key: 'isActive', type: 'boolean', required: true, default: true },
          { key: 'unbannedAt', type: 'datetime', required: false }
        ]
      },
      {
        id: 'telegram_members_collection',
        name: 'Telegram Members',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'username', type: 'string', size: 255, required: true },
          { key: 'userId', type: 'string', size: 255, required: false },
          { key: 'firstName', type: 'string', size: 255, required: false },
          { key: 'lastName', type: 'string', size: 255, required: false },
          { key: 'joinedAt', type: 'datetime', required: false },
          { key: 'is_wishlist_verified', type: 'boolean', required: false, default: false },
          { key: 'verifiedAt', type: 'datetime', required: false }
        ]
      },
      {
        id: 'notifications',
        name: 'Notifications',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'title', type: 'string', size: 255, required: true },
          { key: 'message', type: 'string', size: 1000, required: true },
          { key: 'type', type: 'string', size: 50, required: false, default: 'info' },
          { key: 'userId', type: 'string', size: 255, required: false },
          { key: 'isRead', type: 'boolean', required: false, default: false },
          { key: 'isGlobal', type: 'boolean', required: false, default: false },
          { key: 'createdBy', type: 'string', size: 255, required: false }
        ]
      },
      {
        id: 'shares_collection_id',
        name: 'Shares',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'noteId', type: 'string', size: 255, required: true },
          { key: 'userId', type: 'string', size: 255, required: true },
          { key: 'sharedWith', type: 'string', size: 255, required: false },
          { key: 'shareType', type: 'string', size: 50, required: false, default: 'public' },
          { key: 'shareUrl', type: 'string', size: 500, required: false },
          { key: 'sharedAt', type: 'datetime', required: true }
        ]
      },
      {
        id: 'beta_wishlist_collection',
        name: 'Beta Wishlist',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'email', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: false },
          { key: 'phone', type: 'string', size: 20, required: false },
          { key: 'college', type: 'string', size: 255, required: false },
          { key: 'year', type: 'string', size: 10, required: false },
          { key: 'course', type: 'string', size: 255, required: false },
          { key: 'telegramUsername', type: 'string', size: 255, required: false },
          { key: 'isVerified', type: 'boolean', required: false, default: false },
          { key: 'verifiedAt', type: 'datetime', required: false },
          { key: 'joinedAt', type: 'datetime', required: true }
        ]
      },
      {
        id: 'reports_collection_placeholder',
        name: 'Reports',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'reporterId', type: 'string', size: 255, required: true },
          { key: 'reportedItemId', type: 'string', size: 255, required: true },
          { key: 'reportedItemType', type: 'string', size: 50, required: true },
          { key: 'reason', type: 'string', size: 500, required: true },
          { key: 'description', type: 'string', size: 1000, required: false },
          { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
          { key: 'reviewedBy', type: 'string', size: 255, required: false },
          { key: 'reviewedAt', type: 'datetime', required: false }
        ]
      },
      {
        id: 'page_indexing',
        name: 'Page Indexing',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'url', type: 'string', size: 500, required: true },
          { key: 'title', type: 'string', size: 255, required: false },
          { key: 'description', type: 'string', size: 1000, required: false },
          { key: 'keywords', type: 'string', size: 1000, required: false },
          { key: 'content', type: 'string', size: 10000, required: false },
          { key: 'lastIndexed', type: 'datetime', required: true },
          { key: 'isActive', type: 'boolean', required: false, default: true }
        ]
      },
      {
        id: 'unban_requests_collection',
        name: 'Unban Requests',
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        attributes: [
          { key: 'ipAddress', type: 'string', size: 45, required: true },
          { key: 'email', type: 'string', size: 255, required: false },
          { key: 'reason', type: 'string', size: 1000, required: true },
          { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
          { key: 'requestedAt', type: 'datetime', required: true },
          { key: 'reviewedBy', type: 'string', size: 255, required: false },
          { key: 'reviewedAt', type: 'datetime', required: false }
        ]
      }
    ];

    for (const collection of collections) {
      try {
        console.log(`📦 Creating collection: ${collection.name} (${collection.id})`);
        
        // Create the collection
        const createdCollection = await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          collection.permissions
        );

        console.log(`✅ Collection created: ${createdCollection.name}`);

        // Create attributes
        for (const attr of collection.attributes) {
          try {
            let attributeResult;
            
            switch (attr.type) {
              case 'string':
                attributeResult = await databases.createStringAttribute(
                  DATABASE_ID,
                  collection.id,
                  attr.key,
                  attr.size,
                  attr.required,
                  attr.default || null
                );
                break;
              case 'integer':
                attributeResult = await databases.createIntegerAttribute(
                  DATABASE_ID,
                  collection.id,
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
                  collection.id,
                  attr.key,
                  attr.required,
                  attr.default || null
                );
                break;
              case 'datetime':
                attributeResult = await databases.createDatetimeAttribute(
                  DATABASE_ID,
                  collection.id,
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

        console.log(`🎉 Collection ${collection.name} setup complete!\n`);

      } catch (error) {
        if (error.code === 409) {
          console.log(`  ℹ️  Collection ${collection.name} already exists, skipping...\n`);
        } else {
          console.error(`  ❌ Failed to create collection ${collection.name}:`, error.message, '\n');
        }
      }
    }

    console.log('🎉 All collections setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env.local with the actual collection IDs if needed');
    console.log('2. Uncomment the IP ban checking in middleware.ts');
    console.log('3. Set up your APPWRITE_API_KEY in .env.local for server-side operations');

  } catch (error) {
    console.error('❌ Error setting up collections:', error);
    process.exit(1);
  }
}

// Run the script
createCollections();
