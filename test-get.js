const axios = require('axios');

async function testAPIAccess() {
  try {
    console.log('🔍 Testing API endpoint accessibility...');
    
    const response = await axios.get('http://localhost:3000/api/beta-wishlist-sheets', {
      timeout: 5000
    });
    
    console.log('✅ GET request successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('📝 GET Request Response:');
    
    if (error.response) {
      console.log('   → HTTP Status:', error.response.status);
      console.log('   → Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 405) {
        console.log('✅ API endpoint is accessible (Method Not Allowed is expected for GET)');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused. Server not running.');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testAPIAccess();
