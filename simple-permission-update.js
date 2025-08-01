#!/usr/bin/env node

const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Configuration
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const NOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID || '686d382f00119e0bf90b';

async function updateNotesPermissions() {
    try {
        console.log('🔧 Updating Notes Collection Permissions...');
        
        // Get current collection
        const collection = await databases.getCollection(DATABASE_ID, NOTES_COLLECTION_ID);
        console.log('Current collection name:', collection.name);
        
        // Define comprehensive permissions for notes
        const newPermissions = [
            // Admin permissions - full access
            Permission.read(Role.label('admin')),
            Permission.create(Role.label('admin')),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin')),
            
            // Manager permissions - full access
            Permission.read(Role.label('manager')),
            Permission.create(Role.label('manager')),
            Permission.update(Role.label('manager')),
            Permission.delete(Role.label('manager')),
            
            // Intern permissions - read, create, update
            Permission.read(Role.label('intern')),
            Permission.create(Role.label('intern')),
            Permission.update(Role.label('intern')),
            
            // Student permissions - read and create only
            Permission.read(Role.label('student')),
            Permission.create(Role.label('student')),
            
            // Any authenticated user can read
            Permission.read(Role.users()),
            
            // Fallback: any user can read (for testing)
            Permission.read(Role.any())
        ];
        
        // Update the collection permissions
        const updatedCollection = await databases.updateCollection(
            DATABASE_ID,
            NOTES_COLLECTION_ID,
            collection.name,
            newPermissions,
            collection.documentSecurity || false,
            collection.enabled || true
        );
        
        console.log('✅ Successfully updated notes collection permissions!');
        console.log('📝 New permissions count:', updatedCollection.permissions.length);
        console.log('📋 Updated permissions:', updatedCollection.permissions);
        
        return true;
    } catch (error) {
        console.error('❌ Error updating permissions:', error);
        return false;
    }
}

async function testAccess() {
    try {
        console.log('\n🧪 Testing database access...');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            NOTES_COLLECTION_ID,
            []
        );
        
        console.log(`✅ Successfully accessed notes collection!`);
        console.log(`📊 Found ${response.documents.length} notes`);
        return true;
    } catch (error) {
        console.error('❌ Test access failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting simple permission update for admin access...\n');
    
    // Check for API key
    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ Missing APPWRITE_API_KEY in environment variables');
        console.log('💡 Add this to your .env file:');
        console.log('   APPWRITE_API_KEY=your_server_api_key_here');
        console.log('\n📝 Get your API key from: Appwrite Console > Settings > API Keys');
        process.exit(1);
    }
    
    console.log('📊 Configuration:');
    console.log('   Database ID:', DATABASE_ID);
    console.log('   Notes Collection ID:', NOTES_COLLECTION_ID);
    console.log('   Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('   Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    
    // Update permissions
    const success = await updateNotesPermissions();
    
    if (success) {
        // Test access
        await testAccess();
        
        console.log('\n🎉 Permission update completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('1. Restart your development server');
        console.log('2. Login with an admin account');
        console.log('3. Try accessing the admin dashboard notes section');
    } else {
        console.log('\n❌ Permission update failed. Please check the error messages above.');
    }
}

main().catch(console.error);
