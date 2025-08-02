const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('686d35da003a55dfcc11') // Your project ID
  .setKey('standard_68688586d2fe91754f2e280c20cef8de8ec9cd439a5b7c7ef41abaf495f027c89f79d45f0b938ad4e68a71772e4feaf5114fa60b370d2cedfea868a1014e49492470f8676d55714dd69e920d7fabdd51bc58d86ceef33845f3438e582c6251bfd1e5f3429b57147704cd03e3c148ac61d857eb055a8d814d8eebc6b8c44eece7'); // Your API key

const databases = new Databases(client);

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

// List of attributes to remove
const attributesToRemove = [
  'alternatePhone',
  'collegeEmail', 
  'enrollmentNumber',
  'currentGPA',
  'interests',
  'skills',
  'languages',
  'currentAddress',
  'permanentAddress',
  'city',
  'state',
  'country',
  'pincode',
  'linkedinUrl',
  'githubUrl',
  'portfolioUrl',
  'preferredLanguage',
  'notificationPreferences'
];

async function removeUnusedAttributes() {
  console.log('🚀 Starting removal of unused attributes from users collection...\n');

  for (const attributeKey of attributesToRemove) {
    try {
      console.log(`📝 Removing attribute: ${attributeKey}`);
      
      await databases.deleteAttribute(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        attributeKey
      );
      
      console.log(`✅ Successfully removed: ${attributeKey}`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      if (error.code === 404) {
        console.log(`ℹ️  Attribute '${attributeKey}' not found (already removed or never existed)`);
      } else {
        console.error(`❌ Error removing ${attributeKey}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Finished removing unused attributes!');
  console.log('\n📋 Summary:');
  console.log(`   - Attempted to remove ${attributesToRemove.length} attributes`);
  console.log('   - Check the logs above for individual results');
  
  // Verify remaining attributes
  try {
    console.log('\n🔍 Fetching remaining attributes...');
    const collection = await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
    
    console.log('\n📊 Remaining attributes in users collection:');
    collection.attributes.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr.key} (${attr.type}) ${attr.required ? '- Required' : '- Optional'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching collection details:', error.message);
  }
}

// Run the script
removeUnusedAttributes().catch(console.error);
