require('dotenv').config();
const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const betaWishlistCollectionId = process.env.NEXT_PUBLIC_APPWRITE_BETA_WISHLIST_COLLECTION_ID;

console.log('🔍 Beta Wishlist Troubleshooting Tool');
console.log('=====================================\n');
console.log('Database ID:', databaseId);
console.log('Beta Wishlist Collection ID:', betaWishlistCollectionId);
console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
console.log('\n');

async function checkCollection() {
    try {
        console.log('1️⃣ Checking if beta wishlist collection exists...');
        
        const collection = await databases.getCollection(databaseId, betaWishlistCollectionId);
        
        console.log('✅ Collection found:');
        console.log('   - Name:', collection.name);
        console.log('   - ID:', collection.$id);
        console.log('   - Created:', new Date(collection.$createdAt).toLocaleString());
        console.log('   - Updated:', new Date(collection.$updatedAt).toLocaleString());
        
        return true;
    } catch (error) {
        console.log('❌ Collection not found or error:', error.message);
        return false;
    }
}

async function checkAttributes() {
    try {
        console.log('\n2️⃣ Checking collection attributes...');
        
        const attributes = await databases.listAttributes(databaseId, betaWishlistCollectionId);
        
        console.log('📋 Found', attributes.total, 'attributes:');
        attributes.attributes.forEach(attr => {
            console.log(`   - ${attr.key}: ${attr.type} (required: ${attr.required})`);
        });
        
        // Check for required attributes
        const requiredAttributes = [
            'name', 'branch', 'yearsOfStudy', 'degree', 'collegeName', 
            'email', 'telegramId', 'createdAt', 'status'
        ];
        
        const existingAttributes = attributes.attributes.map(attr => attr.key);
        const missingAttributes = requiredAttributes.filter(attr => !existingAttributes.includes(attr));
        
        if (missingAttributes.length > 0) {
            console.log('\n⚠️  Missing required attributes:', missingAttributes);
            return false;
        } else {
            console.log('\n✅ All required attributes are present');
            return true;
        }
        
    } catch (error) {
        console.log('❌ Error checking attributes:', error.message);
        return false;
    }
}

async function checkPermissions() {
    try {
        console.log('\n3️⃣ Checking collection permissions...');
        
        const collection = await databases.getCollection(databaseId, betaWishlistCollectionId);
        
        console.log('📝 Collection permissions:');
        console.log('   - Read:', collection.$permissions.filter(p => p.includes('read')));
        console.log('   - Create:', collection.$permissions.filter(p => p.includes('create')));
        console.log('   - Update:', collection.$permissions.filter(p => p.includes('update')));
        console.log('   - Delete:', collection.$permissions.filter(p => p.includes('delete')));
        
        return true;
    } catch (error) {
        console.log('❌ Error checking permissions:', error.message);
        return false;
    }
}

async function testCreateDocument() {
    try {
        console.log('\n4️⃣ Testing document creation...');
        
        const testDoc = {
            name: 'Test User',
            branch: 'Computer Science',
            yearsOfStudy: '3rd Year',
            degree: 'B.Tech',
            collegeName: 'Test College',
            email: 'test@example.com',
            telegramId: 'testuser',
            referCode: '',
            createdAt: new Date().toISOString(),
            joinedAt: new Date().toISOString(), // Required field
            status: 'pending',
            isPremium: false,
            hidden: false
        };
        
        const document = await databases.createDocument(
            databaseId,
            betaWishlistCollectionId,
            ID.unique(),
            testDoc
        );
        
        console.log('✅ Test document created successfully!');
        console.log('   - Document ID:', document.$id);
        
        // Clean up test document
        await databases.deleteDocument(databaseId, betaWishlistCollectionId, document.$id);
        console.log('✅ Test document cleaned up');
        
        return true;
    } catch (error) {
        console.log('❌ Error creating test document:', error.message);
        console.log('   - Error type:', error.type);
        console.log('   - Error code:', error.code);
        return false;
    }
}

async function createCollection() {
    try {
        console.log('\n🔧 Creating beta wishlist collection...');
        
        const collection = await databases.createCollection(
            databaseId,
            betaWishlistCollectionId,
            'Beta Wishlist',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );
        
        console.log('✅ Collection created:', collection.name);
        
        // Add required attributes
        const attributes = [
            { key: 'name', type: 'string', size: 100, required: true },
            { key: 'branch', type: 'string', size: 100, required: true },
            { key: 'yearsOfStudy', type: 'string', size: 50, required: true },
            { key: 'degree', type: 'string', size: 50, required: true },
            { key: 'collegeName', type: 'string', size: 200, required: true },
            { key: 'email', type: 'string', size: 100, required: true },
            { key: 'telegramId', type: 'string', size: 100, required: true },
            { key: 'referCode', type: 'string', size: 50, required: false },
            { key: 'createdAt', type: 'string', size: 50, required: true },
            { key: 'status', type: 'string', size: 50, required: false },
            { key: 'isPremium', type: 'boolean', required: false },
            { key: 'hidden', type: 'boolean', required: false }
        ];
        
        console.log('📝 Adding attributes...');
        for (const attr of attributes) {
            try {
                if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        databaseId,
                        betaWishlistCollectionId,
                        attr.key,
                        attr.required || false
                    );
                } else {
                    await databases.createStringAttribute(
                        databaseId,
                        betaWishlistCollectionId,
                        attr.key,
                        attr.size,
                        attr.required || false
                    );
                }
                console.log(`   ✅ Added ${attr.key} (${attr.type})`);
                
                // Wait a bit between attributes to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.log(`   ❌ Error adding ${attr.key}:`, error.message);
            }
        }
        
        console.log('✅ Beta wishlist collection setup complete!');
        return true;
        
    } catch (error) {
        console.log('❌ Error creating collection:', error.message);
        return false;
    }
}

async function main() {
    let collectionExists = await checkCollection();
    
    if (!collectionExists) {
        console.log('\n🔧 Collection does not exist. Creating it...');
        collectionExists = await createCollection();
        
        if (!collectionExists) {
            console.log('❌ Failed to create collection. Please check your API key permissions.');
            return;
        }
    }
    
    if (collectionExists) {
        const attributesOk = await checkAttributes();
        const permissionsOk = await checkPermissions();
        const testOk = await testCreateDocument();
        
        if (attributesOk && permissionsOk && testOk) {
            console.log('\n🎉 All checks passed! Beta wishlist should work correctly now.');
        } else {
            console.log('\n⚠️  Some issues found. Beta wishlist may not work correctly.');
            
            if (!attributesOk) {
                console.log('   - Missing or incorrect attributes');
            }
            if (!permissionsOk) {
                console.log('   - Permission issues');
            }
            if (!testOk) {
                console.log('   - Cannot create documents');
            }
        }
    }
    
    console.log('\n🔍 Debug Information:');
    console.log('   - Make sure your .env file has the correct APPWRITE_API_KEY');
    console.log('   - Ensure the API key has database permissions');
    console.log('   - Check that the project ID and database ID are correct');
    console.log('   - Verify your Appwrite endpoint is accessible');
}

main().catch(error => {
    console.error('❌ Unexpected error:', error);
});
