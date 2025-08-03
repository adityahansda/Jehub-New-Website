const { Client, Databases, Query } = require('appwrite');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Appwrite configuration
const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998',
  collections: {
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40',
  }
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const databases = new Databases(client);

async function migrateSubscribersToAppwrite() {
  const subscribersFile = path.join(process.cwd(), 'data', 'subscriptions', 'subscribers.json');
  
  try {
    console.log('🚀 Starting subscriber migration to Appwrite...\n');
    
    // Check if subscribers file exists
    try {
      await fs.access(subscribersFile);
    } catch (error) {
      console.error('❌ Subscribers file not found:', subscribersFile);
      return;
    }

    // Read subscribers from JSON file
    const fileContent = await fs.readFile(subscribersFile, 'utf-8');
    const subscribers = JSON.parse(fileContent);

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      console.log('📭 No subscribers found to migrate.');
      return;
    }

    console.log(`📋 Found ${subscribers.length} subscribers to migrate...\n`);

    let successCount = 0;
    let errorCount = 0;
    let existingCount = 0;

    for (const [index, subscriber] of subscribers.entries()) {
      const { email, timestamp, source } = subscriber;
      
      console.log(`Processing ${index + 1}/${subscribers.length}: ${email}`);

      try {
        // Check if subscriber already exists in the database
        const existingDocs = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          [Query.equal('email', email)]
        );

        if (existingDocs.documents.length > 0) {
          console.log(`  ⚠️  Already exists in database`);
          existingCount++;
          continue;
        }

        // Create new document in Appwrite
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          'unique()', // Auto-generate document ID
          {
            email: email,
            subscriptionTimestamp: timestamp,
            subscriptionSource: source || 'newsletter',
            isSubscribed: true,
            subscribedAt: new Date(timestamp).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Add default fields for the users collection
            name: '', // Empty name initially
            profileComplete: false,
            role: 'user'
          }
        );

        console.log(`  ✅ Successfully migrated (ID: ${response.$id})`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Failed to migrate: ${error.message}`);
        errorCount++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print migration summary
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⚠️  Already existed: ${existingCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Total processed: ${subscribers.length}`);

    if (successCount > 0) {
      console.log(`\n🎉 Migration completed successfully!`);
    }

    return { successCount, errorCount, existingCount, totalProcessed: subscribers.length };

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  migrateSubscribersToAppwrite()
    .then(() => {
      console.log('\n✨ Script execution completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSubscribersToAppwrite };
