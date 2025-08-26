const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client();
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const apiKey = process.env.APPWRITE_API_KEY;
const internshipsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';

if (!apiKey) {
  console.error('APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

// Sample internship records for testing
const sampleRecords = [
  {
    internId: 'IN-WD-001',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1ABC123/view',
    verifiedAt: new Date().toISOString(),
    name: 'John Doe',
    role: 'Web Development Intern',
    email: 'john.doe@example.com',
    joiningType: 'Remote',
    duration: '3 months',
    startingDate: '2024-01-15',
    endDate: '2024-04-15',
    issueDate: '2024-04-20',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1DEF456',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1DEF456/view',
    linkToMergedDocOfferLetter: 'Offer Letter for John Doe',
    documentMergeStatusOfferLetter: 'Document successfully merged',
    mergedDocIdNda: '1GHI789',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1GHI789/view',
    linkToMergedDocNda: 'NDA for John Doe',
    documentMergeStatusNda: 'Document successfully merged',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-002',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1JKL012/view',
    verifiedAt: new Date().toISOString(),
    name: 'Jane Smith',
    role: 'UI/UX Design Intern',
    email: 'jane.smith@example.com',
    joiningType: 'Hybrid',
    duration: '6 months',
    startingDate: '2024-02-01',
    endDate: '2024-08-01',
    issueDate: '2024-08-05',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1MNO345',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1MNO345/view',
    linkToMergedDocOfferLetter: 'Offer Letter for Jane Smith',
    documentMergeStatusOfferLetter: 'Document successfully merged',
    mergedDocIdNda: '1PQR678',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1PQR678/view',
    linkToMergedDocNda: 'NDA for Jane Smith',
    documentMergeStatusNda: 'Document successfully merged',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-003',
    verification: false,
    certificateUrl: '',
    verifiedAt: '',
    name: 'Mike Johnson',
    role: 'Full Stack Development Intern',
    email: 'mike.johnson@example.com',
    joiningType: 'Remote',
    duration: '4 months',
    startingDate: '2024-03-01',
    endDate: '2024-07-01',
    issueDate: '',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1STU901',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1STU901/view',
    linkToMergedDocOfferLetter: 'Offer Letter for Mike Johnson',
    documentMergeStatusOfferLetter: 'Document successfully merged',
    mergedDocIdNda: '1VWX234',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1VWX234/view',
    linkToMergedDocNda: 'NDA for Mike Johnson',
    documentMergeStatusNda: 'Document successfully merged',
    lastUpdated: new Date().toISOString()
  }
];

async function addSampleData() {
  console.log('🚀 Adding sample internship data to Appwrite...');
  console.log(`Database ID: ${databaseId}`);
  console.log(`Collection ID: ${internshipsCollectionId}`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const record of sampleRecords) {
    try {
      console.log(`Adding record: ${record.internId} (${record.name})`);
      
      await databases.createDocument(
        databaseId,
        internshipsCollectionId,
        'unique()',
        record
      );
      
      success++;
      console.log(`✅ Added ${record.internId}`);
      
    } catch (error) {
      failed++;
      errors.push({
        internId: record.internId,
        error: error.message
      });
      console.log(`❌ Failed to add ${record.internId}: ${error.message}`);
    }
  }

  console.log('\n📊 Sample Data Addition Summary');
  console.log('===============================');
  console.log(`✅ Successfully added: ${success} records`);
  console.log(`❌ Failed to add: ${failed} records`);

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(error => {
      console.log(`- ${error.internId}: ${error.error}`);
    });
  }

  // Verify the data was added
  try {
    console.log('\n🔍 Verifying data was added...');
    const response = await databases.listDocuments(
      databaseId,
      internshipsCollectionId
    );
    console.log(`📊 Total records in Appwrite: ${response.total}`);
    
    if (response.documents.length > 0) {
      console.log('\n📋 Sample records:');
      response.documents.slice(0, 3).forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.internId} - ${doc.name} (${doc.verification ? 'Verified' : 'Unverified'})`);
      });
    }
  } catch (error) {
    console.log('❌ Could not verify data:', error.message);
  }

  console.log('\n✅ Sample data setup completed!');
  console.log('You can now test the certificate pages with these intern IDs:');
  sampleRecords.forEach(record => {
    console.log(`- ${record.internId} (${record.name})`);
  });
}

addSampleData()
  .then(() => {
    console.log('\n🎉 Sample data addition completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Sample data addition failed:', error);
    process.exit(1);
  });
