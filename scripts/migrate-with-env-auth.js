const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

// For debugging authentication issues, let's try a different approach
async function migrateWithEnvAuth() {
  console.log('🔄 Starting Google Sheets migration with environment auth...');
  
  try {
    // Read service account from file and create auth manually
    const serviceAccountPath = 'jehub25new-auto-fixed.json';
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Service account file not found: ' + serviceAccountPath);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Service account loaded');
    console.log(`📧 Client email: ${serviceAccount.client_email}`);
    console.log(`🆔 Project ID: ${serviceAccount.project_id}`);
    
    // Create JWT auth manually with explicit options
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      subject: null // Important: don't use domain-wide delegation
    });
    
    console.log('🔐 Created JWT auth client');
    
    // Try to authorize explicitly
    console.log('🔑 Authorizing...');
    await auth.authorize();
    console.log('✅ Authorization successful!');
    
    // Create sheets client
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('📊 Created Sheets API client');
    
    const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
    
    // Test reading the spreadsheet
    console.log('📖 Reading spreadsheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',
    });
    
    const rows = response.data.values || [];
    console.log(`✅ Successfully read ${rows.length} rows`);
    
    if (rows.length === 0) {
      console.log('⚠️ No data found in the spreadsheet');
      return { success: true, data: [] };
    }
    
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log('📋 Headers found:', headers);
    console.log(`📊 Data rows: ${dataRows.length}`);
    
    // Show first few records
    console.log('\n📝 Sample data:');
    dataRows.slice(0, 3).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
    
    return { 
      success: true, 
      headers,
      data: dataRows,
      totalRecords: dataRows.length
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.response) {
      console.error('📝 Response status:', error.response.status);
      console.error('📝 Response data:', error.response.data);
    }
    
    // Check for specific error types
    if (error.message.includes('Invalid JWT Signature')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if system date/time is correct');
      console.error('2. Verify service account is enabled in Google Cloud Console');
      console.error('3. Ensure Google Sheets API is enabled');
      console.error('4. Check if the service account has access to the spreadsheet');
    }
    
    return { success: false, error: error.message };
  }
}

// Run the migration test
if (require.main === module) {
  migrateWithEnvAuth()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Google Sheets access successful!');
        console.log(`📊 Found ${result.totalRecords} records ready for migration`);
      } else {
        console.log('\n❌ Google Sheets access failed');
        console.log('🔍 Please check the troubleshooting tips above');
      }
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
    });
}

module.exports = { migrateWithEnvAuth };
