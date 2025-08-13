require('dotenv').config();
const { Client, Databases, Permission, Role } = require('node-appwrite');

// Appwrite configuration
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionId = 'likes_collection';

async function fixLikesCollectionPermissions() {
    try {
        console.log('Fixing likes collection permissions...');

        // Update collection permissions to allow proper access
        await databases.updateCollection(
            databaseId,
            collectionId,
            'Likes',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );

        console.log('Likes Collection permissions updated successfully!');
        console.log('Collection now allows read/write access for all users');

    } catch (error) {
        console.error('Error updating likes collection permissions:', error);
        
        if (error.code === 404) {
            console.log('Collection not found. Please run create-likes-collection.js first.');
        }
    }
}

fixLikesCollectionPermissions();
