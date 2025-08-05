require('dotenv').config();
const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Appwrite configuration
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function createBannedDevicesCollection() {
    try {
        console.log('Creating Banned Devices Collection...');
        
        // Create Banned Devices Collection
        const bannedDevicesCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Banned Devices',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );

        console.log('Banned Devices Collection created:', bannedDevicesCollection.$id);

        // Add attributes to Banned Devices Collection with delays
        console.log('Creating attributes for Banned Devices Collection...');
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const attributes = [
            { name: 'ipAddress', type: 'string', size: 45, required: true },
            { name: 'reason', type: 'string', size: 255, required: true },
            { name: 'bannedBy', type: 'string', size: 100, required: true },
            { name: 'bannedAt', type: 'datetime', required: true },
            { name: 'isActive', type: 'boolean', required: true },
            { name: 'userAgent', type: 'string', size: 512, required: false },
            { name: 'notes', type: 'string', size: 1000, required: false },
            { name: 'unbannedAt', type: 'datetime', required: false }
        ];

        for (const attr of attributes) {
            try {
                console.log(`Creating attribute: ${attr.name}`);
                
                if (attr.type === 'string') {
                    await databases.createStringAttribute(databaseId, bannedDevicesCollection.$id, attr.name, attr.size, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(databaseId, bannedDevicesCollection.$id, attr.name, attr.required);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(databaseId, bannedDevicesCollection.$id, attr.name, attr.required);
                }
                
                console.log(`✓ Created attribute: ${attr.name}`);
                await delay(2000); // 2 second delay between attributes
            } catch (error) {
                console.log(`❌ Error creating attribute ${attr.name}:`, error.message);
                // Continue with next attribute
            }
        }

        console.log('Banned Devices Collection attributes created');

        // Create indexes for better performance
        console.log('Creating indexes...');
        await delay(2000);
        
        try {
            await databases.createIndex(databaseId, bannedDevicesCollection.$id, 'ipAddress_index', 'key', ['ipAddress']);
            console.log('✓ Created ipAddress index');
            await delay(2000);
        } catch (error) {
            console.log('❌ Error creating ipAddress index:', error.message);
        }

        try {
            await databases.createIndex(databaseId, bannedDevicesCollection.$id, 'isActive_index', 'key', ['isActive']);
            console.log('✓ Created isActive index');
        } catch (error) {
            console.log('❌ Error creating isActive index:', error.message);
        }

        console.log('\n=== IMPORTANT ===');
        console.log('Add this to your .env file:');
        console.log(`NEXT_PUBLIC_APPWRITE_BANNED_DEVICES_COLLECTION_ID=${bannedDevicesCollection.$id}`);
        console.log('\n✅ Banned Devices Collection Created Successfully ===');

    } catch (error) {
        console.error('Error creating Banned Devices Collection:', error);
    }
}

// Run the script
createBannedDevicesCollection();
