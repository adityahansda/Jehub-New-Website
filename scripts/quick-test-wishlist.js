require('dotenv').config();
const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function quickTest() {
    console.log('🚀 Quick Wishlist Test');
    console.log('=======================\n');
    
    try {
        const startTime = Date.now();
        
        // Test the same query as the API
        const entries = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_BETA_WISHLIST_COLLECTION_ID,
            [Query.orderDesc('$createdAt'), Query.limit(1000)]
        );
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log('✅ SUCCESS!');
        console.log(`⏱️  Query time: ${responseTime}ms`);
        console.log(`📊 Total entries: ${entries.total}`);
        console.log(`📋 Documents fetched: ${entries.documents.length}`);
        
        if (entries.documents.length > 0) {
            const sample = entries.documents[0];
            console.log('\n📝 Sample entry:');
            console.log(`   - Name: ${sample.name || 'N/A'}`);
            console.log(`   - College: ${sample.collegeName || 'N/A'}`);
            console.log(`   - Email: ${sample.email || 'N/A'}`);
            console.log(`   - Branch: ${sample.branch || 'N/A'}`);
            console.log(`   - Degree: ${sample.degree || 'N/A'}`);
            console.log(`   - Status: ${sample.status || 'N/A'}`);
            console.log(`   - Created: ${sample.$createdAt || 'N/A'}`);
        }
        
        // Test college grouping
        const entriesByCollege = {};
        entries.documents.forEach(entry => {
            const collegeName = entry.collegeName || 'Unknown College';
            if (!entriesByCollege[collegeName]) {
                entriesByCollege[collegeName] = [];
            }
            entriesByCollege[collegeName].push(entry);
        });
        
        const collegeCount = Object.keys(entriesByCollege).length;
        console.log(`\n🏫 Colleges represented: ${collegeCount}`);
        Object.keys(entriesByCollege).forEach(college => {
            console.log(`   - ${college}: ${entriesByCollege[college].length} students`);
        });
        
        if (responseTime < 500) {
            console.log('\n🚀 Performance: Excellent!');
        } else if (responseTime < 1500) {
            console.log('\n⚠️  Performance: Could be better');
        } else {
            console.log('\n🐌 Performance: Needs optimization');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('   - Type:', error.type || 'Unknown');
        console.error('   - Code:', error.code || 'Unknown');
    }
}

quickTest();
