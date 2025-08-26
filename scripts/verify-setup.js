const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Google Sheets Setup...\n');

// Check for credentials file
const possiblePaths = [
  'google-service-account.json',
  'credentials.json',
  'service-account.json'
];

let credentialsFound = false;
let credentialsPath = null;
let serviceAccountEmail = null;

for (const filename of possiblePaths) {
  const filePath = path.join(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    credentialsFound = true;
    credentialsPath = filePath;
    
    try {
      const credentials = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      serviceAccountEmail = credentials.client_email;
      console.log(`✅ Found credentials file: ${filename}`);
      console.log(`✅ Service account email: ${serviceAccountEmail}`);
      console.log(`✅ Project ID: ${credentials.project_id}`);
      break;
    } catch (error) {
      console.log(`❌ Found ${filename} but it's not valid JSON:`, error.message);
    }
  }
}

if (!credentialsFound) {
  console.log('❌ No Google service account credentials found!');
  console.log('\n📝 To fix this:');
  console.log('1. Follow the setup guide in GOOGLE_SHEETS_SETUP_GUIDE.md');
  console.log('2. Download your service account JSON file');
  console.log('3. Rename it to google-service-account.json');
  console.log('4. Place it in the project root directory');
  console.log('\n📂 Expected location:');
  console.log(`   ${path.join(process.cwd(), 'google-service-account.json')}`);
} else {
  console.log('\n🎯 Next Steps:');
  console.log('1. Share your Google Sheet with this service account email:');
  console.log(`   📧 ${serviceAccountEmail}`);
  console.log('2. Give it "Viewer" permissions');
  console.log('3. Run: npm run test-certificates');
  console.log('\n🔗 Spreadsheet URL:');
  console.log('   https://docs.google.com/spreadsheets/d/1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8');
}

console.log('\n📋 Files in current directory:');
const files = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
files.forEach(file => {
  console.log(`   📄 ${file}`);
});
