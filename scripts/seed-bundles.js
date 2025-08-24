/**
 * Script to seed Study Bundles collection with sample data
 */

const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = 'study_bundles';

// Sample bundle data based on the demo data from the codebase
const sampleBundles = [
  {
    title: 'Complete Data Structures & Algorithms',
    description: 'Master the fundamentals of computer science with this comprehensive collection covering arrays, linked lists, trees, graphs, sorting algorithms, and dynamic programming.',
    category: 'Computer Science',
    level: 'Intermediate',
    duration: '10 weeks',
    instructor: 'Prof. Aditya Kumar',
    tags: ['Data Structures', 'Algorithms', 'Programming', 'Computer Science'],
    price: 0,
    access: 'free',
    notesCount: 15,
    videosCount: 8,
    totalDownloads: 3247,
    rating: 4.8,
    reviews: 234,
    views: 5420,
    status: 'published',
    isPopular: true,
    notes: JSON.stringify([
      { title: 'Array Operations & Complexity', type: 'pdf', size: '2.3 MB', description: 'Complete guide to array operations and time complexity analysis' },
      { title: 'Linked Lists Implementation', type: 'pdf', size: '1.8 MB', description: 'Singly, doubly and circular linked lists with examples' },
      { title: 'Stack & Queue Data Structures', type: 'pdf', size: '2.1 MB', description: 'Implementation and applications of stacks and queues' },
      { title: 'Binary Trees & Traversal', type: 'pdf', size: '3.2 MB', description: 'Tree structures, traversal algorithms, and tree operations' },
      { title: 'Graph Algorithms', type: 'pdf', size: '4.1 MB', description: 'Graph representation, BFS, DFS, shortest path algorithms' }
    ]),
    createdBy: 'admin'
  },
  {
    title: 'Digital Electronics Mastery Bundle',
    description: 'Comprehensive study material for digital electronics including logic gates, combinational circuits, sequential circuits, and microprocessors.',
    category: 'Electronics',
    level: 'Beginner',
    duration: '6 weeks',
    instructor: 'Dr. Priya Sharma',
    tags: ['Digital Electronics', 'Logic Gates', 'Circuits', 'Microprocessors'],
    price: 199,
    originalPrice: 299,
    discount: 33,
    access: 'purchase',
    notesCount: 8,
    videosCount: 5,
    totalDownloads: 1834,
    totalSales: 67,
    revenue: 13333,
    rating: 4.6,
    reviews: 89,
    views: 2156,
    status: 'published',
    isPopular: false,
    notes: JSON.stringify([
      { title: 'Logic Gates & Boolean Algebra', type: 'pdf', size: '2.5 MB', description: 'Fundamental logic gates and boolean operations' },
      { title: 'Combinational Circuit Design', type: 'pdf', size: '3.1 MB', description: 'Design principles for combinational logic circuits' },
      { title: 'Sequential Circuits & Flip-Flops', type: 'pdf', size: '2.8 MB', description: 'Memory elements and sequential circuit analysis' },
      { title: 'Counters & Registers', type: 'pdf', size: '2.2 MB', description: 'Design and analysis of digital counters and registers' }
    ]),
    createdBy: 'admin'
  },
  {
    title: 'Mechanical Engineering Fundamentals',
    description: 'Learn construction management, structural analysis, and building materials for modern civil engineering projects.',
    category: 'Mechanical',
    level: 'Beginner',
    duration: '8 weeks',
    instructor: 'Prof. Rajesh Singh',
    tags: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials'],
    price: 0,
    access: 'free',
    notesCount: 15,
    videosCount: 12,
    totalDownloads: 2134,
    rating: 4.7,
    reviews: 156,
    views: 3245,
    status: 'published',
    isPopular: true,
    notes: JSON.stringify([
      { title: 'Thermodynamics Laws & Cycles', type: 'pdf', size: '3.5 MB', description: 'Complete thermodynamics theory and applications' },
      { title: 'Fluid Mechanics Basics', type: 'pdf', size: '2.8 MB', description: 'Fluid properties and flow analysis' },
      { title: 'Strength of Materials', type: 'pdf', size: '4.1 MB', description: 'Stress, strain and material properties' },
      { title: 'Heat Transfer Fundamentals', type: 'pdf', size: '3.2 MB', description: 'Conduction, convection, and radiation heat transfer' },
      { title: 'Machine Design Principles', type: 'pdf', size: '4.5 MB', description: 'Design of mechanical components and systems' }
    ]),
    createdBy: 'admin'
  },
  {
    title: 'Civil Engineering Construction Bundle',
    description: 'Learn construction management, structural analysis, and building materials for modern civil engineering projects.',
    category: 'Civil',
    level: 'Advanced',
    duration: '5 weeks',
    instructor: 'Eng. Kavitha Reddy',
    tags: ['Construction', 'Structural Analysis', 'Building Materials'],
    price: 249,
    originalPrice: 449,
    discount: 44,
    access: 'premium',
    notesCount: 10,
    videosCount: 7,
    totalDownloads: 643,
    rating: 4.5,
    reviews: 42,
    views: 1234,
    status: 'published',
    isPopular: false,
    notes: JSON.stringify([
      { title: 'Construction Management Principles', type: 'pdf', size: '2.6 MB', description: 'Project planning and construction management' },
      { title: 'Structural Analysis Methods', type: 'pdf', size: '3.3 MB', description: 'Analyzing structural loads and responses' },
      { title: 'Modern Building Materials', type: 'pdf', size: '2.1 MB', description: 'Contemporary construction materials and properties' }
    ]),
    createdBy: 'admin'
  }
];

async function seedBundles() {
  try {
    console.log('🌱 Seeding Study Bundles collection...');
    
    for (let i = 0; i < sampleBundles.length; i++) {
      const bundleData = sampleBundles[i];
      
      try {
        const bundle = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          bundleData
        );
        
        console.log(`✅ Created bundle: ${bundle.title}`);
        
        // Wait between creations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error creating bundle "${bundleData.title}":`, error.message);
      }
    }
    
    console.log('🌱 Bundle seeding complete!');
    
  } catch (error) {
    console.error('❌ Error seeding bundles:', error);
    throw error;
  }
}

async function clearBundles() {
  try {
    console.log('🗑️ Clearing existing bundles...');
    
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    
    for (const bundle of response.documents) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, bundle.$id);
        console.log(`🗑️ Deleted bundle: ${bundle.title}`);
      } catch (error) {
        console.error(`❌ Error deleting bundle "${bundle.title}":`, error.message);
      }
    }
    
    console.log('🗑️ Bundles cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing bundles:', error);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'clear') {
    await clearBundles();
  } else if (command === 'seed') {
    await seedBundles();
  } else if (command === 'reset') {
    await clearBundles();
    await seedBundles();
  } else {
    console.log('Usage: node seed-bundles.js [command]');
    console.log('Commands:');
    console.log('  seed  - Add sample bundles to the collection');
    console.log('  clear - Remove all existing bundles');
    console.log('  reset - Clear existing bundles and add sample data');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  seedBundles,
  clearBundles,
  sampleBundles
};
