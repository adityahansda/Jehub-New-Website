const { Client, Databases, Query } = require('appwrite');
const { promises: fs } = require('fs');
const path = require('path');

async function uploadSubscribersToAppwrite() {
  const client = new Client();
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error(`Missing Appwrite configuration: endpoint=${endpoint}, projectId=${projectId}`);
  }

  client.setEndpoint(endpoint).setProject(projectId);
  const databases = new Databases(client);

  const databaseId = process.env.APPWRITE_DATABASE_ID || 'your-database-id';
  const usersCollectionId = process.env.APPWRITE_USERS_COLLECTION_ID || 'users';

  const subscribersFile = path.join(process.cwd(), 'data', 'subscriptions', 'subscribers.json');

  try {
    const subscribers = JSON.parse(await fs.readFile(subscribersFile, 'utf-8'));

    console.log(`Uploading ${subscribers.length} subscribers to Appwrite...`);

    for (const subscriber of subscribers) {
      try {
        const existingDocs = await databases.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.equal('email', subscriber.email)]
        );

        if (existingDocs.documents.length > 0) {
          console.log(`Subscriber already exists: ${subscriber.email}`);
          continue;
        }

        await databases.createDocument(
          databaseId,
          usersCollectionId,
          'unique()',
          {
            email: subscriber.email,
            subscriptionTimestamp: subscriber.timestamp,
            subscriptionSource: subscriber.source,
            isSubscribed: true,
            subscribedAt: new Date(subscriber.timestamp).toISOString()
          }
        );
        console.log(`✅ Uploaded: ${subscriber.email}`);
      } catch (error) {
        console.error(`Failed to upload ${subscriber.email}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Failed to read subscribers file:', error.message);
    throw error;
  }
}

uploadSubscribersToAppwrite().catch(console.error);

