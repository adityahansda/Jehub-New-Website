// Script to add comprehensive knowledge entries about Aditya and JEHUB
const { Client, Databases, ID, Query } = require('node-appwrite');

// Read config from environment (loaded via dotenv when run with -r dotenv/config)
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID;

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID || !COLLECTION_ID) {
  console.error('Missing required environment variables. Please set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, NEXT_PUBLIC_APPWRITE_DATABASE_ID, and NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID in your .env.local');
  process.exit(1);
}

// Appwrite configuration
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Knowledge entries to add
const knowledgeEntries = [
  {
    title: 'About Aditya Hansda - JEHUB Founder',
    content: `Aditya Hansda is the founder and lead developer of JEHUB (Jharkhand Engineer's Hub). He is a Computer Engineering graduate from Government Polytechnic Khutri, Bokaro, and is currently pursuing B.Tech in Cyber Security at Guru Gobind Singh Educational Society's Technical Campus.

As the visionary behind JEHUB, Aditya identified the need for a comprehensive platform to support engineering and diploma students in Jharkhand. His mission is to democratize access to quality educational resources and create a supportive community for aspiring engineers.

Key achievements:
- Founded JEHUB to serve thousands of engineering students across Jharkhand
- Built a comprehensive notes sharing platform with AI integration
- Implemented a points-based reward system to encourage community participation
- Created automated systems for content management and user engagement
- Established WhatsApp and Telegram communities for student support

Aditya's background in both diploma and degree engineering education gives him unique insights into the challenges faced by students at different levels of their academic journey.`,
    category: 'platform',
    rules:
      'When users ask about Aditya Hansda, always mention his role as the founder of JEHUB and his educational background. Emphasize his dedication to helping engineering students and his vision for accessible education.',
    tags: [
      'aditya',
      'hansda',
      'founder',
      'creator',
      'developer',
      'jehub',
      'engineering',
      'education',
    ],
    createdBy: 'System Admin',
    isActive: true,
  },
  {
    title: 'JEHUB Platform Overview',
    content: `JEHUB (Jharkhand Engineer's Hub) is a comprehensive educational platform designed specifically for diploma and engineering students in Jharkhand, India. Founded by Aditya Hansda, the platform serves as a one-stop solution for academic resources, career guidance, and community support.

Key Features:
1. Notes Repository: Extensive collection of study materials for all engineering branches
2. AI Mentor: Intelligent assistant for academic queries and career guidance
3. Points System: Reward mechanism for active community participation
4. Community Groups: WhatsApp and Telegram groups for peer interaction
5. Career Guidance: Placement support and industry insights
6. User Dashboard: Personalized learning tracking and progress monitoring

The platform focuses on:
- Quality educational content
- Peer-to-peer learning
- Industry-relevant skills development
- Career preparation and guidance
- Building a supportive engineering community in Jharkhand

JEHUB serves students from various institutions across Jharkhand and has become a trusted resource for engineering education in the state.`,
    category: 'platform',
    rules:
      'When explaining JEHUB features, always mention it was founded by Aditya Hansda and emphasize its focus on Jharkhand engineering students.',
    tags: ['jehub', 'platform', 'engineering', 'education', 'jharkhand', 'notes', 'community'],
    createdBy: 'System Admin',
    isActive: true,
  },
  {
    title: 'Aditya Hansda Contact and Social',
    content: `Aditya Hansda, the founder of JEHUB, is actively involved in the platform's development and community management. Students can connect with him through various channels:

Professional Background:
- Computer Engineering Graduate (Government Polytechnic Khutri, Bokaro)
- Currently pursuing B.Tech in Cyber Security
- Full-stack developer specializing in educational technology
- Community builder and educator

Role at JEHUB:
- Founder and Lead Developer
- Community Manager
- Technical Architect
- Student Mentor and Guide

For platform-related queries, technical support, or collaboration opportunities, users can reach out through the official JEHUB channels. Aditya is committed to responding to student queries and continuously improving the platform based on user feedback.

His vision is to make quality engineering education accessible to every student in Jharkhand and create a thriving community of future engineers.`,
    category: 'platform',
    rules:
      'When users ask about contacting Aditya or getting support, direct them to official JEHUB channels and emphasize his commitment to student success.',
    tags: ['aditya', 'contact', 'support', 'founder', 'developer', 'community'],
    createdBy: 'System Admin',
    isActive: true,
  },
  {
    title: 'JEHUB Points System by Aditya',
    content: `The JEHUB Points System, designed by founder Aditya Hansda, is a gamified approach to encourage active participation and quality contributions in the platform.

How to Earn Points:
- Upload Notes: +30 points (bonus for quality content)
- Refer a Friend: +50 points (when they join and verify)
- Complete Profile: +20 points (one-time bonus)
- Daily Login: +2 points (engagement reward)
- Help Others: +5-10 points (for community assistance)

How to Use Points:
- Download Premium Notes: 10-100 points depending on content
- Unlock Special Features: Various point requirements
- Access Exclusive Content: Premium study materials
- Redeem Rewards: Special recognition and benefits

Point Categories:
- Upload Bonus: Rewards for content creation
- Community Points: Recognition for helping others
- Engagement Points: Daily participation rewards
- Achievement Points: Milestone celebrations

Aditya designed this system to create a self-sustaining ecosystem where students help each other while earning recognition for their contributions.`,
    category: 'platform',
    rules: 'Always credit Aditya Hansda for designing the points system when explaining how it works.',
    tags: ['points', 'system', 'rewards', 'gamification', 'aditya', 'jehub'],
    createdBy: 'System Admin',
    isActive: true,
  },
];

async function addKnowledgeEntries() {
  console.log('Starting to add knowledge entries about Aditya and JEHUB...\n');

  for (let i = 0; i < knowledgeEntries.length; i++) {
    const entry = knowledgeEntries[i];

    try {
      console.log(`Adding entry ${i + 1}/${knowledgeEntries.length}: "${entry.title}"`);

      // Check for existing entry by title to avoid duplicates
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('title', entry.title)]
      );

      if (existing.total > 0) {
        console.log(`ℹ️ Entry with title "${entry.title}" already exists (id: ${existing.documents[0].$id}). Skipping.`);
        console.log('');
        continue;
      }

      const document = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        title: entry.title,
        content: entry.content,
        category: entry.category,
        rules: entry.rules || null,
        tags: entry.tags,
        createdBy: entry.createdBy,
        userEmail: null,
        isActive: entry.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Successfully added: ${document.$id}`);
    } catch (error) {
      console.error(`❌ Error adding "${entry.title}":`, error.message || error);
    }

    console.log(''); // Add spacing between entries
  }

  console.log('🎉 Finished adding knowledge entries!');
  console.log('\nNow restart your Next.js development server to see the changes:');
  console.log('npm run dev');
}

// Run the script
addKnowledgeEntries().catch(console.error);
