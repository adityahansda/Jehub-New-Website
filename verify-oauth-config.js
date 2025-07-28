// Script to verify your OAuth configuration
// Run this with: node verify-oauth-config.js

require('dotenv').config();

console.log('🔍 Verifying OAuth Configuration...\n');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('📋 Current Configuration:');
console.log(`   Appwrite Endpoint: ${endpoint}`);
console.log(`   Project ID: ${projectId}\n`);

if (!endpoint || !projectId) {
  console.log('❌ Missing configuration! Check your .env file.');
  process.exit(1);
}

console.log('🔗 Required Google Cloud Console Redirect URI:');
console.log(`   ${endpoint}/account/sessions/oauth2/callback/google/${projectId}\n`);

console.log('⚙️  Appwrite OAuth Settings:');
console.log('   Success URL (development): http://localhost:3000/auth/oauth-success');
console.log('   Failure URL (development): http://localhost:3000/auth/oauth-failure');
console.log('   Success URL (production): https://jehub.vercel.app/auth/oauth-success');
console.log('   Failure URL (production): https://jehub.vercel.app/auth/oauth-failure\n');

console.log('✅ Next Steps:');
console.log('1. Copy the redirect URI above');
console.log('2. Add it to your Google Cloud Console OAuth credentials');
console.log('3. Configure the Appwrite OAuth provider with your Google credentials');
console.log('4. Test the authentication flow\n');

console.log('🚀 You can now test Google OAuth authentication!');
