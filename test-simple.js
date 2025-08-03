const axios = require('axios');

async function testWishlistAPI() {
  try {
    console.log('🧪 Testing wishlist API connection...');
    
    const testData = {
      name: 'Test User',
      branch: 'Computer Science',
      yearsOfStudy: '3rd Year',
      collegeName: 'Test College',
      email: `test${Date.now()}@example.com`, // Unique email to avoid duplicates
      telegramId: `@testuser${Date.now()}`
    };
    
    console.log('📤 Sending request to API...');
    const response = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', testData, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Connection refused. Is the development server running on port 3000?');
      console.log('   → Run: npm run dev');
    } else if (error.response) {
      console.log('   → HTTP Status:', error.response.status);
      console.log('   → Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('   → No response received');
      console.log('   → Error:', error.message);
    } else {
      console.log('   → Unexpected error:', error.message);
    }
  }
}

testWishlistAPI();
