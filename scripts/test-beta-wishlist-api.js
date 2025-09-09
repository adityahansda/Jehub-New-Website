const axios = require('axios');

// Test data for beta wishlist registration
const testData = {
  name: 'Test User API',
  branch: 'Computer Science',
  yearsOfStudy: '3rd Year',
  degree: 'B.Tech',
  collegeName: 'Test College',
  email: 'testapi@example.com',
  telegramId: 'testuser456',
  referCode: '' // Optional
};

async function testBetaWishlistAPI() {
  console.log('🧪 Testing Beta Wishlist API');
  console.log('=============================\n');
  
  try {
    console.log('📝 Sending POST request to /api/beta-wishlist-appwrite...');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/beta-wishlist-appwrite', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Clean up: Try to find and delete the test entry if possible
    // Note: This would require additional API endpoints for deletion
    
  } catch (error) {
    console.log('\n❌ ERROR!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

// Run the test
testBetaWishlistAPI();
