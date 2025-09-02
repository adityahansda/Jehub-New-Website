const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client with environment variables
const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const notesCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID;

console.log('🔧 Configuration Check:');
console.log('======================');
console.log('Endpoint:', endpoint);
console.log('Project ID:', projectId);
console.log('API Key:', apiKey ? '✅ Present' : '❌ Missing');
console.log('Database ID:', databaseId);
console.log('Notes Collection ID:', notesCollectionId);

if (!endpoint || !projectId || !apiKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function testDatabaseConnection() {
  try {
    console.log('\n🔍 Testing database connection...');
    
    // Test 1: List databases
    console.log('1. Testing database access...');
    const database = await databases.get(databaseId);
    console.log('✅ Database accessible:', database.name);
    
    // Test 2: Get collection info
    console.log('2. Testing collection access...');
    const collection = await databases.getCollection(databaseId, notesCollectionId);
    console.log('✅ Collection accessible:', collection.name);
    console.log('   Total attributes:', collection.attributes.length);
    
    // Test 3: Try to create a test document
    console.log('3. Testing document creation...');
    const testData = {
      title: 'Test Upload - DELETE ME',
      branch: 'Computer Science',
      semester: '1st',
      subject: 'Test Subject',
      description: 'This is a test upload to verify database connectivity',
      authorName: 'Test Author',
      githubUrl: 'https://example.com/test.pdf',
      fileName: 'test.pdf',
      userIp: '127.0.0.1',
      downloads: 0,
      likes: 0,
      points: 0,
      views: 0,
      reports: 0,
      fileSize: 1000,
      noteType: 'free',
      degree: 'B.Tech',
      uploadDate: new Date().toISOString(),
      tags: []
    };
    
    const testDoc = await databases.createDocument(
      databaseId,
      notesCollectionId,
      ID.unique(),
      testData
    );
    
    console.log('✅ Test document created successfully!');
    console.log('   Document ID:', testDoc.$id);
    
    // Test 4: Clean up - delete the test document
    console.log('4. Cleaning up test document...');
    await databases.deleteDocument(databaseId, notesCollectionId, testDoc.$id);
    console.log('✅ Test document deleted successfully!');
    
    console.log('\n🎉 All tests passed! Database connection is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error type:', error.type);
    console.error('Error message:', error.message);
    
    if (error.code === 401) {
      console.log('\n💡 Suggestion: Check API key permissions');
    } else if (error.code === 404) {
      console.log('\n💡 Suggestion: Check database/collection IDs');
    }
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
