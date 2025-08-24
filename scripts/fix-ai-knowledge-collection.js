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
                
                // Remove quotes if present
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

// Load environment variables
loadEnv();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function fixAIKnowledgeCollection() {
    try {
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
        const collectionId = 'ai_knowledge_collection';

        console.log('Adding missing attributes to AI Knowledge Base collection...');

        // Missing attributes that need to be added
        const missingAttributes = [
            { key: 'createdBy', type: 'string', size: 255, required: true },
            { key: 'userEmail', type: 'string', size: 255, required: false },
            { key: 'tags', type: 'string', size: 1000, required: false, array: true },
            { key: 'githubPath', type: 'string', size: 500, required: false },
            { key: 'fileName', type: 'string', size: 255, required: false },
            { key: 'version', type: 'integer', required: false, default: 1 },
            { key: 'status', type: 'string', size: 50, required: false, default: 'active' }
        ];

        for (const attr of missingAttributes) {
            console.log(`Adding attribute: ${attr.key}`);
            
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        collectionId,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default || null,
                        attr.array || false
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        databaseId,
                        collectionId,
                        attr.key,
                        attr.required,
                        null, // min
                        null, // max
                        attr.default !== undefined ? attr.default : null
                    );
                }
                
                // Wait between attribute creations
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (e) {
                if (e.code === 409) {
                    console.log(`  - ${attr.key} already exists, skipping`);
                } else {
                    console.error(`  - Error creating ${attr.key}:`, e.message);
                }
            }
        }

        // Add datetime attributes
        const datetimeAttrs = [
            { key: 'createdAt', required: true },
            { key: 'updatedAt', required: true }
        ];

        console.log('\nAdding datetime attributes...');
        for (const attr of datetimeAttrs) {
            try {
                await databases.createDatetimeAttribute(
                    databaseId,
                    collectionId,
                    attr.key,
                    attr.required
                );
                console.log(`  - ${attr.key} added`);
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (e) {
                if (e.code === 409) {
                    console.log(`  - ${attr.key} already exists, skipping`);
                } else {
                    console.error(`  - Error creating ${attr.key}:`, e.message);
                }
            }
        }

        // Wait for attributes to be ready
        console.log('\nWaiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Create indexes
        console.log('\nCreating indexes...');
        const indexes = [
            { name: 'idx_category', type: 'key', attributes: ['category'] },
            { name: 'idx_isActive', type: 'key', attributes: ['isActive'] },
            { name: 'idx_title', type: 'fulltext', attributes: ['title'] },
            { name: 'idx_content', type: 'fulltext', attributes: ['content'] }
        ];

        for (const index of indexes) {
            try {
                await databases.createIndex(
                    databaseId,
                    collectionId,
                    index.name,
                    index.type,
                    index.attributes
                );
                console.log(`  - ${index.name} created`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                if (e.code === 409) {
                    console.log(`  - ${index.name} already exists, skipping`);
                } else {
                    console.error(`  - Error creating ${index.name}:`, e.message);
                }
            }
        }

        console.log('\n✅ AI Knowledge Base collection setup completed!');
        console.log('Collection ID: ai_knowledge_collection');
        console.log('\n🚀 Your AI Knowledge Base is ready to use!');

    } catch (error) {
        console.error('❌ Error fixing AI Knowledge Base collection:', error);
    }
}

// Run the script
async function main() {
    console.log('🔧 Fixing AI Knowledge Base Management System...\n');
    await fixAIKnowledgeCollection();
    console.log('\n✨ Setup complete!');
}

main().catch(console.error);
