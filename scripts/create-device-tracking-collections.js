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

async function createDeviceTrackingCollections() {
    try {
        console.log('Creating device tracking collections...');

        // Create Device Tracking Collection
        const deviceTrackingCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Device Tracking',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );

        console.log('Device Tracking Collection created:', deviceTrackingCollection.$id);

        // Add attributes to Device Tracking Collection with delays
        console.log('Creating attributes for Device Tracking Collection...');
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'userId', 100, true);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'userEmail', 255, true);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'ipAddress', 45, true);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'userAgent', 512, true);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'fingerprint', 100, false);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'country', 100, false);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'city', 100, false);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'isp', 255, false);
        await delay(1000);
        await databases.createDatetimeAttribute(databaseId, deviceTrackingCollection.$id, 'firstSeen', true);
        await delay(1000);
        await databases.createDatetimeAttribute(databaseId, deviceTrackingCollection.$id, 'lastSeen', true);
        await delay(1000);
        await databases.createIntegerAttribute(databaseId, deviceTrackingCollection.$id, 'loginCount', true);
        await delay(1000);
        await databases.createBooleanAttribute(databaseId, deviceTrackingCollection.$id, 'isSuspicious', true, false);
        await delay(1000);
        await databases.createStringAttribute(databaseId, deviceTrackingCollection.$id, 'suspiciousReason', 255, false);
        await delay(1000);
        await databases.createDatetimeAttribute(databaseId, deviceTrackingCollection.$id, 'flaggedAt', false);
        await delay(1000);

        console.log('Device Tracking Collection attributes created');

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

        // Add attributes to Banned Devices Collection
        await databases.createStringAttribute(databaseId, bannedDevicesCollection.$id, 'ipAddress', 45, true);
        await databases.createStringAttribute(databaseId, bannedDevicesCollection.$id, 'reason', 255, true);
        await databases.createStringAttribute(databaseId, bannedDevicesCollection.$id, 'bannedBy', 100, true);
        await databases.createDatetimeAttribute(databaseId, bannedDevicesCollection.$id, 'bannedAt', true);
        await databases.createBooleanAttribute(databaseId, bannedDevicesCollection.$id, 'isActive', true, true);
        await databases.createStringAttribute(databaseId, bannedDevicesCollection.$id, 'userAgent', 512, false);
        await databases.createStringAttribute(databaseId, bannedDevicesCollection.$id, 'notes', 1000, false);
        await databases.createDatetimeAttribute(databaseId, bannedDevicesCollection.$id, 'unbannedAt', false);

        console.log('Banned Devices Collection attributes created');

        // Create indexes for better performance
        await databases.createIndex(databaseId, deviceTrackingCollection.$id, 'userId_index', 'key', ['userId']);
        await databases.createIndex(databaseId, deviceTrackingCollection.$id, 'ipAddress_index', 'key', ['ipAddress']);
        await databases.createIndex(databaseId, deviceTrackingCollection.$id, 'isSuspicious_index', 'key', ['isSuspicious']);
        await databases.createIndex(databaseId, deviceTrackingCollection.$id, 'lastSeen_index', 'key', ['lastSeen']);

        await databases.createIndex(databaseId, bannedDevicesCollection.$id, 'ipAddress_index', 'key', ['ipAddress']);
        await databases.createIndex(databaseId, bannedDevicesCollection.$id, 'isActive_index', 'key', ['isActive']);

        console.log('Indexes created successfully');

        console.log('\n=== IMPORTANT ===');
        console.log('Add these to your .env file:');
        console.log(`NEXT_PUBLIC_APPWRITE_DEVICE_TRACKING_COLLECTION_ID=${deviceTrackingCollection.$id}`);
        console.log(`NEXT_PUBLIC_APPWRITE_BANNED_DEVICES_COLLECTION_ID=${bannedDevicesCollection.$id}`);
        console.log('\n=== Collections Created Successfully ===');

    } catch (error) {
        console.error('Error creating collections:', error);
    }
}

// Run the script
createDeviceTrackingCollections();
