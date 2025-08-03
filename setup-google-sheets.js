const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupGoogleSheets() {
  console.log('🚀 Google Sheets API Setup Assistant\n');
  console.log('This script will help you set up Google Sheets integration for your wishlist.\n');
  
  console.log('📋 Before we start, make sure you have:');
  console.log('1. ✅ Created a Google Cloud Project');
  console.log('2. ✅ Enabled Google Sheets API');
  console.log('3. ✅ Created a Service Account');
  console.log('4. ✅ Downloaded the JSON key file');
  console.log('5. ✅ Created a Google Spreadsheet');
  console.log('6. ✅ Shared the spreadsheet with your service account email\n');
  
  const ready = await question('Are you ready to proceed? (y/n): ');
  if (ready.toLowerCase() !== 'y' && ready.toLowerCase() !== 'yes') {
    console.log('Please complete the setup steps first. Check GOOGLE_SHEETS_SETUP.md for details.');
    rl.close();
    return;
  }

  console.log('\n📁 Looking for your service account JSON file...');
  
  // Look for JSON files in the current directory
  const jsonFiles = fs.readdirSync('.').filter(file => file.endsWith('.json') && !file.includes('package'));
  
  if (jsonFiles.length > 0) {
    console.log('Found these JSON files:');
    jsonFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });
    
    const fileChoice = await question(`\nWhich file is your service account key? (1-${jsonFiles.length} or enter filename): `);
    let jsonFilePath;
    
    if (isNaN(fileChoice)) {
      jsonFilePath = fileChoice;
    } else {
      const index = parseInt(fileChoice) - 1;
      if (index >= 0 && index < jsonFiles.length) {
        jsonFilePath = jsonFiles[index];
      } else {
        console.log('Invalid choice. Please try again.');
        rl.close();
        return;
      }
    }
    
    if (fs.existsSync(jsonFilePath)) {
      console.log(`\n📖 Reading credentials from ${jsonFilePath}...`);
      
      try {
        const credentials = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        console.log('✅ Successfully parsed JSON file!');
        console.log(`Service account: ${credentials.client_email}`);
        
        // Get spreadsheet ID
        const spreadsheetId = await question('\\n📊 Enter your Google Spreadsheet ID (from the URL): ');
        
        if (!spreadsheetId) {
          console.log('Spreadsheet ID is required. Please try again.');
          rl.close();
          return;
        }
        
        // Prepare environment variables
        const envVars = `
# Google Sheets Configuration
GOOGLE_SHEETS_WISHLIST_ID=${spreadsheetId}
GOOGLE_PROJECT_ID=${credentials.project_id}
GOOGLE_PRIVATE_KEY_ID=${credentials.private_key_id}
GOOGLE_PRIVATE_KEY="${credentials.private_key}"
GOOGLE_CLIENT_EMAIL=${credentials.client_email}
GOOGLE_CLIENT_ID=${credentials.client_id}
GOOGLE_CLIENT_X509_CERT_URL=${credentials.client_x509_cert_url}
`;

        // Check if .env.local exists
        const envPath = '.env.local';
        let existingContent = '';
        
        if (fs.existsSync(envPath)) {
          existingContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Check if Google Sheets vars already exist
        if (existingContent.includes('GOOGLE_SHEETS_WISHLIST_ID')) {
          const overwrite = await question('\\n⚠️  Google Sheets configuration already exists in .env.local. Overwrite? (y/n): ');
          if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
            console.log('Setup cancelled.');
            rl.close();
            return;
          }
          
          // Remove existing Google Sheets config
          const lines = existingContent.split('\\n');
          const filteredLines = lines.filter(line => 
            !line.startsWith('GOOGLE_SHEETS_') && 
            !line.startsWith('GOOGLE_PROJECT_') &&
            !line.startsWith('GOOGLE_PRIVATE_') &&
            !line.startsWith('GOOGLE_CLIENT_')
          );
          existingContent = filteredLines.join('\\n');
        }
        
        // Append new configuration
        const newContent = existingContent + envVars;
        
        // Write to .env.local
        fs.writeFileSync(envPath, newContent);
        
        console.log('\\n✅ Configuration saved to .env.local!');
        console.log('\\n🔧 Testing the configuration...');
        
        rl.close();
        
        // Run validation
        const { spawn } = require('child_process');
        const validation = spawn('node', ['validate-google-sheets.js'], { stdio: 'inherit' });
        
        validation.on('close', (code) => {
          if (code === 0) {
            console.log('\\n🎉 Setup completed successfully!');
            console.log('You can now use the wishlist form with Google Sheets integration.');
          } else {
            console.log('\\n❌ There was an issue with the configuration.');
            console.log('Please check the error messages above and try again.');
          }
        });
        
      } catch (error) {
        console.log('❌ Error reading JSON file:', error.message);
        rl.close();
      }
    } else {
      console.log('File not found. Please make sure the JSON file exists.');
      rl.close();
    }
  } else {
    console.log('\\n❌ No JSON files found in the current directory.');
    console.log('\\nPlease:');
    console.log('1. Download your service account JSON key from Google Cloud Console');
    console.log('2. Place it in this directory');
    console.log('3. Run this script again');
    rl.close();
  }
}

setupGoogleSheets().catch(console.error);
