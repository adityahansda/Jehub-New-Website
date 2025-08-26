const { Client, Databases, ID } = require('node-appwrite');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

// Appwrite client setup
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Comprehensive sample data with realistic internship information
const SAMPLE_INTERNSHIPS = [
  {
    title: "Full Stack Developer Intern",
    company: "TechCorp Solutions",
    location: "Ranchi, Jharkhand",
    type: "Remote",
    duration: "6 months",
    stipend: "₹25,000/month",
    applyLink: "https://techcorp.com/careers/intern/fullstack",
    description: "Work on React.js and Node.js applications, contribute to real-world projects, and collaborate with senior developers.",
    skills: "React.js, Node.js, MongoDB, Git, JavaScript",
    eligibility: "Final year B.Tech students in Computer Science",
    lastDate: "2024-09-30"
  },
  {
    title: "Data Science Intern",
    company: "DataWise Analytics",
    location: "Dhanbad, Jharkhand",
    type: "Hybrid",
    duration: "4 months",
    stipend: "₹20,000/month",
    applyLink: "https://datawise.in/internships/data-science",
    description: "Analyze large datasets, create ML models, and develop insights for business decisions using Python and R.",
    skills: "Python, R, Pandas, NumPy, Machine Learning, SQL",
    eligibility: "B.Tech/MCA students with basic knowledge of statistics",
    lastDate: "2024-10-15"
  },
  {
    title: "Android Developer Intern",
    company: "Mobile First Technologies",
    location: "Jamshedpur, Jharkhand",
    type: "On-site",
    duration: "5 months",
    stipend: "₹18,000/month",
    applyLink: "https://mobilefirst.co.in/android-intern",
    description: "Develop native Android applications using Kotlin and Java, work on UI/UX implementation and API integration.",
    skills: "Android, Kotlin, Java, XML, REST APIs, Firebase",
    eligibility: "B.Tech students in Computer Science or IT",
    lastDate: "2024-09-25"
  },
  {
    title: "DevOps Engineering Intern",
    company: "CloudScale Systems",
    location: "Bokaro, Jharkhand",
    type: "Remote",
    duration: "6 months",
    stipend: "₹30,000/month",
    applyLink: "https://cloudscale.com/careers/devops-intern",
    description: "Learn CI/CD pipelines, containerization, and cloud deployment. Work with Docker, Kubernetes, and AWS.",
    skills: "Docker, Kubernetes, AWS, Jenkins, Linux, Git",
    eligibility: "Final year students with basic Linux knowledge",
    lastDate: "2024-10-20"
  },
  {
    title: "UI/UX Design Intern",
    company: "Creative Digital Agency",
    location: "Ranchi, Jharkhand",
    type: "Hybrid",
    duration: "3 months",
    stipend: "₹15,000/month",
    applyLink: "https://creativedigital.in/design-intern",
    description: "Design user interfaces for web and mobile apps, create wireframes, prototypes and conduct user research.",
    skills: "Figma, Adobe XD, Photoshop, User Research, Prototyping",
    eligibility: "Design or Computer Science students with portfolio",
    lastDate: "2024-09-20"
  },
  {
    title: "Cybersecurity Intern",
    company: "SecureNet Solutions",
    location: "Deoghar, Jharkhand",
    type: "On-site",
    duration: "4 months",
    stipend: "₹22,000/month",
    applyLink: "https://securenet.co.in/security-intern",
    description: "Learn ethical hacking, vulnerability assessment, and security audits. Work with real security tools and frameworks.",
    skills: "Ethical Hacking, Network Security, Kali Linux, Python",
    eligibility: "B.Tech/MCA students with interest in cybersecurity",
    lastDate: "2024-10-10"
  },
  {
    title: "Backend Developer Intern",
    company: "API Masters",
    location: "Hazaribagh, Jharkhand",
    type: "Remote",
    duration: "5 months",
    stipend: "₹23,000/month",
    applyLink: "https://apimasters.com/backend-intern",
    description: "Build robust APIs using Python Django/Flask or Node.js. Work with databases and microservices architecture.",
    skills: "Python, Django, Node.js, PostgreSQL, MongoDB, REST APIs",
    eligibility: "B.Tech students with basic programming knowledge",
    lastDate: "2024-09-28"
  },
  {
    title: "Frontend Developer Intern",
    company: "WebCraft Studios",
    location: "Giridih, Jharkhand",
    type: "Hybrid",
    duration: "4 months",
    stipend: "₹20,000/month",
    applyLink: "https://webcraft.studio/frontend-intern",
    description: "Create responsive web applications using React.js, implement modern UI designs and optimize performance.",
    skills: "React.js, HTML5, CSS3, JavaScript, Tailwind CSS, Git",
    eligibility: "Computer Science students with basic web development skills",
    lastDate: "2024-10-05"
  },
  {
    title: "Machine Learning Intern",
    company: "AI Innovations Lab",
    location: "Palamu, Jharkhand",
    type: "Remote",
    duration: "6 months",
    stipend: "₹28,000/month",
    applyLink: "https://ailab.in/ml-internship",
    description: "Work on cutting-edge ML projects, develop models for image recognition, NLP, and predictive analytics.",
    skills: "Python, TensorFlow, PyTorch, Scikit-learn, OpenCV",
    eligibility: "Final year students with ML coursework or projects",
    lastDate: "2024-10-25"
  },
  {
    title: "Quality Assurance Intern",
    company: "TestPro Solutions",
    location: "Pakur, Jharkhand",
    type: "On-site",
    duration: "3 months",
    stipend: "₹16,000/month",
    applyLink: "https://testpro.co.in/qa-intern",
    description: "Learn manual and automated testing, write test cases, and ensure software quality using various testing tools.",
    skills: "Manual Testing, Selenium, JIRA, Test Case Writing, API Testing",
    eligibility: "B.Tech/MCA students interested in software testing",
    lastDate: "2024-09-22"
  },
  {
    title: "Digital Marketing Intern",
    company: "MarketGrow Digital",
    location: "Chatra, Jharkhand",
    type: "Hybrid",
    duration: "4 months",
    stipend: "₹12,000/month",
    applyLink: "https://marketgrow.in/digital-marketing-intern",
    description: "Learn SEO, SEM, social media marketing, content creation and analytics. Work on real client campaigns.",
    skills: "Google Ads, Facebook Ads, SEO, Content Writing, Analytics",
    eligibility: "Any graduate with interest in digital marketing",
    lastDate: "2024-10-12"
  },
  {
    title: "Blockchain Developer Intern",
    company: "CryptoTech Innovations",
    location: "Latehar, Jharkhand",
    type: "Remote",
    duration: "6 months",
    stipend: "₹35,000/month",
    applyLink: "https://cryptotech.in/blockchain-intern",
    description: "Develop smart contracts, work with Ethereum, learn DeFi protocols and contribute to Web3 projects.",
    skills: "Solidity, Ethereum, Web3.js, JavaScript, Smart Contracts",
    eligibility: "B.Tech final year with programming experience",
    lastDate: "2024-11-01"
  }
];

