import fetch from 'node-fetch';

async function testVerificationAPI() {
    const baseURL = 'http://localhost:3000';
    
    // Test usernames to try (replace with actual usernames from your group)
    const testUsernames = [
        'adityahansda',  // Should be found if the user is in the group
        'jehubsupport',  // Should be found if the user is in the group
        'nonexistentuser123'  // Should not be found
    ];
    
    console.log('🧪 Testing Telegram Verification API\n');
    
    for (const username of testUsernames) {
        console.log(`Testing username: ${username}`);
        
        try {
            const response = await fetch(`${baseURL}/api/verify-telegram?username=${username}`);
            const data = await response.json();
            
            console.log(`Status: ${response.status}`);
            console.log(`Response:`, JSON.stringify(data, null, 2));
            console.log('---');
            
        } catch (error) {
            console.error(`Error testing ${username}:`, error.message);
            console.log('---');
        }
    }
}

// Run the test if this file is executed directly
testVerificationAPI().catch(console.error);

export { testVerificationAPI };
