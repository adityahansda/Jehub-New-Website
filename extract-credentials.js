const fs = require('fs');
const path = require('path');

function extractCredentials() {
  console.log('🔍 Looking for JSON service account files...\n');
  
  // Get all JSON files in current directory
  const files = fs.readdirSync('.').filter(file => 
    file.endsWith('.json') && 
    !file.includes('package') && 
    !file.includes('tsconfig') && 
    !file.includes('eslint')
  );
  
  if (files.length === 0) {
    console.log('❌ No service account JSON files found in current directory.');
    console.log('Please place your Google service account JSON file in this directory.');
    return;
  }
  
  console.log('📁 Found potential service account files:');
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  // Try to auto-detect service account file
  let serviceAccountFile = null;
  
  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (content.type === 'service_account' && content.private_key && content.client_email) {
        serviceAccountFile = file;
        break;
      }
    } catch (error) {
      // Skip invalid JSON files
    }
  }
  
  if (!serviceAccountFile) {
    console.log('\n❌ No valid service account JSON file found.');
    console.log('Please make sure your service account JSON file is in this directory.');
    return;
  }
  
  console.log(`\n✅ Found service account file: ${serviceAccountFile}`);
  
  try {
    const credentials = JSON.parse(fs.readFileSync(serviceAccountFile, 'utf8'));
    
    console.log('\n📋 Extracted credentials:');
    console.log('─'.repeat(60));
    
    const extractedData = {
      GOOGLE_PROJECT_ID: credentials.project_id,
      GOOGLE_PRIVATE_KEY_ID: credentials.private_key_id,
      GOOGLE_PRIVATE_KEY: credentials.private_key,
      GOOGLE_CLIENT_EMAIL: credentials.client_email,
      GOOGLE_CLIENT_ID: credentials.client_id,
      GOOGLE_CLIENT_X509_CERT_URL: credentials.client_x509_cert_url
    };
    
    // Display extracted data
    Object.entries(extractedData).forEach(([key, value]) => {
      if (key === 'GOOGLE_PRIVATE_KEY') {
        console.log(`${key}="${value.substring(0, 50)}..."`);
      } else {
        console.log(`${key}=${value}`);
      }
    });
    
    console.log('\n📝 Environment variables to add to .env.local:');
    console.log('─'.repeat(60));
    
    const envContent = `
# Google Sheets Configuration (Auto-extracted)
GOOGLE_SHEETS_WISHLIST_ID=your-spreadsheet-id-here
GOOGLE_PROJECT_ID=${credentials.project_id}
GOOGLE_PRIVATE_KEY_ID=${credentials.private_key_id}
GOOGLE_PRIVATE_KEY="${credentials.private_key}"
GOOGLE_CLIENT_EMAIL=${credentials.client_email}
GOOGLE_CLIENT_ID=${credentials.client_id}
GOOGLE_CLIENT_X509_CERT_URL=${credentials.client_x509_cert_url}
`;
    
    console.log(envContent);
    
    // Ask if user wants to automatically add to .env.local
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n❓ Do you want to automatically add these to your .env.local file? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        
        rl.question('📊 Enter your Google Spreadsheet ID (from the URL): ', (spreadsheetId) => {
          if (!spreadsheetId.trim()) {
            console.log('❌ Spreadsheet ID is required. Please add it manually to .env.local');
            rl.close();
            return;
          }
          
          // Update the env content with the spreadsheet ID
          const finalEnvContent = envContent.replace('your-spreadsheet-id-here', spreadsheetId.trim());
          
          // Read existing .env.local if it exists
          let existingContent = '';
          if (fs.existsSync('.env.local')) {
            existingContent = fs.readFileSync('.env.local', 'utf8');
            
            // Remove existing Google Sheets config if present
            const lines = existingContent.split('\n');
            const filteredLines = lines.filter(line => 
              !line.startsWith('GOOGLE_SHEETS_') && 
              !line.startsWith('GOOGLE_PROJECT_') &&
              !line.startsWith('GOOGLE_PRIVATE_') &&
              !line.startsWith('GOOGLE_CLIENT_')
            );
            existingContent = filteredLines.join('\n');
          }
          
          // Append new configuration
          const newContent = existingContent + finalEnvContent;
          
          // Write to .env.local
          fs.writeFileSync('.env.local', newContent);
          
          console.log('\n✅ Configuration added to .env.local!');
          console.log('\n🔧 Testing the configuration...');
          
          rl.close();
          
          // Run validation
          const { spawn } = require('child_process');
          const validation = spawn('node', ['validate-google-sheets.js'], { stdio: 'inherit' });
          
          validation.on('close', (code) => {
            if (code === 0) {
              console.log('\n🎉 Setup completed successfully!');
              console.log('✅ Google Sheets integration is ready to use!');
            } else {
              console.log('\n❌ There was an issue with the configuration.');
              console.log('Please check the error messages above.');
            }
          });
        });
        
      } else {
        console.log('\n📝 Please manually copy the environment variables above to your .env.local file.');
        console.log('Don\'t forget to replace "your-spreadsheet-id-here" with your actual spreadsheet ID.');
        rl.close();
      }
    });
    
  } catch (error) {
    console.log('❌ Error reading JSON file:', error.message);
  }
}

extractCredentials();
