import fetch from 'node-fetch';

async function testNewVerificationAPI() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 Testing New Telegram Verification API\n');
    
    // Test the verify-telegram endpoint
    console.log('=== Testing /api/verify-telegram ===');
    const testUsernames = ['adityahansda', 'jehubsupport', 'testuser'];
    
    for (const username of testUsernames) {
        console.log(`Testing username: ${username}`);
        
        try {
            const response = await fetch(`${baseURL}/api/verify-telegram?username=${username}`);
            const data = await response.json();
            
            console.log(`Status: ${response.status}`);
            console.log(`Response:`, JSON.stringify(data, null, 2));
            
            if (data.user_data) {
                console.log('✅ User data included in response');
            } else {
                console.log('ℹ️ No user data (user not found)');
            }
            
        } catch (error) {
            console.error(`❌ Error testing ${username}:`, error.message);
        }
        console.log('---');
    }
    
    // Test the telegram-user endpoint
    console.log('\n=== Testing /api/telegram-user ===');
    
    // Test by username
    console.log('Testing by username: adityahansda');
    try {
        const response = await fetch(`${baseURL}/api/telegram-user?username=adityahansda`);
        const data = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error(`❌ Error testing telegram-user:`, error.message);
    }
    
    console.log('---');
    
    // Test by user ID (this will likely fail without real data)
    console.log('Testing by userId: 123456789');
    try {
        const response = await fetch(`${baseURL}/api/telegram-user?userId=123456789`);
        const data = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error(`❌ Error testing telegram-user by ID:`, error.message);
    }
    
    console.log('\n✅ Testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Updated verify-telegram API to use Appwrite database');
    console.log('- Added user_data field to verification response');
    console.log('- Created new telegram-user API for fetching user data');
    console.log('- Created comprehensive verification page at /verify-membership');
    console.log('- Updated existing verification pages to use new API structure');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3000/verify-membership');
    console.log('3. Test the verification functionality');
    console.log('4. Add real user data to your Appwrite database for testing');
}

testNewVerificationAPI().catch(console.error);
