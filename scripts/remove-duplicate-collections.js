require('dotenv').config();
const { Client, Databases, ID, Query } = require('node-appwrite');
const readline = require('readline');

// Initialize Appwrite client
const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function listAllCollections() {
    try {
        console.log('📋 Fetching all collections from Appwrite database...\n');
        const response = await databases.listCollections(databaseId);
        return response.collections;
    } catch (error) {
        console.error('❌ Error fetching collections:', error.message);
        return [];
    }
}

async function getDocumentCount(collectionId) {
    try {
        const response = await databases.listDocuments(databaseId, collectionId, [
            Query.limit(1)
        ]);
        return response.total;
    } catch (error) {
        console.error(`❌ Error getting document count for collection ${collectionId}:`, error.message);
        return -1; // Return -1 to indicate error
    }
}

async function analyzeCollections() {
    const collections = await listAllCollections();
    
    if (collections.length === 0) {
        console.log('❌ No collections found or error occurred.');
        return { emptyCollections: [], duplicates: [] };
    }

    console.log(`📊 Found ${collections.length} collections. Analyzing...\n`);
    
    const collectionInfo = [];
    const emptyCollections = [];
    const duplicates = [];

    // Get document count for each collection
    for (const collection of collections) {
        const docCount = await getDocumentCount(collection.$id);
        const info = {
            id: collection.$id,
            name: collection.name,
            documentCount: docCount,
            created: collection.$createdAt
        };
        
        collectionInfo.push(info);
        
        if (docCount === 0) {
            emptyCollections.push(info);
        }
        
        console.log(`📁 ${collection.name} (${collection.$id}): ${docCount === -1 ? 'Error' : docCount + ' documents'}`);
    }

    // Find potential duplicates based on naming patterns
    console.log('\n🔍 Analyzing for potential duplicates...\n');
    
    const nameGroups = {};
    
    collectionInfo.forEach(info => {
        // Group by similar names (case insensitive, removing special characters)
        const normalizedName = info.name.toLowerCase()
            .replace(/[_-]/g, '')
            .replace(/\s+/g, '');
        
        if (!nameGroups[normalizedName]) {
            nameGroups[normalizedName] = [];
        }
        nameGroups[normalizedName].push(info);
    });

    // Identify groups with multiple collections (potential duplicates)
    Object.values(nameGroups).forEach(group => {
        if (group.length > 1) {
            duplicates.push({
                groupName: group[0].name,
                collections: group.sort((a, b) => new Date(a.created) - new Date(b.created))
            });
        }
    });

    return { emptyCollections, duplicates, allCollections: collectionInfo };
}

