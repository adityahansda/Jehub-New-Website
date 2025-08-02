/**
 * Script to create referral and points system collections
 * This creates a points-based referral system where users earn points to download notes
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration  
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';

async function createReferralPointsSystem() {
  try {
    console.log('🚀 Creating referral and points system collections...');
    
    // 1. Update Referrals Collection for Points System
    console.log('\n📝 Updating referrals collection for points...');
    try {
      // Add/Update attributes in existing referrals collection
      const referralPointsAttributes = [
        { key: 'pointsAwarded', type: 'integer', required: false }, // Points given to referrer
        { key: 'bonusPointsAwarded', type: 'integer', required: false }, // Bonus points for special campaigns
        { key: 'referredUserPoints', type: 'integer', required: false } // Points given to referred user
      ];
      
      for (const attr of referralPointsAttributes) {
        try {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'referrals_collection',
            attr.key,
            attr.required
          );
          console.log(`   ✅ Added points attribute: ${attr.key}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          if (error.code !== 409) { // Ignore if already exists
            console.error(`   ❌ Error adding attribute ${attr.key}:`, error.message);
          } else {
            console.log(`   ℹ️  Attribute ${attr.key} already exists`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating referrals collection:', error.message);
    }

    // 2. Create Points Transactions Collection
    console.log('\n🎯 Creating points transactions collection...');
    try {
      const pointsTransactionsCollection = await databases.createCollection(
        DATABASE_ID,
        'points_transactions',
        'Points Transactions',
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Created points transactions collection:', pointsTransactionsCollection.$id);
      
      // Add attributes to points transactions collection
      const pointsAttributes = [
        { key: 'userId', type: 'string', size: 100, required: true },
        { key: 'userEmail', type: 'string', size: 255, required: true },
        { key: 'type', type: 'string', size: 50, required: true }, // referral_bonus, note_download, upload_bonus, daily_bonus, admin_adjustment
        { key: 'points', type: 'integer', required: true }, // Positive for earning, negative for spending
        { key: 'description', type: 'string', size: 500, required: true },
        { key: 'referralId', type: 'string', size: 100, required: false }, // If related to referral
        { key: 'noteId', type: 'string', size: 100, required: false }, // If related to note download/upload
        { key: 'status', type: 'string', size: 50, required: true }, // completed, pending, failed
        { key: 'metadata', type: 'string', size: 1000, required: false } // JSON string for additional data
      ];
      
      for (const attr of pointsAttributes) {
        try {
          let attribute;
          switch (attr.type) {
            case 'string':
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                'points_transactions',
                attr.key,
                attr.size,
                attr.required
              );
              break;
            case 'integer':
              attribute = await databases.createIntegerAttribute(
                DATABASE_ID,
                'points_transactions',
                attr.key,
                attr.required
              );
              break;
          }
          console.log(`   ✅ Added attribute: ${attr.key}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`   ❌ Error adding attribute ${attr.key}:`, error.message);
        }
      }
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Points transactions collection already exists');
      } else {
        console.error('❌ Error creating points transactions collection:', error.message);
      }
    }

    // 3. Create Download Requirements Collection
    console.log('\n📚 Creating download requirements collection...');
    try {
      const downloadRequirementsCollection = await databases.createCollection(
        DATABASE_ID,
        'download_requirements',
        'Download Requirements',
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Created download requirements collection:', downloadRequirementsCollection.$id);
      
      // Add attributes to download requirements collection
      const downloadAttributes = [
        { key: 'noteId', type: 'string', size: 100, required: true },
        { key: 'noteTitle', type: 'string', size: 500, required: true },
        { key: 'subject', type: 'string', size: 100, required: false },
        { key: 'semester', type: 'string', size: 50, required: false },
        { key: 'pointsRequired', type: 'integer', required: true }, // Points needed to download
        { key: 'category', type: 'string', size: 100, required: false }, // premium, standard, free
        { key: 'uploaderUserId', type: 'string', size: 100, required: false },
        { key: 'isActive', type: 'boolean', required: true }
      ];
      
      for (const attr of downloadAttributes) {
        try {
          let attribute;
          switch (attr.type) {
            case 'string':
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                'download_requirements',
                attr.key,
                attr.size,
                attr.required
              );
              break;
            case 'integer':
              attribute = await databases.createIntegerAttribute(
                DATABASE_ID,
                'download_requirements',
                attr.key,
                attr.required
              );
              break;
            case 'boolean':
              attribute = await databases.createBooleanAttribute(
                DATABASE_ID,
                'download_requirements',
                attr.key,
                attr.required
              );
              break;
          }
          console.log(`   ✅ Added attribute: ${attr.key}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`   ❌ Error adding attribute ${attr.key}:`, error.message);
        }
      }
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Download requirements collection already exists');
      } else {
        console.error('❌ Error creating download requirements collection:', error.message);
      }
    }

    // Wait for attributes to be ready
    console.log('\n⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Create indexes
    console.log('\n🔗 Creating indexes...');
    
    const indexes = [
      // Points Transactions indexes
      { collection: 'points_transactions', key: 'user_points_idx', attributes: ['userId'] },
      { collection: 'points_transactions', key: 'email_points_idx', attributes: ['userEmail'] },
      { collection: 'points_transactions', key: 'type_points_idx', attributes: ['type'] },
      { collection: 'points_transactions', key: 'date_points_idx', attributes: ['$createdAt'], orders: ['DESC'] },
      
      // Download Requirements indexes
      { collection: 'download_requirements', key: 'note_requirements_idx', attributes: ['noteId'] },
      { collection: 'download_requirements', key: 'category_idx', attributes: ['category'] },
      { collection: 'download_requirements', key: 'points_range_idx', attributes: ['pointsRequired'] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          index.collection,
          index.key,
          'key',
          index.attributes,
          index.orders || ['ASC']
        );
        console.log(`✅ Created index: ${index.key} on ${index.collection}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating index ${index.key}:`, error.message);
      }
    }

    // Update users collection with points attributes
    console.log('\n👤 Adding points attributes to users collection...');
    const userPointsAttributes = [
      { key: 'totalPoints', type: 'integer', required: false }, // Total points earned
      { key: 'availablePoints', type: 'integer', required: false }, // Points available to spend
      { key: 'pointsSpent', type: 'integer', required: false }, // Total points spent
      { key: 'referralCode', type: 'string', size: 20, required: false }, // Unique referral code
      { key: 'referredBy', type: 'string', size: 100, required: false }, // Who referred this user
      { key: 'totalReferrals', type: 'integer', required: false }, // Number of successful referrals
      { key: 'isReferralActive', type: 'boolean', required: false }, // Whether user can earn referral points
      { key: 'lastPointsEarned', type: 'datetime', required: false }, // Last time user earned points
      { key: 'notesDownloaded', type: 'integer', required: false }, // Number of notes downloaded
      { key: 'notesUploaded', type: 'integer', required: false } // Number of notes uploaded
    ];

    const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';
    
    for (const attr of userPointsAttributes) {
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
          case 'integer':
            attribute = await databases.createIntegerAttribute(
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
        console.log(`   ✅ Added user attribute: ${attr.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code !== 409) { // Ignore if attribute already exists
          console.error(`   ❌ Error adding user attribute ${attr.key}:`, error.message);
        } else {
          console.log(`   ℹ️  User attribute ${attr.key} already exists`);
        }
      }
    }

    console.log('\n🎉 Referral and points system created successfully!');
    console.log('\n📋 System Overview:');
    console.log('   ✅ Referral System: Users earn points for successful referrals');
    console.log('   ✅ Points Economy: Points are used to download notes');
    console.log('   ✅ Transaction Tracking: All point earnings/spending tracked');
    console.log('   ✅ Download Requirements: Flexible point costs per note');
    
    console.log('\n🎯 Points Configuration:');
    console.log('   - Successful Referral: 50 points');
    console.log('   - Welcome Bonus (new user): 20 points');
    console.log('   - Upload Bonus: 30 points per note uploaded');
    console.log('   - Daily Login: 5 points');
    console.log('   - Note Download Cost: 10-50 points (configurable per note)');
    
    console.log('\n🔑 Environment variables to add:');
    console.log('NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID=points_transactions');
    console.log('NEXT_PUBLIC_APPWRITE_DOWNLOAD_REQUIREMENTS_COLLECTION_ID=download_requirements');

  } catch (error) {
    console.error('❌ Error creating referral points system:', error.message);
  }
}

// Run the script
createReferralPointsSystem();

module.exports = { createReferralPointsSystem };
