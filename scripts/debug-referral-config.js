/**
 * Debug script to check referral system configuration
 */

console.log('🔍 Debugging Referral System Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'NOT SET');
console.log('NEXT_PUBLIC_APPWRITE_PROJECT_ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'NOT SET');
console.log('NEXT_PUBLIC_APPWRITE_DATABASE_ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'NOT SET');
console.log('NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID:', process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'NOT SET');

// Check if referral-related environment variables exist
console.log('\n🔗 Referral System Environment Variables:');
console.log('NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID:', process.env.NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID || 'NOT SET');
console.log('NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID:', process.env.NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID || 'NOT SET');

console.log('\n✅ Configuration Check Complete');
console.log('\n💡 Next Steps:');
console.log('1. Check browser console for detailed error messages');
console.log('2. Verify database connection in the app');
console.log('3. Ensure user has proper permissions');
console.log('4. Check if collections exist in Appwrite dashboard');
