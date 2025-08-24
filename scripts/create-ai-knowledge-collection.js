const { Client, Databases, Permission, Role, ID } = require('node-appwrite');
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

async function createAIKnowledgeCollection() {
    try {
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
        const collectionId = 'ai_knowledge_collection';

        console.log('Creating AI Knowledge Base collection...');

        // Create the collection
        const collection = await databases.createCollection(
            databaseId,
            collectionId,
            'AI Knowledge Base',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        console.log('Collection created:', collection.name);

        // Create attributes
        const attributes = [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 65535, required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'rules', type: 'string', size: 5000, required: false },
            { key: 'isActive', type: 'boolean', required: false, default: true },
            { key: 'createdBy', type: 'string', size: 255, required: true },
            { key: 'userEmail', type: 'string', size: 255, required: false },
            { key: 'tags', type: 'string', size: 1000, required: false, array: true },
            { key: 'githubPath', type: 'string', size: 500, required: false },
            { key: 'fileName', type: 'string', size: 255, required: false },
            { key: 'version', type: 'integer', required: false, default: 1 },
            { key: 'status', type: 'string', size: 50, required: false, default: 'active' }
        ];

        for (const attr of attributes) {
            console.log(`Creating attribute: ${attr.key}`);
            
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
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    databaseId,
                    collectionId,
                    attr.key,
                    attr.required,
                    attr.default !== undefined ? attr.default : null
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

            // Wait a bit between attribute creations
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Create datetime attributes for timestamps
        console.log('Creating datetime attributes...');
        
        await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            'createdAt',
            true,
            new Date().toISOString()
        );

        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            'updatedAt',
            true,
            new Date().toISOString()
        );

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create indexes for better search performance
        console.log('Creating indexes...');
        
        try {
            await databases.createIndex(
                databaseId,
                collectionId,
                'idx_category',
                'key',
                ['category']
            );
        } catch (e) {
            console.log('Index category might already exist:', e.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await databases.createIndex(
                databaseId,
                collectionId,
                'idx_isActive',
                'key',
                ['isActive']
            );
        } catch (e) {
            console.log('Index isActive might already exist:', e.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await databases.createIndex(
                databaseId,
                collectionId,
                'idx_title',
                'fulltext',
                ['title']
            );
        } catch (e) {
            console.log('Index title might already exist:', e.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await databases.createIndex(
                databaseId,
                collectionId,
                'idx_content',
                'fulltext',
                ['content']
            );
        } catch (e) {
            console.log('Index content might already exist:', e.message);
        }

        console.log('✅ AI Knowledge Base collection created successfully!');
        console.log('Collection ID:', collectionId);
        console.log('\nDon\'t forget to update your .env file with:');
        console.log(`NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID=${collectionId}`);

        // Create sample knowledge entry
        console.log('\nCreating sample knowledge entry...');
        
        const sampleEntry = {
            title: 'Getting Started with JEHUB Platform',
            content: 'JEHUB (Jharkhand Engineer\'s Hub) is a comprehensive platform designed for engineering and diploma students in Jharkhand, India. Key features include:\n\n1. Notes Sharing: Students can upload and download engineering notes across various subjects\n2. Points System: Earn points by uploading quality content and participating in the community\n3. Community Features: Join WhatsApp and Telegram groups for discussions\n4. Career Guidance: Get advice on career paths, internships, and placements\n5. Study Resources: Access curated study materials for various engineering disciplines\n\nTo get started:\n- Create your profile with your college details\n- Verify your membership through Telegram\n- Start uploading or downloading notes\n- Participate in community discussions',
            category: 'platform-features',
            rules: 'When answering questions about JEHUB platform, always be encouraging and guide users to explore different features. Mention specific benefits like the points system and community support.',
            isActive: true,
            createdBy: 'System Admin',
            userEmail: 'admin@jehub.com',
            tags: ['platform', 'getting-started', 'features', 'community'],
            githubPath: 'ai-knowledge/platform-features/getting-started-with-jehub-platform.txt',
            fileName: 'getting-started-with-jehub-platform.txt',
            version: 1,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const sampleDoc = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            sampleEntry
        );

        console.log('✅ Sample knowledge entry created:', sampleDoc.$id);

        console.log('\n🚀 Setup complete! Your AI Knowledge Base is ready to use.');
        console.log('You can now:');
        console.log('1. Add the AI Knowledge Manager component to your admin dashboard');
        console.log('2. Start creating knowledge base entries through the admin interface');
        console.log('3. The AI chat will automatically use the knowledge base for better responses');

    } catch (error) {
        console.error('❌ Error creating AI Knowledge Base collection:', error);
        
        if (error.code === 409) {
            console.log('Collection might already exist. Trying to update...');
            // You could add update logic here if needed
        }
    }
}

// Also create AI Settings collection
async function createAISettingsCollection() {
    try {
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
        const collectionId = 'ai_settings_collection';

        console.log('\nCreating AI Settings collection...');

        // Create the collection
        const collection = await databases.createCollection(
            databaseId,
            collectionId,
            'AI Settings',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        console.log('AI Settings collection created:', collection.name);

        // Create attributes for settings
        await databases.createStringAttribute(databaseId, collectionId, 'settings', 65535, true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await databases.createDatetimeAttribute(databaseId, collectionId, 'createdAt', true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await databases.createDatetimeAttribute(databaseId, collectionId, 'lastUpdated', true);

        console.log('✅ AI Settings collection created successfully!');

    } catch (error) {
        console.error('❌ Error creating AI Settings collection:', error);
    }
}

// Run the script
async function main() {
    console.log('🚀 Setting up AI Knowledge Base Management System...\n');
    
    await createAIKnowledgeCollection();
    await createAISettingsCollection();
    
    console.log('\n✨ All done! Your AI system is ready to go.');
}

main().catch(console.error);
