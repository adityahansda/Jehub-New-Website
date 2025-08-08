const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

async function testVerification(testUsername) {
    console.log(`🔍 Testing verification for username: "${testUsername}"\n`);

    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
    client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');
    client.setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
    const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members';

    try {
        // Clean the telegram ID (remove @ if present)
        const cleanTelegramId = testUsername.startsWith('@') ? testUsername.substring(1) : testUsername;
        
        console.log(`Original input: "${testUsername}"`);
        console.log(`Cleaned username: "${cleanTelegramId}"`);
        console.log(`Collection ID: ${telegramMembersCollectionId}\n`);

        // Direct database query
        const response = await databases.listDocuments(
            databaseId,
            telegramMembersCollectionId,
            [Query.equal('username', cleanTelegramId)]
        );

        console.log(`Query result: Found ${response.total} matches`);

        if (response.total === 0) {
            console.log('❌ User not found in database');
            console.log('\n💡 Available usernames in database:');
            
            // Show available usernames
            const allMembers = await databases.listDocuments(
                databaseId,
                telegramMembersCollectionId,
                [Query.limit(10)]
            );
            
            allMembers.documents.forEach((member, index) => {
                console.log(`   ${index + 1}. ${member.username} (${member.first_name})`);
            });
            
            return {
                isVerified: false,
                message: '❌ Not a member. Please join our Telegram group first: https://t.me/JharkhandEnginnersHub'
            };
        }

        const member = response.documents[0];
        console.log(`\n✅ User found!`);
        console.log(`   Name: ${member.first_name} ${member.last_name || ''}`);
        console.log(`   Username: @${member.username}`);
        console.log(`   Status: ${member.status}`);
        console.log(`   Is Wishlist Verified: ${member.is_wishlist_verified}`);

        if (!member) {
            console.log('❌ Member data not found in documents');
            return {
                isVerified: false,
                message: 'Member data not found. Please try again.'
            };
        }

        // Check if the user is verified
        const isVerified = member.is_wishlist_verified || false;
        console.log(`\n🔍 Verification check: ${isVerified}`);

        if (!isVerified) {
            console.log('⚠️ User is a member but not verified');
            return {
                isVerified: false,
                message: '⚠️ You are a member but not yet verified. Please use the /verify command in the Telegram group and try again.'
            };
        }

        console.log('🎉 User is fully verified!');
        return {
            isVerified: true,
            message: '✅ Telegram verification successful!'
        };

    } catch (error) {
        console.error('❌ Error occurred:');
        console.error(`Code: ${error.code}`);
        console.error(`Type: ${error.type}`);
        console.error(`Message: ${error.message}`);
        
        return {
            isVerified: false,
            message: 'Error verifying Telegram membership. Please try again or contact support.'
        };
    }
}

// Test with different usernames
async function runTests() {
    console.log('🚀 Starting verification tests...\n');
    
    const testUsernames = [
        'adityahansda',    // Known verified user
        '@adityahansda',   // Same user with @
        'Siddh45th',       // Known unverified user  
        '@Siddh45th',      // Same user with @
        'nonexistent'      // Non-existent user
    ];

    for (const username of testUsernames) {
        console.log('='.repeat(80));
        const result = await testVerification(username);
        console.log(`\n🎯 Result: ${result.message}\n`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
    }
}

// Get username from command line argument or run all tests
const testUsername = process.argv[2];

if (testUsername) {
    testVerification(testUsername)
        .then(result => {
            console.log('\n🏁 Test completed');
            console.log(`Final result: ${result.message}`);
        })
        .catch(error => {
            console.error('🚨 Fatal error:', error);
            process.exit(1);
        });
} else {
    runTests()
        .then(() => console.log('\n🏁 All tests completed'))
        .catch(error => {
            console.error('🚨 Fatal error:', error);
            process.exit(1);
        });
}
