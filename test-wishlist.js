const axios = require('axios');

async function testWishlistWithReferral() {
  try {
    console.log('Testing wishlist registration with referral code...');
    
    // Test data for wishlist registration
    const testData = {
      name: 'Test User',
      branch: 'Computer Science',
      yearsOfStudy: '3rd Year',
      collegeName: 'Test College',
      email: 'testuser@example.com',
      telegramId: '@testuser',
      referCode: 'ADHPRA71737118901234' // Replace with a valid referral code from your database
    };
    
    const response = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', testData);
    
    if (response.status === 201) {
      console.log('✅ Wishlist registration successful!');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing wishlist:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testWishlistWithoutReferral() {
  try {
    console.log('Testing wishlist registration without referral code...');
    
    // Test data for wishlist registration without referral
    const testData = {
      name: 'Test User 2',
      branch: 'Mechanical Engineering',
      yearsOfStudy: '2nd Year',
      collegeName: 'Test College 2',
      email: 'testuser2@example.com',
      telegramId: '@testuser2'
    };
    
    const response = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', testData);
    
    if (response.status === 201) {
      console.log('✅ Wishlist registration without referral successful!');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing wishlist without referral:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testWishlistWithInvalidReferral() {
  try {
    console.log('Testing wishlist registration with invalid referral code...');
    
    // Test data with invalid referral code
    const testData = {
      name: 'Test User 3',
      branch: 'Electrical Engineering',
      yearsOfStudy: '1st Year',
      collegeName: 'Test College 3',
      email: 'testuser3@example.com',
      telegramId: '@testuser3',
      referCode: 'INVALID123'
    };
    
    const response = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', testData);
    
    console.log('❌ This should have failed but succeeded:', response.data);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid referral code correctly rejected!');
      console.log('Error message:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    }
  }
}

// Run all tests
async function runTests() {
  console.log('=== TESTING WISHLIST FUNCTIONALITY ===\n');
  
  await testWishlistWithoutReferral();
  console.log('\n---\n');
  
  await testWishlistWithInvalidReferral();
  console.log('\n---\n');
  
  await testWishlistWithReferral();
  
  console.log('\n=== TESTS COMPLETED ===');
}

runTests();
