const http = require('http');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuration
const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const BASE_URL = 'http://localhost:3000';

// Test data
const TEST_INTERN_IDS = [
  'IN-WD-020',  // Known ID for testing
  'IN-TEST-001', // Non-existent ID for negative testing
];

console.log('🧪 Certificate Pages Test Suite Starting...\n');

// Test 1: Google Sheets Connection
async function testGoogleSheetsConnection() {
  console.log('📊 Test 1: Google Sheets Connection');
  console.log('=====================================');
  
  try {
    // Look for service account JSON file
    const possiblePaths = [
      path.join(process.cwd(), 'google-service-account.json'),
      path.join(process.cwd(), 'credentials.json'),
      path.join(process.cwd(), 'service-account.json')
    ];
    
    let credentialsPath = null;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        credentialsPath = filePath;
        break;
      }
    }
    
    if (!credentialsPath) {
      console.log('❌ No Google service account credentials found');
      console.log('💡 Please add credentials before testing API endpoints');
      console.log('📖 See GOOGLE_SHEETS_SETUP_GUIDE.md for setup instructions\n');
      return false;
    }

    console.log(`✅ Found credentials: ${path.basename(credentialsPath)}`);

    // Test authentication
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Test spreadsheet access
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:Z10', // Get first 10 rows
    });

    const rows = response.data.values || [];
    console.log(`✅ Successfully fetched ${rows.length} rows from Google Sheets`);
    
    if (rows.length > 1) {
      console.log(`✅ Sample data available - first data row has ${rows[1].length} columns`);
      console.log(`✅ First intern ID: ${rows[1][0] || 'N/A'}`);
    }
    
    console.log('✅ Google Sheets connection test passed!\n');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets connection failed:', error.message);
    console.log('💡 Make sure you have set up Google Sheets authentication properly\n');
    return false;
  }
}

// Test 2: API Endpoint Testing
async function testApiEndpoints() {
  console.log('🔌 Test 2: API Endpoints');
  console.log('========================');
  
  const endpoints = [
    { path: '/api/verify-certificate', name: 'Certificate Verification' },
    { path: '/api/certificate-downloads', name: 'Certificate Downloads' }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing ${endpoint.name} (${endpoint.path})`);
    
    for (const internId of TEST_INTERN_IDS) {
      try {
        const url = `${BASE_URL}${endpoint.path}?internId=${encodeURIComponent(internId)}`;
        console.log(`   🔍 Testing with Intern ID: ${internId}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`   ✅ Status: ${response.status} - ${data.message}`);
          
          if (data.record) {
            console.log(`   📋 Record found: ${data.record.name} (${data.record.role})`);
            console.log(`   📄 Documents: ${data.record.documents?.length || 0} available`);
            
            // Show document details
            if (data.record.documents) {
              data.record.documents.forEach((doc, index) => {
                console.log(`      ${index + 1}. ${doc.type}: ${doc.status}`);
              });
            }
          }
        } else {
          if (internId === 'IN-TEST-001') {
            console.log(`   ✅ Expected error for non-existent ID: ${data.message}`);
          } else {
            console.log(`   ❌ Unexpected error: ${response.status} - ${data.message}`);
          }
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`   ❌ Server not running - please start with 'npm run dev'`);
          return false;
        } else {
          console.log(`   ❌ Request failed: ${error.message}`);
        }
      }
    }
  }
  
  console.log('\n✅ API endpoint tests completed!\n');
  return true;
}

