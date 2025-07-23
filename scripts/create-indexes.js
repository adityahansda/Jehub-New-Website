const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const collections = {
    notes: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID,
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    activities: process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID,
    comments: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID
};

// Validate required environment variables
function validateConfig() {
    const required = ['NEXT_PUBLIC_APPWRITE_ENDPOINT', 'NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'NEXT_PUBLIC_APPWRITE_DATABASE_ID', 'APPWRITE_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing.join(', '));
        process.exit(1);
    } else {
        console.log('✓ Environment variables validated');
    }
}

async function createIndexes() {
    console.log('Creating database indexes...');

    try {
        // Notes Collection Indexes
        console.log('Creating indexes for notes collection...');
        
        await databases.createIndex(
            databaseId,
            collections.notes,
            'user_id_index',
            'key',
            ['userId'],
            ['asc']
        );
        console.log('✓ Created user_id_index for notes');

        await databases.createIndex(
            databaseId,
            collections.notes,
            'title_index',
            'key',
            ['title'],
            ['asc']
        );
        console.log('✓ Created title_index for notes');

        await databases.createIndex(
            databaseId,
            collections.notes,
            'search_index',
            'fulltext',
            ['title', 'description'],
            ['asc', 'asc']
        );
        console.log('✓ Created search_index for notes');

        await databases.createIndex(
            databaseId,
            collections.notes,
            'created_at_index',
            'key',
            ['$createdAt'],
            ['desc']
        );
        console.log('✓ Created created_at_index for notes');

        await databases.createIndex(
            databaseId,
            collections.notes,
            'user_status_index',
            'key',
            ['userId', 'status'],
            ['asc', 'asc']
        );
        console.log('✓ Created user_status_index for notes');

        // Users Collection Indexes
        console.log('Creating indexes for users collection...');

        await databases.createIndex(
            databaseId,
            collections.users,
            'email_unique',
            'unique',
            ['email'],
            ['asc']
        );
        console.log('✓ Created email_unique index for users');

        await databases.createIndex(
            databaseId,
            collections.users,
            'username_index',
            'key',
            ['username'],
            ['asc']
        );
        console.log('✓ Created username_index for users');

        await databases.createIndex(
            databaseId,
            collections.users,
            'points_index',
            'key',
            ['points'],
            ['desc']
        );
        console.log('✓ Created points_index for users');

        // Activities Collection Indexes
        console.log('Creating indexes for activities collection...');

        await databases.createIndex(
            databaseId,
            collections.activities,
            'user_activity_index',
            'key',
            ['userId'],
            ['asc']
        );
        console.log('✓ Created user_activity_index');

        await databases.createIndex(
            databaseId,
            collections.activities,
            'timestamp_index',
            'key',
            ['$createdAt'],
            ['desc']
        );
        console.log('✓ Created timestamp_index for activities');

        await databases.createIndex(
            databaseId,
            collections.activities,
            'user_type_index',
            'key',
            ['userId', 'type'],
            ['asc', 'asc']
        );
        console.log('✓ Created user_type_index for activities');

        // Comments Collection Indexes (if collection exists)
        if (collections.comments) {
            console.log('Creating indexes for comments collection...');
            
            await databases.createIndex(
                databaseId,
                collections.comments,
                'note_id_index',
                'key',
                ['noteId'],
                ['asc']
            );
            console.log('✓ Created note_id_index for comments');

            await databases.createIndex(
                databaseId,
                collections.comments,
                'user_id_index',
                'key',
                ['userId'],
                ['asc']
            );
            console.log('✓ Created user_id_index for comments');

            await databases.createIndex(
                databaseId,
                collections.comments,
                'created_at_index',
                'key',
                ['$createdAt'],
                ['desc']
            );
            console.log('✓ Created created_at_index for comments');

            await databases.createIndex(
                databaseId,
                collections.comments,
                'note_user_index',
                'key',
                ['noteId', 'userId'],
                ['asc', 'asc']
            );
            console.log('✓ Created note_user_index for comments');
        }

        console.log('\n🎉 All indexes created successfully!');

    } catch (error) {
        if (error.type === 'index_already_exists') {
            console.log('⚠️  Some indexes already exist, skipping...');
        } else {
            console.error('❌ Error creating indexes:', error);
            console.error('Error details:', error.message);
            process.exit(1);
        }
    }
}

// Enhanced index creation with retry logic
async function createIndexWithRetry(databaseId, collectionId, indexKey, type, attributes, orders, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await databases.createIndex(databaseId, collectionId, indexKey, type, attributes, orders);
            return true;
        } catch (error) {
            if (error.type === 'index_already_exists') {
                console.log(`⚠️  Index '${indexKey}' already exists, skipping...`);
                return true;
            }
            if (i === retries - 1) throw error;
            console.log(`⚠️  Retry ${i + 1}/${retries} for index '${indexKey}'...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Progressive delay
        }
    }
}

// Main execution
(async () => {
    try {
        validateConfig();
        console.log('Starting automatic index creation for Appwrite database...');
        console.log('Database ID:', databaseId);
        console.log('Collections:', Object.keys(collections).filter(key => collections[key]));
        console.log('\n' + '='.repeat(50));
        
        await createIndexes();
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Index creation completed successfully!');
        console.log('📊 Database performance should now be significantly improved!');
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
})();
