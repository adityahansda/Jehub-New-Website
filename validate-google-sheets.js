const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function validateGoogleSheetsCredentials() {
  console.log('🔍 Validating Google Sheets API credentials...\n');

  // Check if all required environment variables are present
  const requiredEnvVars = [
    'GOOGLE_SHEETS_WISHLIST_ID',
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY_ID',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_X509_CERT_URL'
  ];

  console.log('📋 Checking environment variables:');
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: Missing`);
      missingVars.push(varName);
    } else {
      // Truncate long values for display
      const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });

  if (missingVars.length > 0) {
    console.log(`\n❌ Missing ${missingVars.length} required environment variables.`);
    console.log('Please add them to your .env.local file.\n');
    return false;
  }

  console.log('\n✅ All environment variables are present.\n');

  // Test Google Sheets API connection
  try {
    console.log('🔌 Testing Google Sheets API connection...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_WISHLIST_ID;

    console.log(`📊 Attempting to access spreadsheet: ${spreadsheetId}`);

    // Try to get spreadsheet metadata
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });

    console.log(`✅ Successfully connected to spreadsheet: "${spreadsheetInfo.data.properties.title}"`);
    console.log(`📑 Sheets in this spreadsheet:`)
    
    spreadsheetInfo.data.sheets.forEach(sheet => {
      console.log(`   - ${sheet.properties.title}`);
    });

    // Test reading from the sheet
    console.log('\n📖 Testing read access...');
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1:I1',
      });

      if (response.data.values && response.data.values.length > 0) {
        console.log('✅ Successfully read from sheet. Current headers:', response.data.values[0]);
      } else {
        console.log('ℹ️  Sheet is empty or no data in range A1:I1');
      }
    } catch (readError) {
      console.log('⚠️  Could not read from "Sheet1" sheet. It might not exist yet.');
      console.log('   This is normal for a new spreadsheet - headers will be created automatically.');
    }

    // Test write access by adding headers if they don't exist
    console.log('\n✏️  Testing write access...');
    try {
      const testResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1:I1',
      });

      if (!testResponse.data.values || testResponse.data.values.length === 0) {
        console.log('📝 Adding headers to the sheet...');
        await sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: 'Sheet1!A1:I1',
          valueInputOption: 'RAW',
          resource: {
            values: [['Name', 'Branch', 'Years of Study', 'College Name', 'Email', 'Telegram ID', 'Referral Code', 'Created At', 'Status']]
          }
        });
        console.log('✅ Successfully added headers to the sheet');
      } else {
        console.log('✅ Write access confirmed (headers already exist)');
      }
    } catch (writeError) {
      console.log('❌ Write access test failed:', writeError.message);
      return false;
    }

    console.log('\n🎉 Google Sheets integration is fully configured and working!');
    console.log('🚀 You can now use the wishlist form to store data in Google Sheets.');
    
    return true;

  } catch (error) {
    console.log('\n❌ Failed to connect to Google Sheets API:');
    console.log('Error:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Check if your private key is properly formatted');
      console.log('   - Ensure there are no extra spaces or characters in your private key');
      console.log('   - Verify the service account email has access to the spreadsheet');
    } else if (error.message.includes('Requested entity was not found')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Check if the spreadsheet ID is correct');
      console.log('   - Ensure the service account has access to the spreadsheet');
      console.log('   - Make sure you shared the spreadsheet with the service account email');
    }
    
    return false;
  }
}

// Run the validation
validateGoogleSheetsCredentials()
  .then(success => {
    if (success) {
      console.log('\n✅ Validation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Validation failed. Please check the setup and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error during validation:', error);
    process.exit(1);
  });
