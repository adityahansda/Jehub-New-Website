const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection configuration
const collections = {
    notes: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID,
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    activities: process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID,
    comments: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID
};

// Comprehensive index configuration with performance optimization
const indexConfig = {
    notes: [
        { key: 'user_id_index', type: 'key', attributes: ['userId'], orders: ['asc'], priority: 'high' },
        { key: 'title_index', type: 'key', attributes: ['title'], orders: ['asc'], priority: 'medium' },
        { key: 'search_index', type: 'fulltext', attributes: ['title', 'description'], orders: ['asc', 'asc'], priority: 'high' },
        { key: 'created_at_index', type: 'key', attributes: ['$createdAt'], orders: ['desc'], priority: 'high' },
        { key: 'updated_at_index', type: 'key', attributes: ['$updatedAt'], orders: ['desc'], priority: 'medium' },
        { key: 'user_status_index', type: 'key', attributes: ['userId', 'status'], orders: ['asc', 'asc'], priority: 'high' },
        { key: 'category_index', type: 'key', attributes: ['category'], orders: ['asc'], priority: 'medium' },
        { key: 'user_category_index', type: 'key', attributes: ['userId', 'category'], orders: ['asc', 'asc'], priority: 'medium' },
        { key: 'visibility_index', type: 'key', attributes: ['visibility'], orders: ['asc'], priority: 'low' },
        { key: 'tags_index', type: 'key', attributes: ['tags'], orders: ['asc'], priority: 'medium' }
    ],
    users: [
        { key: 'email_unique', type: 'unique', attributes: ['email'], orders: ['asc'], priority: 'critical' },
        { key: 'username_index', type: 'key', attributes: ['username'], orders: ['asc'], priority: 'high' },
        { key: 'points_index', type: 'key', attributes: ['points'], orders: ['desc'], priority: 'high' },
        { key: 'created_at_index', type: 'key', attributes: ['$createdAt'], orders: ['desc'], priority: 'medium' },
        { key: 'last_active_index', type: 'key', attributes: ['lastActive'], orders: ['desc'], priority: 'medium' },
        { key: 'role_index', type: 'key', attributes: ['role'], orders: ['asc'], priority: 'medium' },
        { key: 'status_index', type: 'key', attributes: ['status'], orders: ['asc'], priority: 'medium' },
        { key: 'verification_status_index', type: 'key', attributes: ['isVerified'], orders: ['asc'], priority: 'low' }
    ],
    activities: [
        { key: 'user_activity_index', type: 'key', attributes: ['userId'], orders: ['asc'], priority: 'high' },
        { key: 'timestamp_index', type: 'key', attributes: ['$createdAt'], orders: ['desc'], priority: 'high' },
        { key: 'user_type_index', type: 'key', attributes: ['userId', 'type'], orders: ['asc', 'asc'], priority: 'high' },
        { key: 'type_index', type: 'key', attributes: ['type'], orders: ['asc'], priority: 'medium' },
        { key: 'resource_id_index', type: 'key', attributes: ['resourceId'], orders: ['asc'], priority: 'medium' },
        { key: 'user_date_index', type: 'key', attributes: ['userId', '$createdAt'], orders: ['asc', 'desc'], priority: 'high' }
    ],
    comments: [
        { key: 'note_id_index', type: 'key', attributes: ['noteId'], orders: ['asc'], priority: 'high' },
        { key: 'user_id_index', type: 'key', attributes: ['userId'], orders: ['asc'], priority: 'high' },
        { key: 'created_at_index', type: 'key', attributes: ['$createdAt'], orders: ['desc'], priority: 'high' },
        { key: 'note_user_index', type: 'key', attributes: ['noteId', 'userId'], orders: ['asc', 'asc'], priority: 'medium' },
        { key: 'parent_comment_index', type: 'key', attributes: ['parentId'], orders: ['asc'], priority: 'medium' },
        { key: 'note_created_index', type: 'key', attributes: ['noteId', '$createdAt'], orders: ['asc', 'desc'], priority: 'high' }
    ]
};

// Validation functions
function validateConfig() {
    const required = [
        'NEXT_PUBLIC_APPWRITE_ENDPOINT',
        'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
        'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
        'APPWRITE_API_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        process.exit(1);
    }
    
    console.log('✅ Environment configuration validated');
    return true;
}

function validateCollections() {
    const availableCollections = Object.keys(collections).filter(key => collections[key]);
    console.log('📋 Available collections:', availableCollections.join(', '));
    
    if (availableCollections.length === 0) {
        console.warn('⚠️  No collection IDs found in environment variables');
        return false;
    }
    
    return availableCollections;
}

