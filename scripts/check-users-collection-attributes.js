/**
 * Script to check existing attributes in the users collection
 * This will help us understand what fields are already available
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

async function checkUsersCollectionAttributes() {
  try {
    console.log('🔍 Checking users collection attributes...');
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log(`Collection ID: ${USERS_COLLECTION_ID}`);
    
    // Get collection details
    const collection = await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
    
    console.log('\n📋 Collection Details:');
    console.log(`Name: ${collection.name}`);
    console.log(`Total Documents: ${collection.documentsTotal}`);
    console.log(`Created: ${collection.$createdAt}`);
    console.log(`Updated: ${collection.$updatedAt}`);
    
    console.log('\n📊 Existing Attributes:');
    console.log('=====================================');
    
    if (collection.attributes && collection.attributes.length > 0) {
      collection.attributes.forEach((attr, index) => {
        console.log(`${index + 1}. ${attr.key}`);
        console.log(`   Type: ${attr.type}`);
        console.log(`   Required: ${attr.required}`);
        if (attr.size) console.log(`   Size: ${attr.size}`);
        if (attr.default !== undefined) console.log(`   Default: ${attr.default}`);
        console.log('   ---');
      });
    } else {
      console.log('No attributes found.');
    }
    
    console.log('\n🔗 Indexes:');
    console.log('=====================================');
    
    if (collection.indexes && collection.indexes.length > 0) {
      collection.indexes.forEach((index, i) => {
        console.log(`${i + 1}. ${index.key}`);
        console.log(`   Type: ${index.type}`);
        console.log(`   Attributes: ${index.attributes.join(', ')}`);
        console.log(`   Orders: ${index.orders.join(', ')}`);
        console.log('   ---');
      });
    } else {
      console.log('No indexes found.');
    }
    
    // Suggest missing attributes for comprehensive profile
    console.log('\n💡 Suggested Additional Attributes for Complete Profile:');
    console.log('=====================================');
    
    const currentAttributes = collection.attributes.map(attr => attr.key);
    const suggestedAttributes = [
      'profileImageUrl',
      'phone',
      'alternatePhone',
      'dateOfBirth',
      'gender',
      'college',
      'collegeEmail',
      'branch',
      'semester',
      'year',
      'enrollmentNumber',
      'currentGPA',
      'bio',
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
      'isProfileComplete',
      'profileCompletedAt',
      'preferredLanguage',
      'notificationPreferences'
    ];
    
    const missingAttributes = suggestedAttributes.filter(attr => !currentAttributes.includes(attr));
    
    if (missingAttributes.length > 0) {
      console.log('Missing attributes that could be added:');
      missingAttributes.forEach((attr, index) => {
        console.log(`${index + 1}. ${attr}`);
      });
    } else {
      console.log('All suggested attributes are already present!');
    }
    
  } catch (error) {
    console.error('❌ Error checking users collection:', error.message);
  }
}

// Run the script
checkUsersCollectionAttributes();

module.exports = { checkUsersCollectionAttributes };
