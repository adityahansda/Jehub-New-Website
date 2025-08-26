const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function testGoogleSheetsAuth() {
  console.log('🔍 Testing Google Sheets Authentication...');
  console.log(`Spreadsheet ID: ${SPREADSHEET_ID}`);
  
  try {
    // First, let's check what files are available
    const fs = require('fs');
    const possibleFiles = [
      'jehub25new-auto-fixed.json',
      'jehub25new-fixed.json',
      'jehub25new.json',
      'google-service-account.json',
      'credentials.json'
    ];
    
    console.log('\n📂 Checking for service account files:');
    possibleFiles.forEach(file => {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'Found' : 'Not found'}`);
    });

    // Try to find a working credentials file
    let credentialsPath = null;
    for (const fileName of possibleFiles) {
      const filePath = path.join(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        credentialsPath = filePath;
        console.log(`\n🔑 Using credentials file: ${fileName}`);
        break;
      }
    }

    if (!credentialsPath) {
      console.log('❌ No service account file found!');
      return;
    }

    // Read and display some info about the credentials file
    const credentialsContent = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('\n📋 Service account info:');
    console.log(`- Project ID: ${credentialsContent.project_id}`);
    console.log(`- Client Email: ${credentialsContent.client_email}`);
    console.log(`- Private Key ID: ${credentialsContent.private_key_id}`);

    // Try to authenticate
    console.log('\n🔐 Attempting authentication...');
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: SCOPES,
    });

    console.log('✅ GoogleAuth instance created successfully');

    // Get the auth client
    const authClient = await auth.getClient();
    console.log('✅ Auth client obtained successfully');

    // Try to access the spreadsheet
    console.log('\n📊 Attempting to access Google Sheets...');
    const sheets = google.sheets({ version: 'v4', auth });
    
    // First, try to get spreadsheet metadata
    console.log('📋 Getting spreadsheet metadata...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });
    
    console.log(`✅ Spreadsheet found: "${metadata.data.properties.title}"`);
    console.log(`📄 Sheet count: ${metadata.data.sheets.length}`);
    
    // List available sheets
    console.log('\n📄 Available sheets:');
    metadata.data.sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows x ${sheet.properties.gridProperties.columnCount} cols)`);
    });

    // Try to read data
    console.log('\n📖 Attempting to read data from Sheet1...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:Z10', // First 10 rows, all columns
    });

    const rows = response.data.values || [];
    console.log(`✅ Successfully read ${rows.length} rows from the sheet`);
    
    if (rows.length > 0) {
      console.log('\n📊 First few rows:');
      console.log('Header row:', rows[0]);
      
      if (rows.length > 1) {
        console.log('Sample data row:', rows[1]);
        console.log(`Total columns in header: ${rows[0].length}`);
        console.log(`Total columns in sample row: ${rows[1].length}`);
      }
    }
    
    // Try to get the full range to see total data
    console.log('\n📈 Getting full data range...');
    const fullResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',
    });
    
    const fullRows = fullResponse.data.values || [];
    console.log(`✅ Total rows in spreadsheet: ${fullRows.length}`);
    console.log(`✅ Data rows (excluding header): ${fullRows.length - 1}`);

    return { success: true, totalRows: fullRows.length, data: fullRows };

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.error('Error type:', error.constructor.name);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.response && error.response.data) {
      console.error('Response data:', error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test
testGoogleSheetsAuth()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Google Sheets authentication test completed successfully!');
      console.log(`📊 Ready to migrate ${result.totalRows - 1} records to Appwrite`);
    } else {
      console.log('\n💥 Google Sheets authentication test failed');
      console.log('Please check the service account credentials and permissions');
    }
  })
  .catch(error => {
    console.error('\n💥 Test script failed:', error);
  });
