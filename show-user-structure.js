const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

async function showUserStructure() {
    console.log('🔍 Showing complete user document structure...\n');

    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
    client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');
    client.setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
    const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members';

    try {
        // Get all members
        const allMembers = await databases.listDocuments(
            databaseId,
            telegramMembersCollectionId,
            [Query.limit(5)]
        );

        console.log(`Found ${allMembers.total} members\n`);

        allMembers.documents.forEach((member, index) => {
            console.log(`${index + 1}. Complete Document Structure:`);
            console.log(JSON.stringify(member, null, 2));
            console.log('\n' + '='.repeat(80) + '\n');
        });

    } catch (error) {
        console.error('❌ Error occurred:', error.message);
    }
}

// Run the script
showUserStructure()
    .then(() => console.log('\n🏁 Script completed'))
    .catch(error => {
        console.error('🚨 Fatal error:', error);
        process.exit(1);
    });
