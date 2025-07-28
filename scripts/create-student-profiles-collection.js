/**
 * Script to create the student profiles collection in Appwrite
 * Run this script to set up the student profiles collection with all necessary attributes
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY); // You need to add this to your .env file

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = 'student_profiles'; // Collection ID for student profiles

async function createStudentProfilesCollection() {
  try {
    console.log('Creating student profiles collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Student Profiles',
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created:', collection.name);

    // Define all attributes for comprehensive student profile
    const attributes = [
      // Basic Information
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'fullName', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'phone', type: 'string', size: 20, required: true },
      { key: 'alternatePhone', type: 'string', size: 20, required: false },
      { key: 'dateOfBirth', type: 'datetime', required: false },
      { key: 'gender', type: 'string', size: 50, required: false },
      
      // Academic Information
      { key: 'college', type: 'string', size: 500, required: false },
      { key: 'collegeEmail', type: 'string', size: 255, required: false },
      { key: 'branch', type: 'string', size: 255, required: false },
      { key: 'semester', type: 'string', size: 50, required: false },
      { key: 'year', type: 'string', size: 50, required: false },
      { key: 'enrollmentNumber', type: 'string', size: 100, required: false },
      { key: 'currentGPA', type: 'string', size: 10, required: false },
      
      // Personal Information
      { key: 'bio', type: 'string', size: 2000, required: false },
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
      { key: 'isProfileComplete', type: 'boolean', required: true },
      { key: 'profileCompletedAt', type: 'datetime', required: false },
      { key: 'lastUpdated', type: 'datetime', required: false },
      
      // Preferences
      { key: 'preferredLanguage', type: 'string', size: 50, required: false },
      { key: 'notificationPreferences', type: 'string', size: 1000, required: false }, // JSON string
      
      // Additional Academic Details
      { key: 'admissionYear', type: 'string', size: 10, required: false },
      { key: 'graduationYear', type: 'string', size: 10, required: false },
      { key: 'courseType', type: 'string', size: 100, required: false }, // Undergraduate, Graduate, PhD
      { key: 'specialization', type: 'string', size: 255, required: false },
      
      // Contact Preferences
      { key: 'visibility', type: 'string', size: 20, required: false }, // public, private, friends
      { key: 'contactPreference', type: 'string', size: 20, required: false }, // email, phone, both
      
      // Activity Tracking
      { key: 'lastLoginAt', type: 'datetime', required: false },
      { key: 'accountStatus', type: 'string', size: 20, required: false }, // active, inactive, suspended
      { key: 'emailVerified', type: 'boolean', required: false },
      { key: 'phoneVerified', type: 'boolean', required: false }
    ];

    console.log('Creating attributes...');
    for (const attr of attributes) {
      try {
        let attribute;
        switch (attr.type) {
          case 'string':
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.size,
              attr.required
            );
            break;
          case 'boolean':
            attribute = await databases.createBooleanAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
          case 'integer':
            attribute = await databases.createIntegerAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
          case 'datetime':
            attribute = await databases.createDatetimeAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
            break;
        }
        console.log(`✅ Created attribute: ${attr.key}`);
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    // Wait for attributes to be ready
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create indexes for better query performance
    const indexes = [
      { key: 'userId_idx', type: 'unique', attributes: ['userId'], orders: ['ASC'] },
      { key: 'email_idx', type: 'unique', attributes: ['email'], orders: ['ASC'] },
      { key: 'fullName_idx', type: 'key', attributes: ['fullName'], orders: ['ASC'] },
      { key: 'college_idx', type: 'key', attributes: ['college'], orders: ['ASC'] },
      { key: 'branch_idx', type: 'key', attributes: ['branch'], orders: ['ASC'] },
      { key: 'city_idx', type: 'key', attributes: ['city'], orders: ['ASC'] },
      { key: 'state_idx', type: 'key', attributes: ['state'], orders: ['ASC'] },
      { key: 'isProfileComplete_idx', type: 'key', attributes: ['isProfileComplete'], orders: ['ASC'] },
      { key: 'accountStatus_idx', type: 'key', attributes: ['accountStatus'], orders: ['ASC'] },
      { key: 'createdAt_idx', type: 'key', attributes: ['$createdAt'], orders: ['DESC'] },
      { key: 'lastUpdated_idx', type: 'key', attributes: ['lastUpdated'], orders: ['DESC'] }
    ];

    console.log('Creating indexes...');
    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`✅ Created index: ${index.key}`);
        
        // Wait a bit between index creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating index ${index.key}:`, error.message);
      }
    }

    console.log('✅ Student profiles collection setup complete!');
    console.log(`Collection ID: ${COLLECTION_ID}`);
    console.log('Remember to update your .env file with the collection ID:');
    console.log(`NEXT_PUBLIC_APPWRITE_STUDENT_PROFILES_COLLECTION_ID=${COLLECTION_ID}`);

  } catch (error) {
    console.error('❌ Error creating student profiles collection:', error);
  }
}

// Function to check if collection exists
async function checkCollectionExists() {
  try {
    await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Setting up student profiles collection...');
  
  const exists = await checkCollectionExists();
  if (exists) {
    console.log('⚠️  Collection already exists. Skipping creation.');
    return;
  }

  await createStudentProfilesCollection();
}

// Run the script
main().catch(console.error);

module.exports = { createStudentProfilesCollection, checkCollectionExists };
