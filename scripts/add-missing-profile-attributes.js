/**
 * Script to add missing attributes to the existing users collection
 * This will extend your current collection with comprehensive profile fields
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';

async function addMissingProfileAttributes() {
  try {
    console.log('🚀 Adding missing profile attributes to users collection...');
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log(`Collection ID: ${USERS_COLLECTION_ID}`);
    
    // Define missing attributes to add
    const missingAttributes = [
      // Contact Information
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'alternatePhone', type: 'string', size: 20, required: false },
      
      // Personal Information
      { key: 'dateOfBirth', type: 'datetime', required: false },
      { key: 'gender', type: 'string', size: 50, required: false },
      
      // Academic Information (additional to existing college, branch, semester)
      { key: 'collegeEmail', type: 'string', size: 255, required: false },
      { key: 'year', type: 'string', size: 50, required: false },
      { key: 'enrollmentNumber', type: 'string', size: 100, required: false },
      { key: 'currentGPA', type: 'string', size: 10, required: false },
      
      // Enhanced Personal Information
      { key: 'interests', type: 'string', size: 1000, required: false },
      { key: 'skills', type: 'string', size: 1000, required: false },
      { key: 'languages', type: 'string', size: 500, required: false },
      
      // Address Information
      { key: 'currentAddress', type: 'string', size: 1000, required: false },
      { key: 'permanentAddress', type: 'string', size: 1000, required: false },
      { key: 'city', type: 'string', size: 100, required: false },
      { key: 'state', type: 'string', size: 100, required: false },
      { key: 'country', type: 'string', size: 100, required: false },
      { key: 'pincode', type: 'string', size: 10, required: false },
      
      // Social Links
      { key: 'linkedinUrl', type: 'string', size: 500, required: false },
      { key: 'githubUrl', type: 'string', size: 500, required: false },
      { key: 'portfolioUrl', type: 'string', size: 500, required: false },
      
      // Profile Management
      { key: 'profileImageUrl', type: 'string', size: 1000, required: false },
      { key: 'isProfileComplete', type: 'boolean', required: false },
      { key: 'profileCompletedAt', type: 'datetime', required: false },
      
      // Preferences
      { key: 'preferredLanguage', type: 'string', size: 50, required: false },
      { key: 'notificationPreferences', type: 'string', size: 1000, required: false }
    ];

    console.log(`\n📋 Adding ${missingAttributes.length} new attributes...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const attr of missingAttributes) {
      try {
        let attribute;
        switch (attr.type) {
          case 'string':
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              attr.key,
              attr.size,
              attr.required
            );
            break;
          case 'boolean':
            attribute = await databases.createBooleanAttribute(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
          case 'datetime':
            attribute = await databases.createDatetimeAttribute(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
        }
        console.log(`✅ Added attribute: ${attr.key}`);
        successCount++;
        
        // Wait a bit between attribute creations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error adding attribute ${attr.key}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} attributes`);
    console.log(`❌ Failed to add: ${errorCount} attributes`);
    
    if (successCount > 0) {
      console.log('\n⏳ Waiting for attributes to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Add indexes for new attributes
      console.log('\n🔗 Adding indexes for new attributes...');
      const newIndexes = [
        { key: 'phone_idx', type: 'key', attributes: ['phone'], orders: ['ASC'] },
        { key: 'city_idx', type: 'key', attributes: ['city'], orders: ['ASC'] },
        { key: 'state_idx', type: 'key', attributes: ['state'], orders: ['ASC'] },
        { key: 'country_idx', type: 'key', attributes: ['country'], orders: ['ASC'] },
        { key: 'isProfileComplete_idx', type: 'key', attributes: ['isProfileComplete'], orders: ['ASC'] },
        { key: 'profileCompletedAt_idx', type: 'key', attributes: ['profileCompletedAt'], orders: ['DESC'] }
      ];
      
      let indexSuccessCount = 0;
      for (const index of newIndexes) {
        try {
          await databases.createIndex(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            index.key,
            index.type,
            index.attributes,
            index.orders
          );
          console.log(`✅ Added index: ${index.key}`);
          indexSuccessCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error adding index ${index.key}:`, error.message);
        }
      }
      
      console.log(`\n🎉 Profile attributes enhancement complete!`);
      console.log(`✅ Added ${successCount} attributes and ${indexSuccessCount} indexes`);
      console.log(`\n📝 Your users collection now supports comprehensive profile data!`);
    }
    
  } catch (error) {
    console.error('❌ Error enhancing users collection:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔧 Enhancing existing users collection with profile attributes...');
  await addMissingProfileAttributes();
}

// Run the script
main().catch(console.error);

module.exports = { addMissingProfileAttributes };
