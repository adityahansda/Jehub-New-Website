// Server-side script to clean up orphaned user accounts
// Run this with: node cleanup-orphaned-accounts.js
// NOTE: This requires server-side API key with appropriate permissions

const { Client, Users, Databases } = require('node-appwrite');

// You'll need to set these environment variables or replace with your values
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Server-side API key required
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';

if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY environment variable is required for server-side operations');
    console.log('Please set your server-side API key:');
    console.log('   export APPWRITE_API_KEY=your_api_key_here');
    console.log('   node cleanup-orphaned-accounts.js');
    process.exit(1);
}

// Initialize Appwrite client for server-side operations
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const users = new Users(client);
const databases = new Databases(client);

const cleanupOrphanedAccounts = async () => {
    try {
        console.log('🔍 Starting cleanup of orphaned user accounts...');
        
        // Get all users from Appwrite Auth
        const authUsers = await users.list();
        console.log(`Found ${authUsers.users.length} users in Appwrite Auth`);
        
        // Get all user profiles from database
        const profilesResponse = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID
        );
        
        const profileUserIds = new Set(profilesResponse.documents.map(profile => profile.userId));
        console.log(`Found ${profilesResponse.documents.length} user profiles in database`);
        
        // Find orphaned accounts (auth users without profiles)
        const orphanedAccounts = authUsers.users.filter(user => !profileUserIds.has(user.$id));
        
        if (orphanedAccounts.length === 0) {
            console.log('✅ No orphaned accounts found. All accounts have corresponding profiles.');
            return;
        }
        
        console.log(`🚨 Found ${orphanedAccounts.length} orphaned accounts:`);
        orphanedAccounts.forEach(account => {
            console.log(`   - ${account.email} (${account.name}) - Created: ${account.$createdAt}`);
        });
        
        // Ask for confirmation before deletion
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const shouldDelete = await new Promise((resolve) => {
            rl.question('Do you want to delete these orphaned accounts? (y/N): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
            });
        });
        
        if (!shouldDelete) {
            console.log('❌ Cleanup cancelled by user.');
            return;
        }
        
        // Delete orphaned accounts
        let deletedCount = 0;
        let failedCount = 0;
        
        for (const account of orphanedAccounts) {
            try {
                await users.delete(account.$id);
                console.log(`✅ Deleted orphaned account: ${account.email}`);
                deletedCount++;
            } catch (error) {
                console.error(`❌ Failed to delete account ${account.email}:`, error.message);
                failedCount++;
            }
        }
        
        console.log(`\n📊 Cleanup Summary:`);
        console.log(`   - Deleted: ${deletedCount} accounts`);
        console.log(`   - Failed: ${failedCount} accounts`);
        console.log(`   - Total processed: ${orphanedAccounts.length} accounts`);
        
        if (deletedCount > 0) {
            console.log('🎉 Orphaned accounts cleanup completed successfully!');
        }
