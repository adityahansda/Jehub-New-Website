const { google } = require('googleapis');
require('dotenv').config();

async function testGoogleAuth() {
  try {
    console.log('🔍 Testing Google Sheets authentication...');
    
    // Log environment variables (partially masked for security)
    console.log('Environment variables:');
    console.log('- GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID);
    console.log('- GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
    console.log('- GOOGLE_PRIVATE_KEY_ID:', process.env.GOOGLE_PRIVATE_KEY_ID);
    console.log('- Private key starts with:', process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) + '...');
    
    // Test Google Auth creation
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    console.log('✅ GoogleAuth object created successfully');
    
    // Test getting access token
    console.log('🔑 Getting access token...');
    const client = await auth.getClient();
    console.log('✅ Access token obtained successfully');
    
    // Test Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Sheets API client created successfully');
    
    // Test actual API call
    console.log('📊 Testing spreadsheet access...');
    const spreadsheetId = process.env.GOOGLE_SHEETS_WISHLIST_ID;
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });
    
    console.log('✅ Successfully accessed spreadsheet:', response.data.properties.title);
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error during testing:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGoogleAuth();
