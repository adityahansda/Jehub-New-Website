const { Client, Databases, Query } = require('appwrite');

const client = new Client();
const databases = new Databases(client);

// Initialize Appwrite client
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('686d35da003a55dfcc11'); // Your project ID

const DATABASE_ID = '686d370a000cfabbd998';
const USERS_COLLECTION_ID = '6873f4f10034ced70a40';

async function checkReferralCodes() {
  try {
    console.log('=== CHECKING REFERRAL CODES IN DATABASE ===');
    
    // Get all users
    const allUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(100)]
    );
    
    console.log(`Total users found: ${allUsers.documents.length}`);
    
    // Check which users have referral codes
    const usersWithCodes = allUsers.documents.filter(user => user.referralCode);
    const usersWithoutCodes = allUsers.documents.filter(user => !user.referralCode);
    
    console.log(`\nUsers WITH referral codes: ${usersWithCodes.length}`);
    usersWithCodes.forEach(user => {
      console.log(`- ${user.email}: ${user.referralCode} (Points: ${user.totalPoints || user.points || 0})`);
    });
    
    console.log(`\nUsers WITHOUT referral codes: ${usersWithoutCodes.length}`);
    usersWithoutCodes.forEach(user => {
      console.log(`- ${user.email} (Points: ${user.totalPoints || user.points || 0})`);
    });
    
    // Check if the specific referral code ADIAD60802611 exists
    console.log('\n=== CHECKING SPECIFIC REFERRAL CODE ===');
    const specificCodeSearch = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('referralCode', 'ADIAD60802611')]
    );
    
    if (specificCodeSearch.documents.length > 0) {
      const owner = specificCodeSearch.documents[0];
      console.log(`Referral code ADIAD60802611 belongs to: ${owner.email}`);
      console.log(`Owner's points: ${owner.totalPoints || owner.points || 0}`);
      console.log(`Owner's name: ${owner.name}`);
    } else {
      console.log('Referral code ADIAD60802611 NOT FOUND in database!');
    }
    
  } catch (error) {
    console.error('Error checking referral codes:', error);
  }
}

checkReferralCodes();
