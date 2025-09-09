require('dotenv').config();
const { Client, Databases, ID } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const betaWishlistCollectionId = process.env.NEXT_PUBLIC_APPWRITE_BETA_WISHLIST_COLLECTION_ID;

console.log('🔧 Beta Wishlist Attribute Fixer');
console.log('==================================\n');

async function fixAttributes() {
    try {
        // Get current attributes
        console.log('1️⃣ Getting current collection attributes...');
        const attributes = await databases.listAttributes(databaseId, betaWishlistCollectionId);
        
        console.log('📋 Current attributes:');
        const currentAttrs = {};
        attributes.attributes.forEach(attr => {
            currentAttrs[attr.key] = attr;
            console.log(`   - ${attr.key}: ${attr.type} (required: ${attr.required})`);
        });
        
        // Make joinedAt optional if it exists and is required
        if (currentAttrs.joinedAt && currentAttrs.joinedAt.required) {
            console.log('\n2️⃣ Making joinedAt attribute optional...');
            try {
                // We can't directly update an attribute's required status in Appwrite
                // But we can work around this by updating the API code to handle it
                console.log('⚠️  Cannot make joinedAt optional directly in Appwrite.');
                console.log('   Instead, we\'ll update the API to handle this field.');
            } catch (error) {
                console.log('❌ Error updating joinedAt:', error.message);
            }
        }
        
        // Check if createdAt is datetime or string
        if (currentAttrs.createdAt && currentAttrs.createdAt.type === 'datetime') {
            console.log('\n3️⃣ Note: createdAt is datetime type, API should send proper datetime format');
        }
        
        console.log('\n4️⃣ Testing document creation with proper attributes...');
        
        const testDoc = {
            name: 'Test User Fix',
            branch: 'Computer Science',
            yearsOfStudy: '3rd Year',
            degree: 'B.Tech',
            collegeName: 'Test College',
            email: 'testfix@example.com',
            telegramId: 'testuser123',
            referCode: '',
            status: 'pending',
            isPremium: false,
            hidden: false,
            // Add the required joinedAt field
            joinedAt: new Date().toISOString(),
            // Add createdAt as datetime
            createdAt: new Date().toISOString()
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
        console.log('❌ Error:', error.message);
        console.log('   - Error type:', error.type);
        console.log('   - Error code:', error.code);
        return false;
    }
}

async function main() {
    const success = await fixAttributes();
    
    if (success) {
        console.log('\n🎉 Collection attributes are working correctly!');
        console.log('\n📝 API Update Required:');
        console.log('   The beta-wishlist API endpoints need to be updated to include:');
        console.log('   - joinedAt: new Date().toISOString() (required field)');
        console.log('   - createdAt: new Date().toISOString() (datetime format)');
    } else {
        console.log('\n❌ Issues remain. Check the error messages above.');
    }
}

main().catch(error => {
    console.error('❌ Unexpected error:', error);
});
