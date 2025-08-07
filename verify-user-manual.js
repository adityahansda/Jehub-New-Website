const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

async function verifyUserManually(username) {
    console.log(`🔧 Manually verifying user: "${username}"\n`);

    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
    client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');
    client.setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
    const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members_collection';

    try {
        // Clean the telegram ID (remove @ if present)
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
        
        console.log(`Looking for user: "${cleanUsername}"`);

        // Find the user
        const response = await databases.listDocuments(
            databaseId,
            telegramMembersCollectionId,
            [Query.equal('username', cleanUsername)]
        );

        if (response.total === 0) {
            console.log('❌ User not found in database');
            console.log('\n💡 Available users:');
            
            // Show available usernames
            const allMembers = await databases.listDocuments(
                databaseId,
                telegramMembersCollectionId,
                [Query.limit(10)]
            );
            
            allMembers.documents.forEach((member, index) => {
                const verifiedStatus = member.is_wishlist_verified ? '✅' : '❌';
                console.log(`   ${index + 1}. @${member.username} - ${member.first_name} ${verifiedStatus}`);
            });
            
            return;
        }

        const member = response.documents[0];
        console.log(`\n👤 User found:`);
        console.log(`   Name: ${member.first_name} ${member.last_name || ''}`);
        console.log(`   Username: @${member.username}`);
        console.log(`   Status: ${member.status}`);
        console.log(`   Currently Verified: ${member.is_wishlist_verified || false}`);

        if (member.is_wishlist_verified) {
            console.log('\n✅ User is already verified!');
            return;
        }

        // Update the user to be verified
        console.log('\n🔄 Updating verification status...');
        
        const updatedData = {
            is_wishlist_verified: true,
            updated_at: new Date().toISOString()
        };

        await databases.updateDocument(
            databaseId,
            telegramMembersCollectionId,
            member.$id,
            updatedData
        );

        console.log('✅ User has been verified successfully!');
        console.log(`   ${member.first_name} (@${member.username}) can now access the beta program.`);

    } catch (error) {
        console.error('❌ Error occurred:');
        console.error(`Code: ${error.code}`);
        console.error(`Type: ${error.type}`);
        console.error(`Message: ${error.message}`);
    }
}

async function listAllUsers() {
    console.log('📋 Listing all Telegram members:\n');

    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
    client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');
    client.setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
    const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members_collection';

    try {
        const allMembers = await databases.listDocuments(
            databaseId,
            telegramMembersCollectionId,
            [Query.limit(25)]
        );

        console.log(`Total members: ${allMembers.total}\n`);

        allMembers.documents.forEach((member, index) => {
            const verifiedStatus = member.is_wishlist_verified ? '✅ VERIFIED' : '❌ NOT VERIFIED';
            console.log(`${index + 1}. @${member.username} - ${member.first_name} ${member.last_name || ''}`);
            console.log(`   Status: ${member.status} | ${verifiedStatus}`);
            console.log(`   Document ID: ${member.$id}`);
            console.log('   ' + '-'.repeat(60));
        });

    } catch (error) {
        console.error('❌ Error occurred:', error.message);
    }
}

// Get command line arguments
const command = process.argv[2];
const username = process.argv[3];

if (command === 'verify' && username) {
    verifyUserManually(username)
        .then(() => console.log('\n🏁 Verification completed'))
        .catch(error => {
            console.error('🚨 Fatal error:', error);
            process.exit(1);
        });
} else if (command === 'list') {
    listAllUsers()
        .then(() => console.log('\n🏁 Listing completed'))
        .catch(error => {
            console.error('🚨 Fatal error:', error);
            process.exit(1);
        });
} else {
    console.log('📘 Usage:');
    console.log('  node verify-user-manual.js list                    # List all users');
    console.log('  node verify-user-manual.js verify <username>       # Verify a specific user');
    console.log('');
    console.log('📘 Examples:');
    console.log('  node verify-user-manual.js list');
    console.log('  node verify-user-manual.js verify Siddh45th');
    console.log('  node verify-user-manual.js verify @Siddh45th');
}