// Enhanced index creation with retry and progress tracking
async function createIndexWithRetry(databaseId, collectionId, indexConfig, retries = 3) {
    const { key, type, attributes, orders } = indexConfig;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await databases.createIndex(databaseId, collectionId, key, type, attributes, orders);
            return { success: true, message: `✅ Created ${key}` };
        } catch (error) {
            if (error.code === 409 || error.message?.includes('already exists')) {
                return { success: true, message: `⚡ ${key} already exists`, skipped: true };
            }
            
            if (attempt === retries) {
                return { 
                    success: false, 
                    message: `❌ Failed to create ${key}: ${error.message}`,
                    error: error.message 
                };
            }
            
            console.log(`   ⏳ Retry ${attempt}/${retries} for ${key}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// Progress tracking
function displayProgress(current, total, collectionName) {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    process.stdout.write(`\r   [${progressBar}] ${percentage}% - ${collectionName}`);
}

// Main index creation function
async function createIndexesForCollection(collectionName, collectionId) {
    if (!collectionId) {
        console.log(`⚠️  Skipping ${collectionName} - Collection ID not provided`);
        return { total: 0, created: 0, skipped: 0, failed: 0 };
    }

    const indexes = indexConfig[collectionName] || [];
    if (indexes.length === 0) {
        console.log(`⚠️  No index configuration found for ${collectionName}`);
        return { total: 0, created: 0, skipped: 0, failed: 0 };
    }

    console.log(`\n🔧 Processing ${collectionName} collection (${indexes.length} indexes)`);
    
    let stats = { total: indexes.length, created: 0, skipped: 0, failed: 0 };
    const results = [];

    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    indexes.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

    for (let i = 0; i < indexes.length; i++) {
        const indexConf = indexes[i];
        displayProgress(i + 1, indexes.length, collectionName);
        
        const result = await createIndexWithRetry(databaseId, collectionId, indexConf);
        results.push(result);
        
        if (result.success) {
            if (result.skipped) {
                stats.skipped++;
            } else {
                stats.created++;
            }
        } else {
            stats.failed++;
        }
    }
    
    console.log(''); // New line after progress bar
    
    // Display detailed results
    results.forEach(result => {
        console.log(`   ${result.message}`);
    });

    return stats;
}

// Index monitoring and validation
async function validateIndexes() {
    console.log('\n🔍 Validating created indexes...');
    
    for (const [collectionName, collectionId] of Object.entries(collections)) {
        if (!collectionId) continue;
        
        try {
            const collection = await databases.getCollection(databaseId, collectionId);
            console.log(`📊 ${collectionName}: ${collection.indexes?.length || 0} indexes active`);
        } catch (error) {
            console.log(`❌ Could not validate ${collectionName}: ${error.message}`);
        }
    }
}

// Performance recommendations
function displayPerformanceRecommendations() {
    console.log('\n📈 Performance Optimization Tips:');
    console.log('   • Monitor query performance in Appwrite Console');
    console.log('   • Remove unused indexes to improve write performance');
    console.log('   • Consider compound indexes for multi-field queries');
    console.log('   • Use full-text search indexes for content search');
    console.log('   • Regular maintenance: run this script periodically');
}

// Main execution function
async function autoIndexManager() {
    console.log('🚀 Appwrite Automatic Index Manager');
    console.log('=====================================\n');
    
    try {
        // Step 1: Validate configuration
        validateConfig();
        const availableCollections = validateCollections();
        
        if (!availableCollections) {
            console.log('❌ No collections available for indexing');
            process.exit(1);
        }

        console.log(`\n📊 Database ID: ${databaseId}`);
        console.log(`🎯 Target Collections: ${availableCollections.length}`);
        console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
        
        // Step 2: Create indexes for each collection
        let totalStats = { total: 0, created: 0, skipped: 0, failed: 0 };
        
        for (const collectionName of availableCollections) {
            const collectionId = collections[collectionName];
            const stats = await createIndexesForCollection(collectionName, collectionId);
            
            totalStats.total += stats.total;
            totalStats.created += stats.created;
            totalStats.skipped += stats.skipped;
            totalStats.failed += stats.failed;
        }
        
        // Step 3: Validate and report results
        await validateIndexes();
        
        console.log('\n' + '='.repeat(50));
        console.log('📈 Index Creation Summary:');
        console.log(`   Total Indexes: ${totalStats.total}`);
        console.log(`   ✅ Created: ${totalStats.created}`);
        console.log(`   ⚡ Skipped (existing): ${totalStats.skipped}`);
        console.log(`   ❌ Failed: ${totalStats.failed}`);
        
        if (totalStats.failed > 0) {
            console.log('\n⚠️  Some indexes failed to create. Check the logs above for details.');
        } else {
            console.log('\n🎉 All indexes processed successfully!');
        }
        
        displayPerformanceRecommendations();
        
        console.log(`\n⏰ Completed at: ${new Date().toLocaleString()}`);
        console.log('=====================================');
        
    } catch (error) {
        console.error('\n💥 Fatal Error:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    autoIndexManager();
}

module.exports = {
    autoIndexManager,
    createIndexesForCollection,
    validateConfig,
    indexConfig
};
