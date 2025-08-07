const fetch = require('node-fetch');

// If node-fetch is not installed, we'll use Node.js built-in fetch (Node 18+)
const fetchFn = typeof fetch === 'undefined' ? global.fetch : fetch;

async function testTelegramVerification() {
  const baseUrl = 'http://localhost:3000'; // Change to your app URL
  
  const testCases = [
    {
      username: 'testuser1',
      expected: { is_member: true, is_verified: true }
    },
    {
      username: 'adityatest', 
      expected: { is_member: true, is_verified: true }
    },
    {
      username: 'unverifieduser',
      expected: { is_member: true, is_verified: false }
    },
    {
      username: 'nonexistentuser',
      expected: { is_member: false, is_verified: false }
    }
  ];

  console.log('Testing Telegram verification API...\n');

  for (const testCase of testCases) {
    try {
      console.log(`Testing @${testCase.username}...`);
      
      const response = await fetch(`${baseUrl}/api/verify-telegram?username=${testCase.username}`);
      const data = await response.json();
      
      console.log(`  Response: ${JSON.stringify(data)}`);
      
      if (data.is_member === testCase.expected.is_member && 
          data.is_verified === testCase.expected.is_verified) {
        console.log(`  ✅ PASS\n`);
      } else {
        console.log(`  ❌ FAIL - Expected: ${JSON.stringify(testCase.expected)}\n`);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`);
    }
  }
}

// Check if we can use built-in fetch
if (typeof fetch === 'undefined') {
  console.log('Note: This test requires your Next.js app to be running on http://localhost:3000');
  console.log('Please run "npm run dev" in another terminal first.\n');
}

testTelegramVerification();