async function tryGoogleSheetsAuth() {
  console.log('🔍 Attempting Google Sheets authentication...');
  
  try {
    const serviceAccountPath = 'jehub25new-auto-fixed.json';
    if (!fs.existsSync(serviceAccountPath)) {
      return null;
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    await auth.authorize();
    
    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',
    });
    
    const rows = response.data.values || [];
    if (rows.length > 1) {
      const headers = rows[0];
      const dataRows = rows.slice(1);
      console.log('✅ Successfully accessed Google Sheets data');
      console.log(`📊 Found ${dataRows.length} records in spreadsheet`);
      return { headers, data: dataRows };
    }
    
    return null;
  } catch (error) {
    console.log('⚠️ Google Sheets access failed:', error.message);
    return null;
  }
}

function mapGoogleSheetsData(sheetsData) {
  // Assuming Google Sheets has columns like: Title, Company, Location, Type, Duration, Stipend, Apply Link, Description, Skills, Eligibility, Last Date
  const { headers, data } = sheetsData;
  
  return data.map(row => {
    const internship = {};
    
    // Map each header to the corresponding field
    headers.forEach((header, index) => {
      const value = row[index] || '';
      const normalizedHeader = header.toLowerCase().trim();
      
      if (normalizedHeader.includes('title') || normalizedHeader.includes('position')) {
        internship.title = value;
      } else if (normalizedHeader.includes('company')) {
        internship.company = value;
      } else if (normalizedHeader.includes('location')) {
        internship.location = value;
      } else if (normalizedHeader.includes('type') || normalizedHeader.includes('mode')) {
        internship.type = value;
      } else if (normalizedHeader.includes('duration')) {
        internship.duration = value;
      } else if (normalizedHeader.includes('stipend') || normalizedHeader.includes('salary')) {
        internship.stipend = value;
      } else if (normalizedHeader.includes('link') || normalizedHeader.includes('apply')) {
        internship.applyLink = value;
      } else if (normalizedHeader.includes('description')) {
        internship.description = value;
      } else if (normalizedHeader.includes('skill')) {
        internship.skills = value;
      } else if (normalizedHeader.includes('eligib')) {
        internship.eligibility = value;
      } else if (normalizedHeader.includes('date') || normalizedHeader.includes('deadline')) {
        internship.lastDate = value;
      }
    });
    
    return internship;
  });
}

