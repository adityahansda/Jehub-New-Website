const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client();
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const apiKey = process.env.APPWRITE_API_KEY;
const internshipsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';

if (!apiKey) {
  console.error('APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function clearAllData() {
  console.log('🧹 Clearing all existing data from internships collection...');
  console.log(`Database ID: ${databaseId}`);
  console.log(`Collection ID: ${internshipsCollectionId}`);

  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Fetch all documents in batches and delete them
    let hasMore = true;
    while (hasMore) {
      const response = await databases.listDocuments(
        databaseId,
        internshipsCollectionId,
        undefined, // queries
        100 // limit
      );

      if (response.documents.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`Found ${response.documents.length} documents to delete...`);

      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(
            databaseId,
            internshipsCollectionId,
            doc.$id
          );
          deletedCount++;
          process.stdout.write(`\rDeleted: ${deletedCount} documents`);
        } catch (error) {
          errorCount++;
          errors.push({
            id: doc.$id,
            internId: doc.internId,
            error: error.message
          });
          console.error(`\nFailed to delete ${doc.internId}: ${error.message}`);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // If we got fewer documents than the limit, we're done
      if (response.documents.length < 100) {
        hasMore = false;
      }
    }

    console.log('\n\n📊 Clear Data Summary');
    console.log('====================');
    console.log(`✅ Successfully deleted: ${deletedCount} records`);
    console.log(`❌ Failed to delete: ${errorCount} records`);

    if (errors.length > 0) {
      console.log('\n❌ Deletion errors:');
      errors.forEach(error => {
        console.log(`- ${error.internId || error.id}: ${error.error}`);
      });
    }

    // Verify collection is empty
    const finalCheck = await databases.listDocuments(
      databaseId,
      internshipsCollectionId
    );

    console.log(`\n🔍 Final verification: ${finalCheck.total} records remaining`);

    if (finalCheck.total === 0) {
      console.log('✅ Collection is now empty and ready for fresh data!');
    } else {
      console.log(`⚠️  Warning: ${finalCheck.total} records still remain in the collection`);
    }

  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    process.exit(1);
  }
}

clearAllData()
  .then(() => {
    console.log('\n🎉 Data clearing completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Data clearing failed:', error);
    process.exit(1);
  });
