const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11')
  .setKey('standard_68688586d2fe91754f2e280c20cef8de8ec9cd439a5b7c7ef41abaf495f027c89f79d45f0b938ad4e68a71772e4feaf5114fa60b370d2cedfea868a1014e49492470f8676d55714dd69e920d7fabdd51bc58d86ceef33845f3438e582c6251bfd1e5f3429b57147704cd03e3c148ac61d857eb055a8d814d8eebc6b8c44eece7');

const databases = new Databases(client);

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

async function checkRequiredFields() {
  try {
    console.log('🔍 Fetching users collection schema...\n');
    
    const collection = await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
    
    const requiredFields = collection.attributes.filter(attr => attr.required);
    const optionalFields = collection.attributes.filter(attr => !attr.required);
    
    console.log('🚨 REQUIRED FIELDS (Must be provided in SignUp):');
    console.log('=================================================');
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
    
    // Check against our current SignUp form data
    const currentSignUpFields = [
      'userId', 'name', 'email', 'phone', 'college', 'branch', 'semester', 'year', 
      'bio', 'telegramUsername', 'isProfileComplete', 'profileCompletedAt', 'role', 
      'updatedAt', 'totalPoints', 'availablePoints', 'points', 'pointsSpent', 
      'notesUploaded', 'notesDownloaded', 'requestsFulfilled', 'totalReferrals', 
      'rank', 'level', 'dailyLoginStreak', 'lastLoginDate', 'joinDate'
    ];
    
    const missingRequiredFields = requiredFields
      .map(attr => attr.key)
      .filter(key => !currentSignUpFields.includes(key));
    
    if (missingRequiredFields.length > 0) {
      console.log('\n⚠️  MISSING REQUIRED FIELDS in SignUp form:');
      missingRequiredFields.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field}`);
      });
    } else {
      console.log('\n✅ All required fields are covered in SignUp form!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
checkRequiredFields().catch(console.error);
