const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite Client
const client = new Client();
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error('APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';

async function createInternshipCollection() {
  try {
    console.log('Creating internship collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      databaseId,
      'internships', // Collection ID
      'Internships',  // Collection name
      [], // Permissions - will be set later
      false // Document security disabled for public access
    );

    console.log('Collection created:', collection.$id);

    // Add attributes to match Google Sheets structure
    const attributes = [
      { key: 'internId', type: 'string', size: 255, required: true },
      { key: 'verification', type: 'boolean', required: false, default: false },
      { key: 'certificateUrl', type: 'string', size: 1000, required: false },
      { key: 'verifiedAt', type: 'string', size: 255, required: false },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 255, required: false },
      { key: 'email', type: 'string', size: 255, required: false },
      { key: 'joiningType', type: 'string', size: 255, required: false },
      { key: 'duration', type: 'string', size: 255, required: false },
      { key: 'startingDate', type: 'string', size: 255, required: false },
      { key: 'endDate', type: 'string', size: 255, required: false },
      { key: 'issueDate', type: 'string', size: 255, required: false },
      { key: 'filterRowsToMerge', type: 'string', size: 500, required: false },
      { key: 'mergedDocIdOfferLetter', type: 'string', size: 255, required: false },
      { key: 'mergedDocUrlOfferLetter', type: 'string', size: 1000, required: false },
      { key: 'linkToMergedDocOfferLetter', type: 'string', size: 1000, required: false },
      { key: 'documentMergeStatusOfferLetter', type: 'string', size: 500, required: false },
      { key: 'mergedDocIdNda', type: 'string', size: 255, required: false },
      { key: 'mergedDocUrlNda', type: 'string', size: 1000, required: false },
      { key: 'linkToMergedDocNda', type: 'string', size: 1000, required: false },
      { key: 'documentMergeStatusNda', type: 'string', size: 500, required: false },
      { key: 'lastUpdated', type: 'datetime', required: false }
    ];

    // Create attributes one by one
    for (const attr of attributes) {
      try {
        console.log(`Creating attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            collection.$id,
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            collection.$id,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            collection.$id,
            attr.key,
            attr.required
          );
        }
        
        // Small delay between attribute creations
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to create attribute ${attr.key}:`, error.message);
      }
    }

    console.log('Waiting for attributes to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create indexes
    console.log('Creating indexes...');
    
    try {
      await databases.createIndex(
        databaseId,
        collection.$id,
        'idx_intern_id',
        'key',
        ['internId'],
        ['ASC']
      );
      console.log('Created index for internId');
    } catch (error) {
      console.error('Failed to create internId index:', error.message);
    }

    try {
      await databases.createIndex(
        databaseId,
        collection.$id,
        'idx_email',
        'key',
        ['email'],
        ['ASC']
      );
      console.log('Created index for email');
    } catch (error) {
      console.error('Failed to create email index:', error.message);
    }

    try {
      await databases.createIndex(
        databaseId,
        collection.$id,
        'idx_verification',
        'key',
        ['verification'],
        ['ASC']
      );
      console.log('Created index for verification status');
    } catch (error) {
      console.error('Failed to create verification index:', error.message);
    }

    console.log('Waiting for indexes to be processed...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Set permissions for public read access
    console.log('Setting up permissions...');
    
    try {
      await databases.updateCollection(
        databaseId,
        collection.$id,
        'Internships',
        [
          'read("any")', // Allow anyone to read
          'create("users")', // Only authenticated users can create
          'update("users")', // Only authenticated users can update
          'delete("users")'  // Only authenticated users can delete
        ],
        false // Document security disabled for public access
      );
      console.log('Permissions updated for public read access');
    } catch (error) {
      console.error('Failed to update permissions:', error.message);
    }

    console.log(`✅ Internship collection created successfully!`);
    console.log(`Collection ID: ${collection.$id}`);
    console.log('Add this to your .env file:');
    console.log(`NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID=${collection.$id}`);

  } catch (error) {
    console.error('❌ Failed to create internship collection:', error);
    
    if (error.code === 409) {
      console.log('Collection might already exist. Try updating the environment variable.');
    }
  }
}

createInternshipCollection();
