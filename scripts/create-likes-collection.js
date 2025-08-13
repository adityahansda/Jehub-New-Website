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

async function createLikesCollection() {
    try {
        console.log('Creating likes collection...');

        // Create Likes Collection
        const likesCollection = await databases.createCollection(
            databaseId,
            'likes_collection', // Use the exact ID from environment
            'Likes',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        console.log('Likes Collection created:', likesCollection.$id);

        // Add attributes to Likes Collection with delays
        console.log('Creating attributes for Likes Collection...');
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        await databases.createStringAttribute(databaseId, likesCollection.$id, 'userId', 100, true);
        await delay(1000);
        await databases.createStringAttribute(databaseId, likesCollection.$id, 'userEmail', 255, true);
        await delay(1000);
        await databases.createStringAttribute(databaseId, likesCollection.$id, 'noteId', 100, true);
        await delay(1000);
        await databases.createDatetimeAttribute(databaseId, likesCollection.$id, 'likedAt', true);
        await delay(1000);

        console.log('Likes Collection attributes created');

        // Create indexes for better performance
        await databases.createIndex(databaseId, likesCollection.$id, 'userId_index', 'key', ['userId']);
        await databases.createIndex(databaseId, likesCollection.$id, 'noteId_index', 'key', ['noteId']);
        await databases.createIndex(databaseId, likesCollection.$id, 'userNote_index', 'key', ['userId', 'noteId']);
        await databases.createIndex(databaseId, likesCollection.$id, 'likedAt_index', 'key', ['likedAt']);

        console.log('Likes Collection indexes created');

        // Update environment file with the actual collection ID
        console.log('\nCollection created successfully!');
        console.log('Collection ID:', likesCollection.$id);
        console.log('You may want to update your .env file with this ID if it differs from "likes_collection"');

    } catch (error) {
        console.error('Error creating likes collection:', error);
        
        if (error.code === 409) {
            console.log('Collection already exists. Checking if we can use it...');
            try {
                const existingCollection = await databases.getCollection(databaseId, 'likes_collection');
                console.log('Existing collection found:', existingCollection.$id);
                console.log('Collection name:', existingCollection.name);
            } catch (getError) {
                console.error('Error getting existing collection:', getError);
            }
        }
    }
}

createLikesCollection();
