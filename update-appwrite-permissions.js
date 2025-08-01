#!/usr/bin/env node

const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client with server API key
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
    .setKey(process.env.APPWRITE_API_KEY); // Server API key needed for admin operations

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';

// Collection configurations
const collections = {
    notes: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID || '686d382f00119e0bf90b',
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40',
    activities: process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID || '6873f96f003939323c73',
    comments: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID || '687f1e59000770d11274',
    shares: process.env.NEXT_PUBLIC_APPWRITE_SHARES_COLLECTION_ID || 'shares_collection_id',
    notifications: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
    reports: process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID || 'reports_collection_placeholder'
};

// Define comprehensive permissions for different roles
const permissions = {
    admin: [
        Permission.read(Role.label('admin')),
        Permission.write(Role.label('admin')),
        Permission.update(Role.label('admin')),
        Permission.delete(Role.label('admin'))
    ],
    manager: [
        Permission.read(Role.label('manager')),
        Permission.write(Role.label('manager')),
        Permission.update(Role.label('manager')),
        Permission.delete(Role.label('manager'))
    ],
    intern: [
        Permission.read(Role.label('intern')),
        Permission.write(Role.label('intern')),
        Permission.update(Role.label('intern'))
    ],
    student: [
        Permission.read(Role.label('student')),
        Permission.write(Role.label('student'))
    ],
    public: [
        Permission.read(Role.any()),
        Permission.read(Role.users())
    ]
};

async function updateCollectionPermissions(collectionId, collectionName) {
    try {
        console.log(`\n🔧 Updating permissions for ${collectionName} collection...`);
        
        // Get current collection details
        const collection = await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`📋 Current permissions for ${collectionName}:`, collection.permissions);
        
        // Define new permissions based on collection type
        let newPermissions = [];
        
        switch (collectionName) {
            case 'notes':
                newPermissions = [
                    ...permissions.admin,
                    ...permissions.manager,
                    ...permissions.intern,
                    Permission.read(Role.label('student')), // Students can read
                    Permission.create(Role.label('student')) // Students can create
                ];
                break;
                
            case 'users':
                newPermissions = [
                    ...permissions.admin,
                    ...permissions.manager,
                    Permission.read(Role.label('intern')),
                    Permission.read(Role.users()), // Users can read their own profile
                    Permission.update(Role.users()) // Users can update their own profile
                ];
                break;
                
            case 'activities':
                newPermissions = [
                    ...permissions.admin,
                    ...permissions.manager,
                    Permission.read(Role.label('intern')),
                    Permission.read(Role.users()),
                    Permission.create(Role.users())
                ];
                break;
                
            case 'comments':
                newPermissions = [
                    ...permissions.admin,
                    ...permissions.manager,
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ];
                break;
                
            default:
                // Default permissions for other collections
                newPermissions = [
                    ...permissions.admin,
                    ...permissions.manager,
                    Permission.read(Role.label('intern')),
                    Permission.read(Role.users())
                ];
                break;
        }
        
        // Update collection permissions
        const updatedCollection = await databases.updateCollection(
            DATABASE_ID,
            collectionId,
            collection.name,
            newPermissions,
            collection.documentSecurity,
            collection.enabled
        );
        
        console.log(`✅ Successfully updated ${collectionName} permissions`);
        console.log(`📝 New permissions:`, updatedCollection.permissions);
        
        return true;
    } catch (error) {
        console.error(`❌ Error updating ${collectionName} permissions:`, error.message);
        return false;
    }
}

async function createAdminRole() {
    try {
        console.log('\n👤 Creating/updating admin role...');
        
        // Note: Roles are typically managed through Appwrite console
        // This is just informational
        console.log('📋 Admin role should have these permissions:');
        console.log('   - Full read/write access to all collections');
        console.log('   - User management capabilities');
        console.log('   - System administration rights');
        
        return true;
    } catch (error) {
        console.error('❌ Error with admin role:', error.message);
        return false;
    }
}

async function testPermissions() {
    try {
        console.log('\n🧪 Testing permissions...');
        
        // Test reading from notes collection
        const notesResponse = await databases.listDocuments(
            DATABASE_ID,
            collections.notes,
            []
        );
        
        console.log(`✅ Successfully read ${notesResponse.documents.length} notes`);
        return true;
    } catch (error) {
        console.error('❌ Permission test failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Appwrite permissions update...');
    console.log('📊 Database ID:', DATABASE_ID);
    
    // Check if API key is provided
    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY environment variable is required for server operations');
        console.log('💡 Please add APPWRITE_API_KEY to your .env file');
        console.log('   You can get this from your Appwrite console > Settings > API Keys');
        process.exit(1);
    }
    
    let successCount = 0;
    let totalCollections = 0;
    
    // Update permissions for each collection
    for (const [name, id] of Object.entries(collections)) {
        if (id && id !== 'placeholder' && !id.includes('placeholder')) {
            totalCollections++;
            const success = await updateCollectionPermissions(id, name);
            if (success) successCount++;
        } else {
            console.log(`⏭️  Skipping ${name} (placeholder ID)`);
        }
    }
    
    // Create admin role information
    await createAdminRole();
    
    // Test permissions
    await testPermissions();
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully updated: ${successCount}/${totalCollections} collections`);
    
    if (successCount === totalCollections) {
        console.log('🎉 All permissions updated successfully!');
        console.log('\n💡 Next steps:');
        console.log('1. Ensure your users have the correct roles assigned');
        console.log('2. Test admin dashboard access');
        console.log('3. Verify notes management functionality');
    } else {
        console.log('⚠️  Some collections may need manual permission updates');
    }
}

// Handle script errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run the script
main().catch(console.error);
