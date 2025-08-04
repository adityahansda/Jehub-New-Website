const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11')
  .setKey('standard_68688586d2fe91754f2e280c20cef8de8ec9cd439a5b7c7ef41abaf495f027c89f79d45f0b938ad4e68a71772e4feaf5114fa60b370d2cedfea868a1014e49492470f8676d55714dd69e920d7fabdd51bc58d86ceef33845f3438e582c6251bfd1e5f3429b57147704cd03e3c148ac61d857eb055a8d814d8eebc6b8c44eece7');

const databases = new Databases(client);

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

async function migrateToSingleId() {
  try {
    console.log('🔄 Starting migration to single User ID system...\n');
    
    // 1. Get all users
    const users = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
    console.log(`📊 Found ${users.documents.length} users to migrate`);
    
    // 2. Clean up any duplicate userId fields from documents
    let migratedCount = 0;
    for (const user of users.documents) {
      try {
        // Only update if userId field exists and is different from $id
        if (user.userId && user.userId !== user.$id) {
          const updateData = { ...user };
          delete updateData.userId; // Remove duplicate userId field
          delete updateData.$id;
          delete updateData.$createdAt;
          delete updateData.$updatedAt;
          delete updateData.$permissions;
          delete updateData.$databaseId;
          delete updateData.$collectionId;
          
          // Update the user record
          await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, updateData);
          migratedCount++;
          console.log(`✅ Cleaned user: ${user.name} (User ID: ${user.$id.slice(-6)})`);
        } else {
          console.log(`⏭️  Skipped user: ${user.name} (User ID: ${user.$id.slice(-6)}) - already clean`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.$id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration completed! ${migratedCount}/${users.documents.length} users migrated`);
    
    // 3. Try to remove userId attribute from collection schema if it exists
    try {
      await databases.deleteAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'userId');
      console.log('✅ Removed duplicate userId attribute from collection schema');
    } catch (error) {
      console.log('⚠️  Could not remove userId attribute (may not exist):', error.message);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run the migration
migrateToSingleId().catch(console.error);
