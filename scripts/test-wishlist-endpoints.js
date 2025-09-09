const axios = require('axios');

async function testEndpoint(endpoint, name) {
    console.log(`\n🔍 Testing ${name} (${endpoint})`);
    console.log('=' + '='.repeat(50));
    
    const startTime = Date.now();
    
    try {
        const response = await axios.get(`http://localhost:3000${endpoint}`, {
            timeout: 10000 // 10 second timeout
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`✅ SUCCESS`);
        console.log(`⏱️  Response time: ${responseTime}ms`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`📈 Total entries: ${response.data.total || response.data.totalCount || 0}`);
        console.log(`🏫 Colleges: ${response.data.summary?.collegeCount || response.data.collegeSummary?.length || 0}`);
        
        if (response.data.entries) {
            console.log(`📋 Entries array length: ${response.data.entries.length}`);
        }
        if (response.data.collegeSummary) {
            console.log(`🎓 College summary length: ${response.data.collegeSummary.length}`);
        }
        
        // Performance analysis
        if (responseTime < 1000) {
            console.log(`🚀 Performance: Excellent (< 1s)`);
        } else if (responseTime < 3000) {
            console.log(`⚠️  Performance: Slow (1-3s)`);
        } else {
            console.log(`🐌 Performance: Very slow (> 3s)`);
        }
        
        return {
            success: true,
            responseTime,
            totalEntries: response.data.total || response.data.totalCount || 0,
            colleges: response.data.summary?.collegeCount || response.data.collegeSummary?.length || 0
        };
        
    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`❌ FAILED`);
        console.log(`⏱️  Time before failure: ${responseTime}ms`);
        
        if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            console.log(`🔌 Network Error: Server not running or connection failed`);
        } else if (error.code === 'ECONNABORTED') {
            console.log(`⏰ Timeout: Request took longer than 10 seconds`);
        } else if (error.response) {
            console.log(`📊 Status: ${error.response.status}`);
            console.log(`❌ Error: ${error.response.data?.error || 'Unknown error'}`);
            console.log(`📝 Details: ${error.response.data?.details || 'No additional details'}`);
        } else {
            console.log(`💥 Unexpected Error: ${error.message}`);
        }
        
        return {
            success: false,
            responseTime,
            error: error.message
        };
    }
}

async function main() {
    console.log('🧪 Wishlist Endpoints Performance Test');
    console.log('======================================\n');
    console.log('ℹ️  Make sure your development server is running (npm run dev)');
    console.log('ℹ️  Testing timeout is set to 10 seconds per endpoint');
    
    const results = {};
    
    // Test Appwrite endpoint
    results.appwrite = await testEndpoint('/api/beta-wishlist-appwrite', 'Appwrite API');
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test Google Sheets endpoint
    results.sheets = await testEndpoint('/api/beta-wishlist-sheets', 'Google Sheets API');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE COMPARISON');
    console.log('='.repeat(60));
    
    if (results.appwrite.success && results.sheets.success) {
        console.log(`\n🏆 Winner by speed: ${results.appwrite.responseTime < results.sheets.responseTime ? 'Appwrite' : 'Google Sheets'}`);
        console.log(`⚡ Appwrite: ${results.appwrite.responseTime}ms`);
        console.log(`📊 Google Sheets: ${results.sheets.responseTime}ms`);
        console.log(`📈 Speed difference: ${Math.abs(results.appwrite.responseTime - results.sheets.responseTime)}ms`);
    }
    
    console.log('\n💡 RECOMMENDATION:');
    if (results.appwrite.success && results.sheets.success) {
        if (results.appwrite.responseTime < results.sheets.responseTime) {
            console.log('✅ Use Appwrite API - it\'s faster and more reliable');
            console.log('📝 Update wishlist-users.tsx to use /api/beta-wishlist-appwrite');
        } else {
            console.log('📊 Google Sheets API is performing better');
            console.log('🔍 Consider investigating why Appwrite is slower');
        }
    } else if (results.appwrite.success && !results.sheets.success) {
        console.log('✅ Use Appwrite API - Google Sheets API is not working');
    } else if (!results.appwrite.success && results.sheets.success) {
        console.log('📊 Use Google Sheets API - Appwrite API is not working');
    } else {
        console.log('❌ Both APIs are failing - check server configuration');
    }
    
    console.log('\n🔍 TROUBLESHOOTING:');
    if (!results.appwrite.success && !results.sheets.success) {
        console.log('1. Make sure the development server is running (npm run dev)');
        console.log('2. Check your .env file for correct API keys');
        console.log('3. Verify Appwrite and Google Sheets configurations');
    } else if (!results.appwrite.success) {
        console.log('1. Check Appwrite configuration in .env');
        console.log('2. Verify API key permissions');
        console.log('3. Ensure collection exists and has proper structure');
    } else if (!results.sheets.success) {
        console.log('1. Check Google Sheets configuration in .env');
        console.log('2. Verify Google service account credentials');
        console.log('3. Ensure spreadsheet exists and is accessible');
    }
}

main().catch(console.error);
