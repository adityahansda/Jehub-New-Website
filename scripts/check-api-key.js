/**
 * Script to check API key configuration and provide manual instructions
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

console.log('🔍 Checking Appwrite Configuration...\n');

// Check environment variables
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

console.log('Environment Variables:');
console.log('📍 Endpoint:', endpoint);
console.log('🏗️  Project ID:', projectId);
console.log('🗄️  Database ID:', databaseId);
console.log('🔑 API Key:', apiKey === 'your_appwrite_server_api_key_here' ? '❌ PLACEHOLDER' : apiKey ? '✅ SET' : '❌ MISSING');

if (!apiKey || apiKey === 'your_appwrite_server_api_key_here') {
    console.log('\n❌ API Key Issue Detected!');
    console.log('\n📋 To fix this, you need to:');
    console.log('1. Go to: https://nyc.cloud.appwrite.io/console/project-' + projectId + '/settings/keys');
    console.log('2. Click "Create API Key"');
    console.log('3. Name it "Server API Key"');
    console.log('4. Select these scopes:');
    console.log('   ✅ databases.read');
    console.log('   ✅ databases.write');
    console.log('   ✅ collections.read');
    console.log('   ✅ collections.write');
    console.log('   ✅ attributes.read');
    console.log('   ✅ attributes.write');
    console.log('   ✅ documents.read');
    console.log('   ✅ documents.write');
    console.log('5. Copy the generated key');
    console.log('6. Replace "your_appwrite_server_api_key_here" in your .env file with the actual key');
    console.log('\n🔗 Direct link: https://nyc.cloud.appwrite.io/console/project-' + projectId + '/settings/keys');
    return;
}

// Test the API key
console.log('\n🧪 Testing API Key...');
const client = new Client();
client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);

async function testApiKey() {
    try {
        const response = await databases.list();
        console.log('✅ API Key is working!');
        console.log('📊 Found', response.total, 'database(s)');
        
        // Check if telegram_members collection exists
        try {
            const collections = await databases.listCollections(databaseId);
            const telegramCollection = collections.collections.find(col => col.$id === 'telegram_members');
            
            if (telegramCollection) {
                console.log('✅ telegram_members collection exists!');
                console.log('🎉 Your setup should be working now. Try the wishlist registration.');
            } else {
                console.log('❌ telegram_members collection missing');
                console.log('🔧 Run: npm run create:telegram-collection');
            }
        } catch (collError) {
            console.log('⚠️  Could not check collections:', collError.message);
        }
        
    } catch (error) {
        console.log('❌ API Key test failed:', error.message);
        if (error.code === 401) {
            console.log('🔑 API Key is invalid or doesn\'t have sufficient permissions');
        }
    }
}

testApiKey();
