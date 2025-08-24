const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';

async function createAIKnowledgeCollection() {
  try {
    console.log('Creating AI Knowledge Base collection...');

    const collectionId = 'ai_knowledge_' + Date.now();
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      collectionId,
      'AI Knowledge Base',
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created with ID:', collectionId);

    // Create attributes
    const attributes = [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000, required: true },
      { key: 'category', type: 'string', size: 100, required: true, default: 'general' },
      { key: 'tags', type: 'string', size: 1000, required: false, array: true },
      { key: 'rules', type: 'string', size: 2000, required: false },
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'createdBy', type: 'string', size: 100, required: false },
      { key: 'priority', type: 'integer', required: false, default: 1 },
      { key: 'lastUsed', type: 'datetime', required: false }
    ];

    console.log('Creating attributes...');
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          if (attr.array) {
            await databases.createStringAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.size,
              attr.required,
              attr.default,
              true // array
            );
          } else {
            await databases.createStringAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.size,
              attr.required,
              attr.default
            );
          }
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        }
        console.log(`✅ Created attribute: ${attr.key}`);
      } catch (error) {
        console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    // Create indexes for better performance
    console.log('Creating indexes...');
    try {
      await databases.createIndex(
        DATABASE_ID,
        collectionId,
        'category_index',
        'key',
        ['category']
      );
      console.log('✅ Created category index');
    } catch (error) {
      console.error('❌ Error creating category index:', error.message);
    }

    try {
      await databases.createIndex(
        DATABASE_ID,
        collectionId,
        'active_index',
        'key',
        ['isActive']
      );
      console.log('✅ Created active index');
    } catch (error) {
      console.error('❌ Error creating active index:', error.message);
    }

    try {
      await databases.createIndex(
        DATABASE_ID,
        collectionId,
        'priority_index',
        'key',
        ['priority']
      );
      console.log('✅ Created priority index');
    } catch (error) {
      console.error('❌ Error creating priority index:', error.message);
    }

    console.log('\n🎉 AI Knowledge Base collection setup completed!');
    console.log(`📝 Please update your .env file with the new collection ID:`);
    console.log(`NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID=${collectionId}`);

    return collectionId;
  } catch (error) {
    console.error('❌ Error creating AI Knowledge Base collection:', error);
    throw error;
  }
}

async function seedInitialKnowledgeData(collectionId) {
  console.log('\n🌱 Seeding initial knowledge data...');

  const initialData = [
    {
      title: 'JEHUB Platform Overview',
      content: 'JEHUB (Jharkhand Engineer\'s Hub) is an educational platform designed specifically for diploma and engineering students in Jharkhand. The platform provides features like note sharing, AI mentoring, community groups, points-based rewards system, and career guidance. Students can download notes, upload their own content, participate in community discussions, and get personalized AI assistance for their studies.',
      category: 'platform',
      tags: ['jehub', 'platform', 'overview', 'features'],
      rules: 'Always mention that JEHUB is specifically for Jharkhand engineering students when introducing the platform.',
      isActive: true,
      createdBy: 'system',
      priority: 10
    },
    {
      title: 'Engineering Study Tips',
      content: 'Effective study strategies for engineering students include: 1) Active learning through problem-solving, 2) Creating mind maps for complex concepts, 3) Regular revision schedules, 4) Group study sessions, 5) Practical application of theoretical concepts, 6) Using visual aids and diagrams, 7) Breaking down complex topics into smaller parts, 8) Seeking help when needed, 9) Maintaining a study-life balance.',
      category: 'academic',
      tags: ['study tips', 'engineering', 'learning', 'academic success'],
      rules: 'Provide practical, actionable advice suitable for Indian engineering education system.',
      isActive: true,
      createdBy: 'system',
      priority: 8
    },
    {
      title: 'Career Paths After Diploma',
      content: 'After completing a diploma in engineering, students have several career options: 1) Direct employment in industries, 2) Lateral entry to B.Tech (usually 2nd year), 3) Government jobs through SSC, Railway exams, 4) Starting own business/startup, 5) Pursuing higher diploma or specialized courses, 6) Technical sales roles, 7) Quality control positions. In Jharkhand, major industries include steel, mining, power, and manufacturing which offer good opportunities for diploma holders.',
      category: 'career',
      tags: ['diploma', 'career', 'jobs', 'lateral entry', 'jharkhand'],
      rules: 'Focus on opportunities specifically available in Jharkhand and nearby states.',
      isActive: true,
      createdBy: 'system',
      priority: 9
    },
    {
      title: 'Thermodynamics Fundamentals',
      content: 'Thermodynamics deals with heat, work, temperature, and energy. Key concepts include: 1) System and surroundings, 2) First Law (energy conservation), 3) Second Law (entropy), 4) Thermodynamic processes (isothermal, adiabatic, isobaric, isochoric), 5) Heat engines and refrigerators, 6) Carnot cycle, 7) Properties like enthalpy, entropy, and internal energy. These concepts are fundamental in mechanical, chemical, and thermal engineering.',
      category: 'engineering',
      tags: ['thermodynamics', 'heat', 'energy', 'mechanical engineering'],
      rules: 'Explain concepts with practical examples from everyday life and industrial applications.',
      isActive: true,
      createdBy: 'system',
      priority: 7
    },
    {
      title: 'Points and Rewards System',
      content: 'JEHUB uses a points-based reward system to encourage community participation. Students earn points by: uploading notes (+30 points), referring friends (+50 points), completing profile (+20 points), active participation (+5-10 points). Points can be used to download premium notes or unlock special features. This gamification encourages knowledge sharing and community building.',
      category: 'platform',
      tags: ['points', 'rewards', 'gamification', 'community'],
      rules: 'Always mention specific point values and how students can earn them.',
      isActive: true,
      createdBy: 'system',
      priority: 6
    }
  ];

  for (const data of initialData) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        collectionId,
        ID.unique(),
        {
          ...data,
          lastUsed: new Date().toISOString()
        }
      );
      console.log(`✅ Added: ${data.title}`);
    } catch (error) {
      console.error(`❌ Error adding ${data.title}:`, error.message);
    }
  }

  console.log('✅ Initial knowledge data seeded successfully!');
}

async function main() {
  try {
    const collectionId = await createAIKnowledgeCollection();
    
    // Wait a bit for collection to be ready
    console.log('\n⏳ Waiting for collection to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await seedInitialKnowledgeData(collectionId);
    
    console.log('\n🎉 Setup completed successfully!');
    console.log(`📝 Don't forget to update your .env file with:`);
    console.log(`NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID=${collectionId}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createAIKnowledgeCollection, seedInitialKnowledgeData };
