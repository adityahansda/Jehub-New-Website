require('dotenv').config();
const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addTestTelegramMembers() {
  try {
    console.log('Adding test Telegram members...');
    
    const testMembers = [
      {
        username: 'testuser1',
        userId: '123456789',
        firstName: 'Test',
        lastName: 'User 1',
        joinedAt: new Date().toISOString(),
        is_wishlist_verified: true,
        verifiedAt: new Date().toISOString()
      },
      {
        username: 'adityatest',
        userId: '987654321', 
        firstName: 'Aditya',
        lastName: 'Test',
        joinedAt: new Date().toISOString(),
        is_wishlist_verified: true,
        verifiedAt: new Date().toISOString()
      },
      {
        username: 'unverifieduser',
        userId: '111222333',
        firstName: 'Unverified',
        lastName: 'User',
        joinedAt: new Date().toISOString(),
        is_wishlist_verified: false,
        verifiedAt: null
      }
    ];

    for (const member of testMembers) {
      try {
        const result = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_TELEGRAM_MEMBERS_COLLECTION_ID,
          ID.unique(),
          member
        );
        
        console.log(`✅ Added member: @${member.username} (${member.firstName} ${member.lastName}) - Verified: ${member.is_wishlist_verified}`);
      } catch (error) {
        console.log(`❌ Failed to add @${member.username}: ${error.message}`);
      }
    }

    console.log('\n🎉 Test members added! You can now test verification with:');
    console.log('- @testuser1 (verified)');
    console.log('- @adityatest (verified)');
    console.log('- @unverifieduser (not verified)');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

addTestTelegramMembers();
