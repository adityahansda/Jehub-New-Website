const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client with read-only access
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11');

const databases = new Databases(client);

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

async function checkCurrentAttributes() {
  try {
    console.log('🔍 Fetching current attributes in users collection...\n');
    
    // Try to get collection info without authentication (public read)
    const collection = await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
    
    console.log('📊 Current attributes in users collection:');
    console.log('==========================================');
    
    const attributesByType = {
      required: [],
      optional: []
    };
    
    collection.attributes.forEach((attr) => {
      const info = `${attr.key} (${attr.type}${attr.size ? `, size: ${attr.size}` : ''})`;
      if (attr.required) {
        attributesByType.required.push(info);
      } else {
        attributesByType.optional.push(info);
      }
    });
    
    console.log('\n✅ Required Attributes:');
    attributesByType.required.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr}`);
    });
    
    console.log('\n📝 Optional Attributes:');
    attributesByType.optional.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr}`);
    });
    
    console.log(`\n📈 Total: ${collection.attributes.length} attributes`);
    console.log(`   - Required: ${attributesByType.required.length}`);
    console.log(`   - Optional: ${attributesByType.optional.length}`);
    
    // Check if any of the unused attributes still exist
    const unusedAttributes = [
      'alternatePhone', 'collegeEmail', 'enrollmentNumber', 'currentGPA',
      'interests', 'skills', 'languages', 'currentAddress', 'permanentAddress',
      'city', 'state', 'country', 'pincode', 'linkedinUrl', 'githubUrl',
      'portfolioUrl', 'preferredLanguage', 'notificationPreferences'
    ];
    
    const existingUnusedAttributes = collection.attributes
      .map(attr => attr.key)
      .filter(key => unusedAttributes.includes(key));
    
    if (existingUnusedAttributes.length > 0) {
      console.log('\n⚠️  Found unused attributes that should be removed:');
      existingUnusedAttributes.forEach((attr, index) => {
        console.log(`   ${index + 1}. ${attr}`);
      });
      console.log('\n💡 You can remove these manually from the Appwrite console.');
    } else {
      console.log('\n✅ Great! No unused attributes found in the database.');
    }
    
  } catch (error) {
    console.error('❌ Error fetching collection details:', error.message);
    console.log('\n💡 This might be due to authentication or permissions.');
    console.log('   Try checking the attributes manually in the Appwrite console.');
  }
}

// Run the script
checkCurrentAttributes().catch(console.error);
