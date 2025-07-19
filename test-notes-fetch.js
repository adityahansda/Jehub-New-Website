// Test script to diagnose notes fetching issues
const { Client, Databases, Query } = require('appwrite');

const client = new Client();
const databases = new Databases(client);

// Configuration from .env.local
const endpoint = 'https://nyc.cloud.appwrite.io/v1';
const projectId = '686d35da003a55dfcc11';
const databaseId = '686d370a000cfabbd998';
const notesCollectionId = '686d382f00119e0bf90b';

client.setEndpoint(endpoint).setProject(projectId);

async function testNotesFetch() {
  try {
    console.log('Testing Appwrite connection...');
    
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const response = await databases.listDocuments(
      databaseId,
      notesCollectionId,
      [Query.limit(5)]
    );
    
    console.log('✅ Connection successful!');
    console.log('Total documents:', response.total);
    console.log('Documents fetched:', response.documents.length);
    
    // Test 2: Check document structure
    if (response.documents.length > 0) {
      console.log('2. Sample document structure:');
      console.log(JSON.stringify(response.documents[0], null, 2));
    }
    
    // Test 3: Check for specific fields
    console.log('3. Checking required fields in documents...');
    const requiredFields = ['title', 'branch', 'semester', 'subject', 'description', 'tags', 'authorName', 'uploadDate', 'githubUrl', 'fileName', 'downloads', 'likes', 'degree'];
    
    response.documents.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`);
      requiredFields.forEach(field => {
        const hasField = doc.hasOwnProperty(field);
        console.log(`  ${field}: ${hasField ? '✅' : '❌'} ${hasField ? typeof doc[field] : 'missing'}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error fetching notes:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type
    });
  }
}

// Run the test
testNotesFetch();
