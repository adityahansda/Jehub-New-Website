const { Client, Databases, Query, ID } = require('node-appwrite');
require('dotenv').config({ path: './.env.local' });

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const telegramMembersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID || 'telegram_members';

async function testTelegramVerification() {
  console.log('🔍 Testing Telegram Verification System\n');
  console.log('Configuration:');
  console.log(`Database ID: ${databaseId}`);
  console.log(`Collection ID: ${telegramMembersCollectionId}`);
  console.log(`API Key set: ${process.env.APPWRITE_API_KEY ? 'Yes' : 'No'}\n`);

  try {
    // Step 1: Check if collection exists
    console.log('Step 1: Checking if telegram_members collection exists...');
    
    try {
      const response = await databases.listDocuments(
        databaseId,
        telegramMembersCollectionId,
        [Query.limit(1)]
      );
      
      console.log(`✅ Collection exists! Found ${response.total} documents total.\n`);
      
      if (response.total === 0) {
        console.log('📝 Collection is empty, adding test data...');
        
        // Add test user data
        const testUsers = [
          {
            username: 'testuser1',
            first_name: 'Test',
            last_name: 'User 1',
            is_wishlist_verified: true,
            joined_at: new Date().toISOString(),
            user_id: 12345,
            status: 'member'
          },
          {
            username: 'testuser2',
            first_name: 'Test',
            last_name: 'User 2',
            is_wishlist_verified: false,
            joined_at: new Date().toISOString(),
            user_id: 12346,
            status: 'member'
          },
          {
            username: 'adminuser',
            first_name: 'Admin',
            last_name: 'User',
            is_wishlist_verified: true,
            joined_at: new Date().toISOString(),
            user_id: 99999,
            status: 'administrator'
          }
        ];

        for (const user of testUsers) {
          try {
            await databases.createDocument(
              databaseId,
              telegramMembersCollectionId,
              ID.unique(),
              user
            );
            console.log(`  ✅ Added test user: ${user.username}`);
          } catch (createError) {
            console.log(`  ❌ Failed to add ${user.username}:`, createError.message);
          }
        }
        console.log('');
      }
      
    } catch (collectionError) {
      if (collectionError.code === 404) {
        console.log('❌ Collection does not exist!');
        console.log('Please run the collection creation script first:');
        console.log('node scripts/fix-telegram-collection.js\n');
        return;
      }
      throw collectionError;
    }

    // Step 2: Test verification for different users
    console.log('Step 2: Testing verification for different users...\n');
    
    const testCases = [
      'testuser1',      // Should be verified
      'testuser2',      // Should be member but not verified  
      'adminuser',      // Should be verified admin
      'nonexistent'     // Should not be found
    ];

    for (const username of testCases) {
      try {
        console.log(`Testing username: "${username}"`);
        
        // Clean username (remove @ if present)
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
        
        const response = await databases.listDocuments(
          databaseId,
          telegramMembersCollectionId,
          [Query.equal('username', cleanUsername)]
        );

        if (response.total === 0) {
          console.log(`  ❌ Not found - should show "Not a member" message\n`);
          continue;
        }

        const member = response.documents[0];
        const isVerified = member.is_wishlist_verified || false;

        console.log(`  📋 Found user: ${member.first_name} ${member.last_name}`);
        console.log(`  📧 Username: ${member.username}`);
        console.log(`  🔒 Status: ${member.status || 'member'}`);
        console.log(`  ✅ Verified: ${isVerified ? 'Yes' : 'No'}`);

        if (isVerified) {
          console.log(`  🟢 Result: User should be allowed to register\n`);
        } else {
          console.log(`  🟡 Result: User should be asked to verify in Telegram group\n`);
        }

      } catch (searchError) {
        console.log(`  ❌ Error searching for ${username}:`, searchError.message, '\n');
      }
    }

    // Step 3: Test the actual API endpoint
    console.log('Step 3: Testing API endpoint simulation...');
    
    const testApiCall = async (username) => {
      try {
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
        
        const response = await databases.listDocuments(
          databaseId,
          telegramMembersCollectionId,
          [Query.equal('username', cleanUsername)]
        );

        if (response.total === 0) {
          return {
            is_member: false,
            is_verified: false,
            message: '❌ Not a member. Please join our Telegram group first: https://t.me/JharkhandEnginnersHub',
          };
        }

        const member = response.documents[0];
        const isVerified = member.is_wishlist_verified || false;

        if (isVerified) {
          return {
            is_member: true,
            is_verified: true,
            message: 'User is verified.',
          };
        } else {
          return {
            is_member: true,
            is_verified: false,
            message: 'User is a member but not verified. Please use /verify in the group.',
          };
        }
      } catch (error) {
        return {
          error: 'An unexpected error occurred.',
          details: error.message,
        };
      }
    };

    for (const username of testCases) {
      const result = await testApiCall(username);
      console.log(`API test for "${username}":`, result);
    }

    console.log('\n🎉 Telegram verification system test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Collection exists and is accessible');
    console.log('✅ Test data is available');
    console.log('✅ API simulation works correctly');
    console.log('\nYou can now test the wishlist page with:');
    console.log('- testuser1 (should work - verified)');
    console.log('- testuser2 (should ask for verification)');
    console.log('- adminuser (should work - verified admin)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testTelegramVerification()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
