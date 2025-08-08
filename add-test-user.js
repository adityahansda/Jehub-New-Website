const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

async function addTestUser() {
    console.log('🚀 Adding unverified test user...\n');

    // Initialize Appwrite client
    const client = new Client();
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
    client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');
    client.setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
    const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members';

    try {
        // Add unverified test user
        const testUser = {
            user_id: 999999999,
            username: 'testuser_unverified',
            first_name: 'Test',
            last_name: 'User Unverified',
            is_bot: false,
            language_code: 'en',
            joined_at: new Date().toISOString(),
            status: 'member',
            phone_number: '',
            chat_id: '-1002061803414',
            chat_title: 'Jharkhand Engineer\'s hub',
            chat_type: 'supergroup',
            old_status: 'unknown',
            new_status: 'member',
            updated_at: new Date().toISOString(),
            is_wishlist_verified: false, // This is the key - NOT verified
            display_name: null
        };

        const result = await databases.createDocument(
            databaseId,
            telegramMembersCollectionId,
            ID.unique(),
            testUser
        );

        console.log('✅ Test user added successfully!');
        console.log(`   Name: ${testUser.first_name} ${testUser.last_name}`);
        console.log(`   Username: @${testUser.username}`);
        console.log(`   Status: ${testUser.status}`);
        console.log(`   Is Active: ${testUser.is_active}`);
        console.log(`   Is Wishlist Verified: ${testUser.is_wishlist_verified}`);
        console.log(`   Document ID: ${result.$id}\n`);
        
        console.log('🧪 You can now test with:');
        console.log('   node test-verification.js testuser_unverified');
        console.log('   Expected result: User is member but not verified');

    } catch (error) {
        console.error('❌ Error adding test user:', error.message);
        if (error.code === 409) {
            console.log('ℹ️ Test user might already exist');
        }
    }
}

// Run the script
addTestUser()
    .then(() => console.log('\n🏁 Script completed'))
    .catch(error => {
        console.error('🚨 Fatal error:', error);
        process.exit(1);
    });
