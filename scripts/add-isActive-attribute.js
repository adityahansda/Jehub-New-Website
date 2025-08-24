const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#') && line.includes('=')) {
                const [key, ...valueParts] = line.split('=');
                let value = valueParts.join('=');
                
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                process.env[key] = value;
            }
        });
        
        console.log('✅ Environment variables loaded');
    } catch (error) {
        console.warn('⚠️ Could not load .env file:', error.message);
    }
}

loadEnv();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function addIsActiveAttribute() {
    try {
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
        const collectionId = 'ai_knowledge_collection';

        console.log('Adding isActive attribute...');

        await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            'isActive',
            false, // not required so we can have a default
            true   // default value
        );

        console.log('✅ isActive attribute added');

        // Wait for the attribute to be ready
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Now create the index
        console.log('Creating isActive index...');
        
        await databases.createIndex(
            databaseId,
            collectionId,
            'idx_isActive',
            'key',
            ['isActive']
        );

        console.log('✅ isActive index created');
        console.log('\n🎉 Setup complete! AI Knowledge Base is fully ready.');

    } catch (error) {
        if (error.code === 409) {
            console.log('isActive attribute already exists');
        } else {
            console.error('❌ Error:', error);
        }
    }
}

addIsActiveAttribute();
