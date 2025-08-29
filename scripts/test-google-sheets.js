const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuration
const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function testGoogleSheetsConnection() {
  try {
    console.log('🔍 Testing Google Sheets API connection...\n');

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
      console.error('❌ Error: No Google service account JSON file found!');
      console.log('📝 Please add one of these files to the project root:');
      console.log('   - google-service-account.json');
      console.log('   - credentials.json');
      console.log('   - service-account.json');
      console.log('\n📖 See GOOGLE_SHEETS_SETUP_GUIDE.md for detailed instructions.');
      return;
    }

    console.log(`✅ Found credentials file: ${path.basename(credentialsPath)}`);

    // Load and validate the JSON file
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log(`✅ Service account email: ${credentials.client_email}`);
    console.log(`✅ Project ID: ${credentials.project_id}`);

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: SCOPES,
    });

    console.log('\n🔐 Authenticating with Google...');
    const authClient = await auth.getClient();
    console.log('✅ Authentication successful!');

    // Initialize Sheets API
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    console.log('\n📊 Fetching spreadsheet metadata...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log(`✅ Spreadsheet title: ${spreadsheet.data.properties.title}`);
    console.log(`✅ Sheet count: ${spreadsheet.data.sheets.length}`);

    // Test fetching actual data
    console.log('\n📋 Fetching data from Sheet1...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',
    });

    const rows = response.data.values || [];
    console.log(`✅ Total rows: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log(`✅ Header row: [${rows[0].join(', ')}]`);
      console.log(`✅ Data rows: ${rows.length - 1}`);
      
      // Show first few data rows (if any)
      if (rows.length > 1) {
        console.log('\n📝 Sample data (first 3 rows):');
        for (let i = 1; i <= Math.min(3, rows.length - 1); i++) {
          const internId = rows[i][0] || 'N/A';
          const verification = rows[i][1] || 'N/A';
          const name = rows[i][4] || 'N/A';
          console.log(`   Row ${i}: ID=${internId}, Verified=${verification}, Name=${name}`);
        }
      }
    }

    console.log('\n🎉 Google Sheets connection test completed successfully!');
    console.log('✅ Your certificate verification API should now work properly.');

  } catch (error) {
    console.error('\n❌ Google Sheets connection test failed!');
    console.error('Error details:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Make sure you shared the Google Sheet with the service account email');
      console.log('   2. Check that the service account has "Viewer" permissions');
      console.log('   3. Verify the spreadsheet ID is correct');
    } else if (error.message.includes('API')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Enable Google Sheets API in Google Cloud Console');
      console.log('   2. Make sure billing is enabled for your Google Cloud project');
    }
    
    console.log('\n📖 See GOOGLE_SHEETS_SETUP_GUIDE.md for detailed troubleshooting.');
  }
}

// Run the test
testGoogleSheetsConnection();
