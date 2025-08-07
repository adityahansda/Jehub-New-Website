const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

async function debugTelegramVerification() {
    console.log('🔍 Starting Telegram verification debug...\n');

    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
    client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');
    client.setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
    const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members_collection';

    console.log('📊 Configuration:');
    console.log(`Database ID: ${databaseId}`);
    console.log(`Collection ID: ${telegramMembersCollectionId}`);
    console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}\n`);

    try {
        console.log('🔎 Checking if collection exists...');
        
        // Try to list all documents
        const allMembers = await databases.listDocuments(
            databaseId,
            telegramMembersCollectionId,
            [Query.limit(25)] // Get first 25 members
        );

        console.log(`✅ Collection exists! Found ${allMembers.total} total members\n`);

        if (allMembers.total === 0) {
            console.log('⚠️ Collection is empty - no members found');
            console.log('This explains why verification is failing');
            return;
        }

        console.log('👥 First few members:');
        console.log('─'.repeat(80));
        
        allMembers.documents.forEach((member, index) => {
            console.log(`${index + 1}. Document ID: ${member.$id}`);
            console.log(`   User ID: ${member.user_id}`);
            console.log(`   Username: ${member.username || 'N/A'}`);
            console.log(`   First Name: ${member.first_name || 'N/A'}`);
            console.log(`   Last Name: ${member.last_name || 'N/A'}`);
            console.log(`   Status: ${member.status || 'N/A'}`);
            console.log(`   Is Wishlist Verified: ${member.is_wishlist_verified || false}`);
            console.log(`   Joined At: ${member.joined_at || 'N/A'}`);
            console.log(`   Updated At: ${member.updated_at || 'N/A'}`);
            console.log('─'.repeat(80));
        });

        // Test a specific username search
        console.log('\n🔍 Testing username search...');
        const testUsername = allMembers.documents[0]?.username;
        
        if (testUsername) {
            console.log(`Searching for username: "${testUsername}"`);
            
            const searchResult = await databases.listDocuments(
                databaseId,
                telegramMembersCollectionId,
                [Query.equal('username', testUsername)]
            );
            
            console.log(`Search result: Found ${searchResult.total} matches`);
            
            if (searchResult.total > 0) {
                const member = searchResult.documents[0];
                console.log('✅ Search successful!');
                console.log(`   Member: ${member.first_name} (@${member.username})`);
                console.log(`   Is Wishlist Verified: ${member.is_wishlist_verified || false}`);
            } else {
                console.log('❌ Search failed - no matches found');
            }
        }

        // Check verification status counts
        console.log('\n📈 Verification Statistics:');
        const verifiedMembers = allMembers.documents.filter(m => m.is_wishlist_verified === true);
        const unverifiedMembers = allMembers.documents.filter(m => m.is_wishlist_verified !== true);
        
        console.log(`   Total Members: ${allMembers.total}`);
        console.log(`   Verified Members: ${verifiedMembers.length}`);
        console.log(`   Unverified Members: ${unverifiedMembers.length}`);

        if (verifiedMembers.length > 0) {
            console.log('\n✅ Verified Members:');
            verifiedMembers.forEach((member, index) => {
                console.log(`   ${index + 1}. ${member.first_name} (@${member.username})`);
            });
        }

    } catch (error) {
        console.error('❌ Error occurred:');
        console.error(`Code: ${error.code}`);
        console.error(`Type: ${error.type}`);
        console.error(`Message: ${error.message}`);
        
        if (error.code === 404) {
            console.log('\n💡 The collection does not exist or the collection ID is incorrect.');
            console.log('Please check:');
            console.log('1. Collection ID in environment variables');
            console.log('2. Database ID in environment variables');
            console.log('3. API key permissions');
        }
    }
}

// Run the debug function
debugTelegramVerification()
    .then(() => console.log('\n🏁 Debug completed'))
    .catch(error => {
        console.error('🚨 Fatal error:', error);
        process.exit(1);
    });
