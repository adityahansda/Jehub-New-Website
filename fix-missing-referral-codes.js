const { Client, Databases, Query } = require('appwrite');

const client = new Client();
const databases = new Databases(client);

// Initialize Appwrite client
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11');

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

// Generate referral code function (same as in pointsService)
function generateReferralCode(name, email) {
  const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const emailCode = email.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X');
  const timestamp = Date.now().toString().slice(-4);
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${nameCode}${emailCode}${timestamp}${randomNum}`;
}

async function fixMissingReferralCodes() {
  try {
    console.log('=== FIXING MISSING REFERRAL CODES ===');
    
    // Get all users without referral codes
    const allUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(100)]
    );
    
    const usersWithoutCodes = allUsers.documents.filter(user => !user.referralCode);
    
    console.log(`Found ${usersWithoutCodes.length} users without referral codes:`);
    
    for (const user of usersWithoutCodes) {
      console.log(`\nProcessing user: ${user.email} (${user.name})`);
      
      // Generate a referral code
      let referralCode;
      let attempts = 0;
      let isUnique = false;
      
      while (!isUnique && attempts < 10) {
        referralCode = generateReferralCode(user.name || 'USER', user.email);
        
        // Check if this code already exists
        const existingUser = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('referralCode', referralCode)]
        );
        
        if (existingUser.documents.length === 0) {
          isUnique = true;
          console.log(`  Generated unique referral code: ${referralCode}`);
        } else {
          attempts++;
          console.log(`  Code ${referralCode} already exists, trying again...`);
        }
      }
      
      if (!isUnique) {
        // Fallback to timestamp-based code
        referralCode = `${user.name.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-6)}`;
        console.log(`  Using fallback code: ${referralCode}`);
      }
      
      // Update the user with the referral code
      try {
        const updatedUser = await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          user.$id,
          {
            referralCode: referralCode,
            isReferralActive: true
          }
        );
        console.log(`  ✅ Successfully added referral code for ${user.email}`);
        console.log(`  Code: ${referralCode}`);
      } catch (updateError) {
        console.error(`  ❌ Failed to update ${user.email}:`, updateError.message);
      }
    }
    
    console.log('\n=== VERIFICATION ===');
    // Verify all users now have referral codes
    const verifyUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(100)]
    );
    
    const stillMissingCodes = verifyUsers.documents.filter(user => !user.referralCode);
    
    console.log(`Users still missing referral codes: ${stillMissingCodes.length}`);
    
    console.log('\nAll users with referral codes:');
    verifyUsers.documents.forEach(user => {
      if (user.referralCode) {
        console.log(`- ${user.email}: ${user.referralCode} (Points: ${user.totalPoints || user.points || 0})`);
      }
    });
    
  } catch (error) {
    console.error('Error fixing referral codes:', error);
  }
}

fixMissingReferralCodes();
