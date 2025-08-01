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
        console.log('✅ Found collection:', collection.name);
        
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
        
        console.log('📝 Applying', newPermissions.length, 'permissions...');
        
        // Update the collection permissions
        const updatedCollection = await databases.updateCollection(
            DATABASE_ID,
            NOTES_COLLECTION_ID,
            collection.name,
            newPermissions,
            collection.documentSecurity !== undefined ? collection.documentSecurity : false,
            collection.enabled !== undefined ? collection.enabled : true
        );
        
        console.log('✅ Successfully updated notes collection permissions!');
        
        if (updatedCollection.permissions && updatedCollection.permissions.length > 0) {
            console.log('📋 New permissions applied:', updatedCollection.permissions.length);
        } else {
            console.log('📋 Permissions updated successfully');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error updating permissions:', error.message);
        if (error.code) {
            console.error('   Error code:', error.code);
        }
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
        console.log(`📊 Found ${response.documents.length} notes in the collection`);
        
        if (response.documents.length > 0) {
            const firstNote = response.documents[0];
            console.log('📝 Sample note:', {
                id: firstNote.$id,
                title: firstNote.title || 'No title',
                subject: firstNote.subject || 'No subject'
            });
        }
        
        return true;
    } catch (error) {
        console.error('❌ Test access failed:', error.message);
        console.error('   This might indicate permission issues still exist');
        return false;
    }
}

async function main() {
    console.log('🚀 Starting permission fix for admin access...\n');
    
    // Check for API key
    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ Missing APPWRITE_API_KEY in environment variables');
        console.log('💡 Add this to your .env file:');
        console.log('   APPWRITE_API_KEY=your_server_api_key_here');
        console.log('\n📝 Get your API key from: Appwrite Console > Settings > API Keys');
        console.log('   Make sure to create a "Server SDK" API key with full database permissions');
        process.exit(1);
    }
    
    console.log('📊 Configuration:');
    console.log('   Database ID:', DATABASE_ID);
    console.log('   Notes Collection ID:', NOTES_COLLECTION_ID);
    console.log('   Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('   Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('');
    
    // Update permissions
    const success = await updateNotesPermissions();
    
    if (success) {
        // Test access
        const accessTest = await testAccess();
        
        if (accessTest) {
            console.log('\n🎉 Permission update completed successfully!');
            console.log('\n💡 Next steps:');
            console.log('1. Restart your development server (npm run dev)');
            console.log('2. Login with an admin account');
            console.log('3. Navigate to /admin-dashboard');
            console.log('4. Click on "Notes Center" in the sidebar');
            console.log('5. You should now see the notes without authorization errors');
        } else {
            console.log('\n⚠️  Permissions updated but access test failed');
            console.log('   You may need to check user roles and authentication');
        }
    } else {
        console.log('\n❌ Permission update failed. Please check the error messages above.');
        console.log('\n🔍 Troubleshooting:');
        console.log('1. Verify your APPWRITE_API_KEY is correct');
        console.log('2. Ensure the API key has "Database" permissions');
        console.log('3. Check that collection IDs are correct');
    }
}

main().catch(console.error);
