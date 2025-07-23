const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection configuration
const collections = {
    notes: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID,
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    activities: process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID,
    comments: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID
};

// Monitor current index usage and performance
async function monitorIndexes() {
    console.log('🔍 Monitoring Appwrite Indexes');
    console.log('====================================\n');

    for (const [collectionName, collectionId] of Object.entries(collections)) {
        if (!collectionId) continue;

        try {
            const collection = await databases.getCollection(databaseId, collectionId);
            const indexes = collection.indexes || [];
            console.log(`📊 ${collectionName}: ${indexes.length} indexes active`);

            indexes.forEach(index => {
                console.log(`   - ${index.key}: Type ${index.type}, Fields ${index.attributes.join(', ')}`);
            });

        } catch (error) {
            console.log(`❌ Could not access ${collectionName}: ${error.message}`);
        }
        console.log(''); // New line after each collection
    }

    console.log('🏁 Monitoring completed!');
    console.log('====================================\n');
}

// Execute if run directly
if (require.main === module) {
    monitorIndexes();
}

module.exports = {
    monitorIndexes
};
