const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11')
  .setKey('standard_68688586d2fe91754f2e280c20cef8de8ec9cd439a5b7c7ef41abaf495f027c89f79d45f0b938ad4e68a71772e4feaf5114fa60b370d2cedfea868a1014e49492470f8676d55714dd69e920d7fabdd51bc58d86ceef33845f3438e582c6251bfd1e5f3429b57147704cd03e3c148ac61d857eb055a8d814d8eebc6b8c44eece7');

const databases = new Databases(client);

const DATABASE_ID = '686d370a000cfabbd998';
const NOTES_COLLECTION_ID = '686d382f00119e0bf90b'; // From env file

async function checkNotesCollectionFields() {
  try {
    console.log('🔍 Fetching notes collection schema...\n');
    
    const collection = await databases.getCollection(DATABASE_ID, NOTES_COLLECTION_ID);
    
    const requiredFields = collection.attributes.filter(attr => attr.required);
    const optionalFields = collection.attributes.filter(attr => !attr.required);
    
    console.log('🚨 REQUIRED FIELDS for Notes Upload:');
    console.log('=====================================');
    requiredFields.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr.key} (${attr.type}${attr.size ? `, max: ${attr.size}` : ''})`);
    });
    
    console.log('\n📝 Optional Fields:');
    console.log('==================');
    optionalFields.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr.key} (${attr.type}${attr.size ? `, max: ${attr.size}` : ''})`);
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Total fields: ${collection.attributes.length}`);
    console.log(`   - Required: ${requiredFields.length}`);
    console.log(`   - Optional: ${optionalFields.length}`);
    
    // Check against our current API fields
    const currentApiFields = [
      'title', 'branch', 'semester', 'subject', 'description', 'tags', 'authorName',
      'uploadDate', 'githubUrl', 'fileName', 'userIp', 'downloads', 'likes', 'points',
      'views', 'reports', 'fileSize', 'noteType', 'degree'
    ];
    
    const missingRequiredFields = requiredFields
      .map(attr => attr.key)
      .filter(key => !currentApiFields.includes(key));
    
    if (missingRequiredFields.length > 0) {
      console.log('\n⚠️  MISSING REQUIRED FIELDS in API:');
      missingRequiredFields.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field}`);
      });
    } else {
      console.log('\n✅ All required fields are covered in API!');
    }
    
    // Show all required fields for reference
    console.log('\n🔧 Required fields that must be included:');
    requiredFields.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr.key} (${attr.type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
checkNotesCollectionFields().catch(console.error);
