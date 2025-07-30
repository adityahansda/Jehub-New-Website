const { Client, Databases, Query } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11');

const databases = new Databases(client);

// Test function to check if we can fetch user data
async function testDashboardService() {
    try {
        console.log('Testing Dashboard Service...');
        
        // Test 1: Check if we can connect to Appwrite
        console.log('1. Testing Appwrite connection...');
        const collections = await databases.listCollections(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998'
        );
        console.log('✅ Connected to Appwrite successfully');
        console.log('Available collections:', collections.collections.map(c => c.name));
        
        // Test 2: Check if users collection exists and has data
        console.log('\n2. Testing users collection...');
        const users = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998',
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40',
            [Query.limit(5)]
        );
        console.log('✅ Users collection accessible');
        console.log('Sample user data:', users.documents[0] ? {
            $id: users.documents[0].$id,
            name: users.documents[0].name,
            email: users.documents[0].email,
            totalPoints: users.documents[0].totalPoints
        } : 'No users found');
        
        // Test 3: Check if notes collection exists
        console.log('\n3. Testing notes collection...');
        const notes = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998',
            process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID || '686d382f00119e0bf90b',
            [Query.limit(5)]
        );
        console.log('✅ Notes collection accessible');
        console.log('Sample note data:', notes.documents[0] ? {
            $id: notes.documents[0].$id,
            title: notes.documents[0].title,
            userId: notes.documents[0].userId,
            downloads: notes.documents[0].downloads
        } : 'No notes found');
        
        // Test 4: Check if activities collection exists
        console.log('\n4. Testing activities collection...');
        try {
            const activities = await databases.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998',
                process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID || '6873f96f003939323c73',
                [Query.limit(5)]
            );
            console.log('✅ Activities collection accessible');
            console.log('Sample activity data:', activities.documents[0] ? {
                $id: activities.documents[0].$id,
                userId: activities.documents[0].userId,
                activityType: activities.documents[0].activityType,
                points: activities.documents[0].points
            } : 'No activities found');
        } catch (error) {
            console.log('⚠️ Activities collection not accessible:', error.message);
        }
        
        console.log('\n✅ Dashboard service test completed successfully!');
        
    } catch (error) {
        console.error('❌ Dashboard service test failed:', error);
    }
}

// Run the test
testDashboardService(); 