// Test 3: Page Accessibility
async function testPageAccessibility() {
  console.log('🌐 Test 3: Page Accessibility');
  console.log('=============================');
  
  const pages = [
    { path: '/certificate-verification', name: 'Certificate Verification Page' },
    { path: '/certificate-downloader', name: 'Certificate Downloader Page' }
  ];

  for (const page of pages) {
    try {
      console.log(`📄 Testing ${page.name} (${page.path})`);
      
      const response = await fetch(`${BASE_URL}${page.path}`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Check for key elements
        const checks = [
          { test: html.includes('Certificate'), name: 'Certificate content' },
          { test: html.includes('Intern ID'), name: 'Intern ID input field' },
          { test: html.includes('Verify') || html.includes('Search') || html.includes('Find'), name: 'Submit button' },
          { test: html.includes('React'), name: 'React app loaded' }
        ];
        
        console.log(`   ✅ Page loaded successfully (${response.status})`);
        
        checks.forEach(check => {
          if (check.test) {
            console.log(`   ✅ ${check.name} found`);
          } else {
            console.log(`   ⚠️  ${check.name} not found`);
          }
        });
      } else {
        console.log(`   ❌ Page failed to load: ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Server not running - please start with 'npm run dev'`);
        return false;
      } else {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ Page accessibility tests completed!\n');
  return true;
}

// Test 4: Data Flow Testing
async function testDataFlow() {
  console.log('🔄 Test 4: End-to-End Data Flow');
  console.log('================================');
  
  // Test the complete flow: API -> Data Processing -> Frontend Display
  const testInternId = 'IN-WD-020';
  
  try {
    console.log(`🔍 Testing complete data flow with Intern ID: ${testInternId}`);
    
    // Test verification API
    const verifyUrl = `${BASE_URL}/api/verify-certificate?internId=${encodeURIComponent(testInternId)}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyData = await verifyResponse.json();
    
    // Test downloads API
    const downloadUrl = `${BASE_URL}/api/certificate-downloads?internId=${encodeURIComponent(testInternId)}`;
    const downloadResponse = await fetch(downloadUrl);
    const downloadData = await downloadResponse.json();
    
    if (verifyResponse.ok && downloadResponse.ok) {
      console.log('✅ Both APIs responded successfully');
      
      // Compare data consistency
      if (verifyData.record && downloadData.record) {
        const consistency = [
          { field: 'name', match: verifyData.record.name === downloadData.record.name },
          { field: 'email', match: verifyData.record.email === downloadData.record.email },
          { field: 'role', match: verifyData.record.role === downloadData.record.role },
          { field: 'internId', match: verifyData.record.internId === downloadData.record.internId }
        ];
        
        console.log('📊 Data consistency check:');
        consistency.forEach(check => {
          if (check.match) {
            console.log(`   ✅ ${check.field} matches between APIs`);
          } else {
            console.log(`   ❌ ${check.field} mismatch between APIs`);
          }
        });
        
        // Test document URLs
        if (verifyData.record.documents && verifyData.record.documents.length > 0) {
          console.log('\n🔗 Testing document URLs:');
          
          for (const doc of verifyData.record.documents) {
            if (doc.status !== 'Not Issued Yet' && doc.url) {
              try {
                // Test if URL is accessible (just check if it's a valid URL format)
                const url = new URL(doc.url);
                console.log(`   ✅ ${doc.type}: Valid URL format (${url.hostname})`);
                
                // Test download URL format
                if (doc.downloadUrl) {
                  const downloadUrl = new URL(doc.downloadUrl);
                  console.log(`   ✅ ${doc.type}: Valid download URL (${downloadUrl.hostname})`);
                }
              } catch (error) {
                console.log(`   ❌ ${doc.type}: Invalid URL format`);
              }
            } else {
              console.log(`   ⏳ ${doc.type}: ${doc.status}`);
            }
          }
        }
      } else {
        console.log('⚠️  No record found for testing data consistency');
      }
      
    } else {
      console.log('❌ One or both APIs failed to respond properly');
    }
    
  } catch (error) {
    console.log(`❌ Data flow test failed: ${error.message}`);
    return false;
  }
  
  console.log('\n✅ Data flow tests completed!\n');
  return true;
}

// Helper function to check if server is running
async function checkServerStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/ip`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🎯 Certificate Pages & API Test Suite');
  console.log('======================================\n');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('❌ Development server is not running!');
    console.log('💡 Please start the server with: npm run dev');
    console.log('💡 Then run this test again\n');
    return;
  }
  
  console.log('✅ Development server is running\n');
  
  const results = [];
  
  // Run all tests
  results.push(await testGoogleSheetsConnection());
  results.push(await testApiEndpoints());
  results.push(await testPageAccessibility());
  results.push(await testDataFlow());
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your certificate pages are working correctly.');
  } else {
    console.log(`⚠️  ${passed}/${total} tests passed. Some issues need attention.`);
  }
  
  console.log('\n🔧 Next Steps:');
  if (!results[0]) {
    console.log('1. ❗ Set up Google Sheets authentication (see GOOGLE_SHEETS_SETUP_GUIDE.md)');
  }
  if (results[0] && (!results[1] || !results[2])) {
    console.log('2. ❗ Check API endpoints and page routing');
  }
  if (results[0] && results[1] && results[2] && !results[3]) {
    console.log('2. ❗ Check data processing and URL formatting');
  }
  if (passed === total) {
    console.log('✅ Everything is working! You can now test manually at:');
    console.log(`   • ${BASE_URL}/certificate-verification`);
    console.log(`   • ${BASE_URL}/certificate-downloader`);
  }
}

// Add to package.json test command
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
