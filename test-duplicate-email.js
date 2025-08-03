const axios = require('axios');

async function testDuplicateEmailCheck() {
  const sameEmail = 'duplicate.test@example.com';
  
  console.log('🧪 Testing duplicate email functionality...\n');
  
  // Test 1: First registration with the email
  console.log('📝 Test 1: First registration with email:', sameEmail);
  try {
    const firstRegistration = {
      name: 'First User',
      branch: 'Computer Science',
      yearsOfStudy: '3rd Year',
      collegeName: 'Test College 1',
      email: sameEmail,
      telegramId: '@firstuser'
    };
    
    const response1 = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', firstRegistration, {
      timeout: 15000
    });
    
    console.log('✅ First registration successful!');
    console.log('Response:', response1.data.message);
    
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('ℹ️  Email was already registered from a previous test');
      console.log('Message:', error.response.data.error);
    } else {
      console.log('❌ First registration failed:', error.response?.data?.error || error.message);
      return; // Exit if first registration fails for unexpected reasons
    }
  }
  
  console.log('\n---\n');
  
  // Test 2: Second registration with the same email (should fail)
  console.log('📝 Test 2: Second registration with same email:', sameEmail);
  try {
    const secondRegistration = {
      name: 'Second User',
      branch: 'Mechanical Engineering',
      yearsOfStudy: '2nd Year',
      collegeName: 'Test College 2',
      email: sameEmail,
      telegramId: '@seconduser'
    };
    
    const response2 = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', secondRegistration, {
      timeout: 15000
    });
    
    console.log('❌ This should have failed but succeeded:', response2.data);
    
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('✅ Duplicate email correctly rejected!');
      console.log('Status Code:', error.response.status);
      console.log('Error Message:', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n---\n');
  
  // Test 3: Registration with a different email (should succeed)
  console.log('📝 Test 3: Registration with different email');
  try {
    const differentEmailRegistration = {
      name: 'Third User',
      branch: 'Electrical Engineering',
      yearsOfStudy: '1st Year',
      collegeName: 'Test College 3',
      email: `different.${Date.now()}@example.com`,
      telegramId: '@thirduser'
    };
    
    console.log('Using email:', differentEmailRegistration.email);
    
    const response3 = await axios.post('http://localhost:3000/api/beta-wishlist-sheets', differentEmailRegistration, {
      timeout: 15000
    });
    
    console.log('✅ Different email registration successful!');
    console.log('Response:', response3.data.message);
    
  } catch (error) {
    console.log('❌ Different email registration failed:', error.response?.data?.error || error.message);
  }
  
  console.log('\n=== DUPLICATE EMAIL TEST COMPLETED ===');
}

testDuplicateEmailCheck();
