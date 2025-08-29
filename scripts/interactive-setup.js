const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Interactive Google Sheets Setup Guide');
console.log('=========================================\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runSetup() {
  console.log('Let me help you set up Google Sheets authentication step by step!\n');
  
  // Step 1: Check current status
  console.log('📍 Step 1: Checking current setup...');
  
  const hasCredentials = fs.existsSync('google-service-account.json');
  
  if (hasCredentials) {
    console.log('✅ Found google-service-account.json file!');
    
    try {
      const credentials = JSON.parse(fs.readFileSync('google-service-account.json', 'utf8'));
      console.log(`📧 Service account email: ${credentials.client_email}`);
      console.log('\n🎯 Next: Make sure you\'ve shared the spreadsheet with this email address');
      console.log('🔗 Spreadsheet: https://docs.google.com/spreadsheets/d/1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8');
      
      const shared = await askQuestion('\n❓ Have you shared the spreadsheet with the service account email? (y/n): ');
      
      if (shared.toLowerCase() === 'y' || shared.toLowerCase() === 'yes') {
        console.log('\n🎉 Great! Let\'s test the connection...');
        console.log('🧪 Run: npm run test-certificates');
      } else {
        console.log('\n📋 To share the spreadsheet:');
        console.log('1. Open: https://docs.google.com/spreadsheets/d/1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8');
        console.log('2. Click the "Share" button');
        console.log(`3. Add: ${credentials.client_email}`);
        console.log('4. Set permission to "Viewer"');
        console.log('5. Click "Send"');
        console.log('\nThen run: npm run test-certificates');
      }
    } catch (error) {
      console.log('❌ Found credentials file but it\'s invalid JSON');
      console.log('💡 Please check the file format or download a new one');
    }
    
    rl.close();
    return;
  }
  
  console.log('❌ No credentials file found');
  console.log('\n📝 You need to create a Google Cloud service account. Here\'s how:');
  console.log('\n🌐 Step 2: Create Google Cloud Project & Service Account');
  console.log('=======================================================');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Enable Google Sheets API:');
  console.log('   - Search "Google Sheets API"');
  console.log('   - Click on it and press "Enable"');
  console.log('4. Create Service Account:');
  console.log('   - Go to "APIs & Services" > "Credentials"');
  console.log('   - Click "Create Credentials" > "Service Account"');
  console.log('   - Name: jehub-sheets-access');
  console.log('   - Click "Create and Continue"');
  console.log('   - Skip role assignment, click "Done"');
  console.log('5. Generate Key:');
  console.log('   - Click on your service account email');
  console.log('   - Go to "Keys" tab');
  console.log('   - "Add Key" > "Create new key" > "JSON"');
  console.log('   - Download will start automatically');
  
  const created = await askQuestion('\n❓ Have you completed the above steps and downloaded the JSON file? (y/n): ');
  
  if (created.toLowerCase() === 'y' || created.toLowerCase() === 'yes') {
    console.log('\n📁 Step 3: Setup the credentials file');
    console.log('=====================================');
    console.log('1. Find your downloaded JSON file (usually in Downloads folder)');
    console.log('2. Rename it to: google-service-account.json');
    console.log('3. Move it to this directory:');
    console.log(`   ${process.cwd()}`);
    console.log('\n🔧 Then run: npm run verify-setup');
  } else {
    console.log('\n💡 Please complete the steps above first, then run this guide again with:');
    console.log('npm run interactive-setup');
  }
  
  rl.close();
}

runSetup().catch(console.error);