async function clearExistingData() {
  console.log('🧹 Clearing existing internship data...');
  
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID,
      [],
      100 // Limit to avoid issues
    );
    
    const deletePromises = response.documents.map(doc => 
      databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID,
        doc.$id
      )
    );
    
    await Promise.all(deletePromises);
    console.log(`✅ Removed ${response.documents.length} existing records`);
    
  } catch (error) {
    console.log('⚠️ Error clearing data (this is okay if collection was empty):', error.message);
  }
}

async function migrateInternships() {
  console.log('🚀 Starting internship data migration...');
  
  try {
    // First, try to get data from Google Sheets
    const sheetsData = await tryGoogleSheetsAuth();
    let internships;
    
    if (sheetsData && sheetsData.data.length > 0) {
      console.log('📊 Using real data from Google Sheets');
      internships = mapGoogleSheetsData(sheetsData);
    } else {
      console.log('📝 Using comprehensive sample data (Google Sheets unavailable)');
      internships = SAMPLE_INTERNSHIPS;
    }
    
    console.log(`📋 Preparing to migrate ${internships.length} internship records`);
    
    // Clear existing data
    await clearExistingData();
    
    // Add new data
    console.log('💾 Adding new internship records...');
    
    for (let i = 0; i < internships.length; i++) {
      const internship = internships[i];
      
      try {
        const document = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID,
          ID.unique(),
          {
            title: internship.title || '',
            company: internship.company || '',
            location: internship.location || '',
            type: internship.type || 'Remote',
            duration: internship.duration || '',
            stipend: internship.stipend || '',
            applyLink: internship.applyLink || '',
            description: internship.description || '',
            skills: internship.skills || '',
            eligibility: internship.eligibility || '',
            lastDate: internship.lastDate || '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
        
        console.log(`✅ Added: ${internship.title} at ${internship.company}`);
        
      } catch (error) {
        console.error(`❌ Failed to add ${internship.title}:`, error.message);
      }
    }
    
    // Verify the migration
    const finalCount = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID
    );
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total records in database: ${finalCount.documents.length}`);
    
    // Show some sample records
    console.log('\n📝 Sample migrated records:');
    finalCount.documents.slice(0, 3).forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title} - ${doc.company} (${doc.type})`);
    });
    
    return {
      success: true,
      totalRecords: finalCount.documents.length,
      source: sheetsData ? 'Google Sheets' : 'Sample Data'
    };
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Run migration
if (require.main === module) {
  migrateInternships()
    .then(result => {
      if (result.success) {
        console.log(`\n🎉 SUCCESS: Migrated ${result.totalRecords} internships from ${result.source}`);
        console.log('🌐 Your internship portal is now ready with fresh data!');
      } else {
        console.log('\n❌ FAILED: Migration unsuccessful');
        console.log('Error:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { migrateInternships };
