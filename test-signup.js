// Test script to verify the signup fix and error handling
// Run this with: node test-signup.js
// This script tests both successful registration and error scenarios

const { Client, Account, Databases, ID, Permission, Role } = require('appwrite');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('686d35da003a55dfcc11');

const account = new Account(client);
const databases = new Databases(client);

const testSignup = async () => {
    try {
        console.log('🧪 Testing Appwrite signup process...');
        
        // Test 1: Try to create a user account
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        const testName = 'Test User';
        
        console.log('1. Creating user account...');
        const user = await account.create(ID.unique(), testEmail, testPassword, testName);
        console.log('✅ User created successfully:', user.email);
        
        // Test 2: Try to create a session
        console.log('2. Creating session...');
        const session = await account.createEmailPasswordSession(testEmail, testPassword);
        console.log('✅ Session created successfully');
        
        // Test 3: Try to create a user profile (this will test the permission fix)
        console.log('3. Creating user profile...');
        const profileData = {
            userId: user.$id,
            name: testName,
            email: testEmail,
            bio: '',
            avatar: 'https://i.pinimg.com/1200x/5f/6d/68/5f6d686ff201656132ea8bcdbf4bbb09.jpg',
            joinDate: new Date().toISOString(),
            role: 'user',
            totalPoints: 0,
            notesUploaded: 0,
            notesDownloaded: 0,
            requestsFulfilled: 0,
            communityPosts: 0,
            rank: 0,
            level: 'Beginner',
            lastLoginDate: new Date().toISOString(),
            dailyLoginStreak: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        // Using the fixed permissions (no Permission.create)
        const profile = await databases.createDocument(
            '686d370a000cfabbd998', // Database ID
            '6873f4f10034ced70a40', // Users collection ID
            ID.unique(),
            profileData,
            [
                Permission.read(Role.user(user.$id)),
                Permission.write(Role.user(user.$id)),
                Permission.read(Role.any()),
            ]
        );
        
        console.log('✅ User profile created successfully');
        
        // Clean up - delete the test user session
        await account.deleteSession('current');
        console.log('✅ Test session deleted');
        
        console.log('\n🎉 All tests passed! The signup process should work now.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error type:', error.type);
    }
};

// Test error scenarios
const testErrorScenarios = async () => {
    try {
        console.log('\n🧪 Testing error scenarios...');
        
        // Test 1: Try to create user with invalid profile data
        console.log('1. Testing profile creation failure...');
        const testEmail = `error-test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        const testName = 'Error Test User';
        
        // Create user account
        const user = await account.create(ID.unique(), testEmail, testPassword, testName);
        console.log('✅ User account created for error test');
        
        // Create session
        await account.createEmailPasswordSession(testEmail, testPassword);
        console.log('✅ Session created for error test');
        
        // Try to create profile with invalid data (this should fail)
        try {
            await databases.createDocument(
                '686d370a000cfabbd998', // Database ID
                'invalid-collection-id', // Invalid collection ID to force error
                ID.unique(),
                {
                    userId: user.$id,
                    name: testName,
                    email: testEmail,
                    avatar: 'https://i.pinimg.com/1200x/5f/6d/68/5f6d686ff201656132ea8bcdbf4bbb09.jpg',
                },
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.write(Role.user(user.$id)),
                    Permission.read(Role.any()),
                ]
            );
            
            console.log('❌ Profile creation should have failed but didn\'t');
        } catch (profileError) {
            console.log('✅ Profile creation failed as expected:', profileError.message);
            
            // Clean up - delete the session (simulating rollback)
            try {
                await account.deleteSession('current');
                console.log('✅ Session cleaned up after profile creation failure');
            } catch (cleanupError) {
                console.log('❌ Session cleanup failed:', cleanupError.message);
            }
        }
        
        console.log('\n✅ Error scenario testing completed');
        
    } catch (error) {
        console.error('❌ Error scenario test failed:', error.message);
    }
};

// Run both tests
const runAllTests = async () => {
    await testSignup();
    await testErrorScenarios();
};

// Run the tests
runAllTests();
