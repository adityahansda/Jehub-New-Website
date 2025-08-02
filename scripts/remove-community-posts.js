const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11')
  .setKey('standard_68688586d2fe91754f2e280c20cef8de8ec9cd439a5b7c7ef41abaf495f027c89f79d45f0b938ad4e68a71772e4feaf5114fa60b370d2cedfea868a1014e49492470f8676d55714dd69e920d7fabdd51bc58d86ceef33845f3438e582c6251bfd1e5f3429b57147704cd03e3c148ac61d857eb055a8d814d8eebc6b8c44eece7');

const databases = new Databases(client);

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

async function removeCommunityPosts() {
  console.log('🚀 Removing communityPosts attribute...\n');

  try {
    console.log('📝 Removing attribute: communityPosts');
    
    await databases.deleteAttribute(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      'communityPosts'
    );
    
    console.log('✅ Successfully removed: communityPosts');
    
  } catch (error) {
    if (error.code === 404) {
      console.log('ℹ️  Attribute "communityPosts" not found (already removed or never existed)');
    } else {
      console.error('❌ Error removing communityPosts:', error.message);
    }
  }

  console.log('\n🎉 Finished!');
}

// Run the script
removeCommunityPosts().catch(console.error);
