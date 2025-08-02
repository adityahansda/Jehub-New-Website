/**
 * Script to create referral and earning system collections
 * This will create collections for referrals, earnings, and transactions
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

async function createReferralCollections() {
  try {
    console.log('🚀 Creating referral and earning system collections...');
    
    // 1. Create Referrals Collection
    console.log('\n📝 Creating referrals collection...');
    try {
      const referralsCollection = await databases.createCollection(
        DATABASE_ID,
        'referrals_collection',
        'Referrals',
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Created referrals collection:', referralsCollection.$id);
      
      // Add attributes to referrals collection
      const referralAttributes = [
        { key: 'referrerUserId', type: 'string', size: 100, required: true },
        { key: 'referrerEmail', type: 'string', size: 255, required: true },
        { key: 'referredUserId', type: 'string', size: 100, required: false },
        { key: 'referredEmail', type: 'string', size: 255, required: false },
        { key: 'referralCode', type: 'string', size: 20, required: true },
        { key: 'status', type: 'string', size: 50, required: true }, // pending, completed, expired
        { key: 'completedAt', type: 'datetime', required: false },
        { key: 'pointsEarned', type: 'integer', required: false },
        { key: 'bonusEarned', type: 'float', required: false },
        { key: 'isActive', type: 'boolean', required: true }
      ];
      
      for (const attr of referralAttributes) {
        try {
          let attribute;
          switch (attr.type) {
            case 'string':
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                'referrals_collection',
                attr.key,
                attr.size,
                attr.required
              );
              break;
            case 'boolean':
              attribute = await databases.createBooleanAttribute(
                DATABASE_ID,
                'referrals_collection',
                attr.key,
                attr.required
              );
              break;
            case 'datetime':
              attribute = await databases.createDatetimeAttribute(
                DATABASE_ID,
                'referrals_collection',
                attr.key,
                attr.required
              );
              break;
            case 'integer':
              attribute = await databases.createIntegerAttribute(
                DATABASE_ID,
                'referrals_collection',
                attr.key,
                attr.required
              );
              break;
            case 'float':
              attribute = await databases.createFloatAttribute(
                DATABASE_ID,
                'referrals_collection',
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
        console.log('ℹ️ Referrals collection already exists');
      } else {
        console.error('❌ Error creating referrals collection:', error.message);
      }
    }

    // 2. Create Earnings Collection
    console.log('\n💰 Creating earnings collection...');
    try {
      const earningsCollection = await databases.createCollection(
        DATABASE_ID,
        'earnings_collection',
        'Earnings',
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Created earnings collection:', earningsCollection.$id);
      
      // Add attributes to earnings collection
      const earningsAttributes = [
        { key: 'userId', type: 'string', size: 100, required: true },
        { key: 'userEmail', type: 'string', size: 255, required: true },
        { key: 'totalEarnings', type: 'float', required: true },
        { key: 'availableBalance', type: 'float', required: true },
        { key: 'withdrawnAmount', type: 'float', required: true },
        { key: 'pendingAmount', type: 'float', required: true },
        { key: 'totalReferrals', type: 'integer', required: true },
        { key: 'successfulReferrals', type: 'integer', required: true },
        { key: 'conversionRate', type: 'float', required: false },
        { key: 'lastEarningDate', type: 'datetime', required: false },
        { key: 'paymentInfo', type: 'string', size: 1000, required: false } // JSON string for payment details
      ];
      
      for (const attr of earningsAttributes) {
        try {
          let attribute;
          switch (attr.type) {
            case 'string':
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                'earnings_collection',
                attr.key,
                attr.size,
                attr.required
              );
              break;
            case 'datetime':
              attribute = await databases.createDatetimeAttribute(
                DATABASE_ID,
                'earnings_collection',
                attr.key,
                attr.required
              );
              break;
            case 'integer':
              attribute = await databases.createIntegerAttribute(
                DATABASE_ID,
                'earnings_collection',
                attr.key,
                attr.required
              );
              break;
            case 'float':
              attribute = await databases.createFloatAttribute(
                DATABASE_ID,
                'earnings_collection',
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
        console.log('ℹ️ Earnings collection already exists');
      } else {
        console.error('❌ Error creating earnings collection:', error.message);
      }
    }

    // 3. Create Transactions Collection
    console.log('\n💳 Creating transactions collection...');
    try {
      const transactionsCollection = await databases.createCollection(
        DATABASE_ID,
        'transactions_collection',
        'Transactions',
        [
          Permission.create(Role.any()),
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Created transactions collection:', transactionsCollection.$id);
      
      // Add attributes to transactions collection
      const transactionAttributes = [
        { key: 'userId', type: 'string', size: 100, required: true },
        { key: 'userEmail', type: 'string', size: 255, required: true },
        { key: 'type', type: 'string', size: 50, required: true }, // referral_bonus, withdrawal, adjustment
        { key: 'amount', type: 'float', required: true },
        { key: 'status', type: 'string', size: 50, required: true }, // pending, completed, failed, cancelled
        { key: 'description', type: 'string', size: 500, required: true },
        { key: 'referralId', type: 'string', size: 100, required: false },
        { key: 'paymentMethod', type: 'string', size: 100, required: false },
        { key: 'paymentDetails', type: 'string', size: 1000, required: false },
        { key: 'processedAt', type: 'datetime', required: false },
        { key: 'metadata', type: 'string', size: 2000, required: false } // JSON string for additional data
      ];
      
      for (const attr of transactionAttributes) {
        try {
          let attribute;
          switch (attr.type) {
            case 'string':
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                'transactions_collection',
                attr.key,
                attr.size,
                attr.required
              );
              break;
            case 'datetime':
              attribute = await databases.createDatetimeAttribute(
                DATABASE_ID,
                'transactions_collection',
                attr.key,
                attr.required
              );
              break;
            case 'float':
              attribute = await databases.createFloatAttribute(
                DATABASE_ID,
                'transactions_collection',
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
        console.log('ℹ️ Transactions collection already exists');
      } else {
        console.error('❌ Error creating transactions collection:', error.message);
      }
    }

    // Wait for attributes to be ready
    console.log('\n⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Create indexes
    console.log('\n🔗 Creating indexes...');
    
    const indexes = [
      // Referrals indexes
      { collection: 'referrals_collection', key: 'referrer_idx', attributes: ['referrerUserId'] },
      { collection: 'referrals_collection', key: 'code_idx', attributes: ['referralCode'] },
      { collection: 'referrals_collection', key: 'status_idx', attributes: ['status'] },
      { collection: 'referrals_collection', key: 'referred_email_idx', attributes: ['referredEmail'] },
      
      // Earnings indexes
      { collection: 'earnings_collection', key: 'user_earnings_idx', attributes: ['userId'] },
      { collection: 'earnings_collection', key: 'email_earnings_idx', attributes: ['userEmail'] },
      
      // Transactions indexes
      { collection: 'transactions_collection', key: 'user_transactions_idx', attributes: ['userId'] },
      { collection: 'transactions_collection', key: 'type_idx', attributes: ['type'] },
      { collection: 'transactions_collection', key: 'status_transactions_idx', attributes: ['status'] },
      { collection: 'transactions_collection', key: 'date_idx', attributes: ['$createdAt'], orders: ['DESC'] }
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

    // Update users collection with referral attributes
    console.log('\n👤 Adding referral attributes to users collection...');
    const userReferralAttributes = [
      { key: 'referralCode', type: 'string', size: 20, required: false },
      { key: 'referredBy', type: 'string', size: 100, required: false },
      { key: 'totalEarnings', type: 'float', required: false },
      { key: 'availableBalance', type: 'float', required: false },
      { key: 'totalReferrals', type: 'integer', required: false },
      { key: 'isReferralActive', type: 'boolean', required: false }
    ];

    const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';
    
    for (const attr of userReferralAttributes) {
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
          case 'float':
            attribute = await databases.createFloatAttribute(
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
        }
      }
    }

    console.log('\n🎉 Referral and earning system collections created successfully!');
    console.log('\n📋 Collections created:');
    console.log('   - referrals_collection: For tracking referral relationships');
    console.log('   - earnings_collection: For user earning summaries');
    console.log('   - transactions_collection: For tracking all transactions');
    console.log('   - Updated users collection with referral fields');
    
    console.log('\n🔑 Environment variables to add:');
    console.log('NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID=referrals_collection');
    console.log('NEXT_PUBLIC_APPWRITE_EARNINGS_COLLECTION_ID=earnings_collection');
    console.log('NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions_collection');

  } catch (error) {
    console.error('❌ Error creating referral collections:', error.message);
  }
}

// Run the script
createReferralCollections();

module.exports = { createReferralCollections };