async function displayResults(emptyCollections, duplicates) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🗂️  Empty Collections (${emptyCollections.length}):`);
    if (emptyCollections.length === 0) {
        console.log('   ✅ No empty collections found!');
    } else {
        emptyCollections.forEach((collection, index) => {
            console.log(`   ${index + 1}. ${collection.name} (${collection.id}) - Created: ${new Date(collection.created).toLocaleDateString()}`);
        });
    }
    
    console.log(`\n🔄 Potential Duplicate Groups (${duplicates.length}):`);
    if (duplicates.length === 0) {
        console.log('   ✅ No potential duplicates found!');
    } else {
        duplicates.forEach((group, index) => {
            console.log(`\n   Group ${index + 1}: "${group.groupName}" variations:`);
            group.collections.forEach((collection, idx) => {
                const status = collection.documentCount === 0 ? '(EMPTY)' : `(${collection.documentCount} docs)`;
                const age = idx === 0 ? '(OLDEST)' : idx === group.collections.length - 1 ? '(NEWEST)' : '';
                console.log(`     - ${collection.name} ${status} ${age}`);
                console.log(`       ID: ${collection.id} | Created: ${new Date(collection.created).toLocaleDateString()}`);
            });
        });
    }
}

async function removeCollection(collectionId, collectionName) {
    try {
        await databases.deleteCollection(databaseId, collectionId);
        console.log(`✅ Successfully removed collection: ${collectionName} (${collectionId})`);
        return true;
    } catch (error) {
        console.error(`❌ Error removing collection ${collectionName}:`, error.message);
        return false;
    }
}

async function handleEmptyCollectionRemoval(emptyCollections) {
    if (emptyCollections.length === 0) return;
    
    console.log('\n' + '='.repeat(60));
    console.log('🗑️  EMPTY COLLECTION REMOVAL');
    console.log('='.repeat(60));
    
    const answer = await askQuestion(`\nDo you want to remove all ${emptyCollections.length} empty collections? (y/N): `);
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🚀 Removing empty collections...\n');
        
        let successCount = 0;
        for (const collection of emptyCollections) {
            const success = await removeCollection(collection.id, collection.name);
            if (success) successCount++;
        }
        
        console.log(`\n✅ Successfully removed ${successCount} out of ${emptyCollections.length} empty collections.`);
    } else {
        console.log('❌ Skipped empty collection removal.');
    }
}

async function handleDuplicateRemoval(duplicates) {
    if (duplicates.length === 0) return;
    
    console.log('\n' + '='.repeat(60));
    console.log('🔄 DUPLICATE COLLECTION REMOVAL');
    console.log('='.repeat(60));
    
    for (const group of duplicates) {
        console.log(`\n📁 Processing duplicate group: "${group.groupName}"`);
        
        const emptyDuplicates = group.collections.filter(c => c.documentCount === 0);
        
        if (emptyDuplicates.length === 0) {
            console.log('   ℹ️  No empty duplicates in this group. Skipping...');
            continue;
        }
        
        if (emptyDuplicates.length === group.collections.length) {
            // All are empty - keep the oldest one
            const toRemove = emptyDuplicates.slice(1); // Remove all except the first (oldest)
            console.log(`   ⚠️  All collections in this group are empty. Keeping the oldest one.`);
            console.log(`   🔍 Will remove ${toRemove.length} duplicate(s):`);
            toRemove.forEach(c => console.log(`      - ${c.name} (${c.id})`));
            
            const answer = await askQuestion('   Remove these duplicates? (y/N): ');
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                let successCount = 0;
                for (const collection of toRemove) {
                    const success = await removeCollection(collection.id, collection.name);
                    if (success) successCount++;
                }
                console.log(`   ✅ Removed ${successCount} out of ${toRemove.length} duplicate collections.`);
            }
        } else {
            // Some have data - only remove empty ones
            console.log(`   🔍 Will remove ${emptyDuplicates.length} empty duplicate(s):`);
            emptyDuplicates.forEach(c => console.log(`      - ${c.name} (${c.id})`));
            
            const answer = await askQuestion('   Remove these empty duplicates? (y/N): ');
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                let successCount = 0;
                for (const collection of emptyDuplicates) {
                    const success = await removeCollection(collection.id, collection.name);
                    if (success) successCount++;
                }
                console.log(`   ✅ Removed ${successCount} out of ${emptyDuplicates.length} empty duplicate collections.`);
            }
        }
    }
}

async function main() {
    console.log('🚀 Appwrite Collection Cleanup Tool');
    console.log('=====================================\n');
    
    const { emptyCollections, duplicates } = await analyzeCollections();
    
    await displayResults(emptyCollections, duplicates);
    
    if (emptyCollections.length > 0 || duplicates.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('🛠️  CLEANUP OPTIONS');
        console.log('='.repeat(60));
        console.log('1. Remove empty collections');
        console.log('2. Remove duplicate collections (empty ones only)');
        console.log('3. Both');
        console.log('4. Exit without changes');
        
        const choice = await askQuestion('\nSelect an option (1-4): ');
        
        switch (choice) {
            case '1':
                await handleEmptyCollectionRemoval(emptyCollections);
                break;
            case '2':
                await handleDuplicateRemoval(duplicates);
                break;
            case '3':
                await handleEmptyCollectionRemoval(emptyCollections);
                await handleDuplicateRemoval(duplicates);
                break;
            case '4':
            default:
                console.log('👋 Exiting without changes.');
                break;
        }
    } else {
        console.log('\n✅ No cleanup needed! Your database looks clean.');
    }
    
    console.log('\n🎉 Script completed!');
    rl.close();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    rl.close();
    process.exit(0);
});

// Run the script
main().catch(error => {
    console.error('❌ Unexpected error:', error);
    rl.close();
    process.exit(1);
});
