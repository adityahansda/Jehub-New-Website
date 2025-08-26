const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Configuration
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const internshipsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function testCollectionExists() {
  try {
    console.log('\n🔍 Testing collection existence...');
    const collection = await databases.getCollection(databaseId, internshipsCollectionId);
    console.log('✅ Collection found:', collection.name);
    console.log(`   - Collection ID: ${collection.$id}`);
    console.log(`   - Total attributes: ${collection.attributes.length}`);
    return true;
  } catch (error) {
    console.error('❌ Collection not found:', error.message);
    return false;
  }
}

async function testDataExists() {
  try {
    console.log('\n📊 Testing data existence...');
    const response = await databases.listDocuments(
      databaseId,
      internshipsCollectionId,
      undefined, // queries
      5 // limit to first 5 records
    );
    
    console.log(`✅ Found ${response.total} total records in collection`);
    console.log(`   - Retrieved ${response.documents.length} sample records`);
    
    if (response.documents.length > 0) {
      const sampleRecord = response.documents[0];
      console.log('\n📋 Sample record:');
      console.log(`   - Intern ID: ${sampleRecord.internId || 'N/A'}`);
      console.log(`   - Name: ${sampleRecord.name || 'N/A'}`);
      console.log(`   - Email: ${sampleRecord.email || 'N/A'}`);
      console.log(`   - Verified: ${sampleRecord.verification ? 'Yes' : 'No'}`);
      console.log(`   - Created: ${sampleRecord.$createdAt || 'N/A'}`);
      return sampleRecord.internId;
    } else {
      console.log('⚠️  No records found in collection');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    return null;
  }
}

async function testAPIEndpoint(internId, endpoint, description) {
  try {
    console.log(`\n🌐 Testing ${description}...`);
    
    const fetch = require('node-fetch');
    const url = `http://localhost:3000${endpoint}?internId=${encodeURIComponent(internId)}`;
    
    console.log(`   - URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API endpoint working');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Valid: ${data.isValid ? 'Yes' : 'No'}`);
      console.log(`   - Message: ${data.message || 'N/A'}`);
      
      if (data.record && data.record.documents) {
        console.log(`   - Documents: ${data.record.documents.length} found`);
        data.record.documents.forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.type}: ${doc.status}`);
        });
      }
    } else {
      console.log(`❌ API error: ${response.status}`);
      console.log(`   - Error: ${data.error || data.message || 'Unknown error'}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

async function testPublicAccess() {
  try {
    console.log('\n🔐 Testing public access (without API key)...');
    
    // Create a client without API key to simulate public access
    const publicClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);
      // No API key - simulating public access
    
    const publicDatabases = new Databases(publicClient);
    
    const response = await publicDatabases.listDocuments(
      databaseId,
      internshipsCollectionId,
      undefined, // queries
      1 // limit to 1 record
    );
    
    console.log('✅ Public access working');
    console.log(`   - Can fetch ${response.total} records without authentication`);
    return true;
  } catch (error) {
    console.log(`❌ Public access failed: ${error.message}`);
    console.log('   - This might be expected if collection permissions are not set to public');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Appwrite Integration Tests');
  console.log('=====================================');
  
  console.log('\n📋 Configuration:');
  console.log(`   - Endpoint: ${endpoint}`);
  console.log(`   - Project ID: ${projectId}`);
  console.log(`   - Database ID: ${databaseId}`);
  console.log(`   - Collection ID: ${internshipsCollectionId}`);
  console.log(`   - API Key: ${apiKey ? '✅ Set' : '❌ Not set'}`);
  
  const results = {
    collectionExists: false,
    dataExists: false,
    downloadsAPI: false,
    verificationAPI: false,
    publicAccess: false
  };
  
  // Test 1: Check if collection exists
  results.collectionExists = await testCollectionExists();
  
  if (!results.collectionExists) {
    console.log('\n❌ Cannot proceed with tests - collection not found');
    console.log('Run: node scripts/create-internship-collection.js');
    return;
  }
  
  // Test 2: Check if data exists
  const sampleInternId = await testDataExists();
  results.dataExists = !!sampleInternId;
  
  if (!results.dataExists) {
    console.log('\n❌ Cannot proceed with API tests - no data found');
    console.log('Run: node scripts/migrate-sheets-to-appwrite.js');
  } else {
    // Test 3: Test Downloads API
    results.downloadsAPI = await testAPIEndpoint(
      sampleInternId,
      '/api/appwrite-certificate-downloads',
      'Certificate Downloads API'
    );
    
    // Test 4: Test Verification API
    results.verificationAPI = await testAPIEndpoint(
      sampleInternId,
      '/api/appwrite-verify-certificate',
      'Certificate Verification API'
    );
  }
  
  // Test 5: Test public access
  results.publicAccess = await testPublicAccess();
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`Collection Exists: ${results.collectionExists ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Available: ${results.dataExists ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Downloads API: ${results.downloadsAPI ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Verification API: ${results.verificationAPI ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Public Access: ${results.publicAccess ? '✅ PASS' : '❌ FAIL'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your Appwrite integration is ready.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
  
  // Next steps
  console.log('\n📚 Next Steps:');
  if (!results.collectionExists) {
    console.log('1. Run: node scripts/create-internship-collection.js');
  }
  if (!results.dataExists) {
    console.log('2. Run: node scripts/migrate-sheets-to-appwrite.js');
  }
  if (results.collectionExists && results.dataExists) {
    console.log('1. Test the certificate pages in your browser');
    console.log('2. Update any external integrations to use new API endpoints');
    console.log('3. Monitor the new APIs in production');
  }
}

// Handle CLI usage
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n✨ Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
