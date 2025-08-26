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

// Realistic internship records based on typical patterns
const realisticRecords = [
  {
    internId: 'IN-WD-001',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1ABC123DEF456GHI789/view',
    verifiedAt: '2024-04-20T10:30:00Z',
    name: 'Rahul Kumar',
    role: 'Web Development Intern',
    email: 'rahul.kumar@gmail.com',
    joiningType: 'Remote',
    duration: '3 months',
    startingDate: '2024-01-15',
    endDate: '2024-04-15',
    issueDate: '2024-04-20',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1DEF456GHI789JKL012',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1DEF456GHI789JKL012/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Rahul Kumar - Web Development Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-01-10',
    mergedDocIdNda: '1GHI789JKL012MNO345',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1GHI789JKL012MNO345/view',
    linkToMergedDocNda: 'NDA Agreement - Rahul Kumar',
    documentMergeStatusNda: 'Document successfully merged on 2024-01-10',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-002',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1JKL012MNO345PQR678/view',
    verifiedAt: '2024-08-05T14:20:00Z',
    name: 'Priya Sharma',
    role: 'UI/UX Design Intern',
    email: 'priya.sharma@yahoo.com',
    joiningType: 'Hybrid',
    duration: '6 months',
    startingDate: '2024-02-01',
    endDate: '2024-08-01',
    issueDate: '2024-08-05',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1MNO345PQR678STU901',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1MNO345PQR678STU901/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Priya Sharma - UI/UX Design Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-01-25',
    mergedDocIdNda: '1PQR678STU901VWX234',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1PQR678STU901VWX234/view',
    linkToMergedDocNda: 'NDA Agreement - Priya Sharma',
    documentMergeStatusNda: 'Document successfully merged on 2024-01-25',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-003',
    verification: false,
    certificateUrl: '',
    verifiedAt: '',
    name: 'Amit Singh',
    role: 'Full Stack Development Intern',
    email: 'amit.singh@outlook.com',
    joiningType: 'Remote',
    duration: '4 months',
    startingDate: '2024-03-01',
    endDate: '2024-07-01',
    issueDate: '',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1STU901VWX234YZA567',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1STU901VWX234YZA567/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Amit Singh - Full Stack Development Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-02-20',
    mergedDocIdNda: '1VWX234YZA567BCD890',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1VWX234YZA567BCD890/view',
    linkToMergedDocNda: 'NDA Agreement - Amit Singh',
    documentMergeStatusNda: 'Document successfully merged on 2024-02-20',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-004',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1EFG123HIJ456KLM789/view',
    verifiedAt: '2024-06-15T16:45:00Z',
    name: 'Sneha Patel',
    role: 'Data Science Intern',
    email: 'sneha.patel@gmail.com',
    joiningType: 'On-site',
    duration: '3 months',
    startingDate: '2024-03-15',
    endDate: '2024-06-15',
    issueDate: '2024-06-20',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1BCD890EFG123HIJ456',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1BCD890EFG123HIJ456/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Sneha Patel - Data Science Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-03-01',
    mergedDocIdNda: '1EFG123HIJ456KLM789',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1EFG123HIJ456KLM789/view',
    linkToMergedDocNda: 'NDA Agreement - Sneha Patel',
    documentMergeStatusNda: 'Document successfully merged on 2024-03-01',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-005',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1NOP012QRS345TUV678/view',
    verifiedAt: '2024-05-30T11:15:00Z',
    name: 'Arjun Reddy',
    role: 'Mobile App Development Intern',
    email: 'arjun.reddy@gmail.com',
    joiningType: 'Remote',
    duration: '2 months',
    startingDate: '2024-04-01',
    endDate: '2024-06-01',
    issueDate: '2024-06-05',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1HIJ456KLM789NOP012',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1HIJ456KLM789NOP012/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Arjun Reddy - Mobile App Development Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-03-25',
    mergedDocIdNda: '1KLM789NOP012QRS345',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1KLM789NOP012QRS345/view',
    linkToMergedDocNda: 'NDA Agreement - Arjun Reddy',
    documentMergeStatusNda: 'Document successfully merged on 2024-03-25',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-006',
    verification: false,
    certificateUrl: '',
    verifiedAt: '',
    name: 'Kavya Joshi',
    role: 'Digital Marketing Intern',
    email: 'kavya.joshi@hotmail.com',
    joiningType: 'Hybrid',
    duration: '5 months',
    startingDate: '2024-04-15',
    endDate: '2024-09-15',
    issueDate: '',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1QRS345TUV678WXY901',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1QRS345TUV678WXY901/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Kavya Joshi - Digital Marketing Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-04-05',
    mergedDocIdNda: '1TUV678WXY901ZAB234',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1TUV678WXY901ZAB234/view',
    linkToMergedDocNda: 'NDA Agreement - Kavya Joshi',
    documentMergeStatusNda: 'Document successfully merged on 2024-04-05',
    lastUpdated: new Date().toISOString()
  },
  {
    internId: 'IN-WD-007',
    verification: true,
    certificateUrl: 'https://drive.google.com/file/d/1CDE567FGH890IJK123/view',
    verifiedAt: '2024-07-20T09:30:00Z',
    name: 'Rohan Gupta',
    role: 'DevOps Intern',
    email: 'rohan.gupta@gmail.com',
    joiningType: 'Remote',
    duration: '4 months',
    startingDate: '2024-04-01',
    endDate: '2024-08-01',
    issueDate: '2024-08-05',
    filterRowsToMerge: '',
    mergedDocIdOfferLetter: '1WXY901ZAB234CDE567',
    mergedDocUrlOfferLetter: 'https://drive.google.com/file/d/1WXY901ZAB234CDE567/view',
    linkToMergedDocOfferLetter: 'Offer Letter - Rohan Gupta - DevOps Intern',
    documentMergeStatusOfferLetter: 'Document successfully merged on 2024-03-20',
    mergedDocIdNda: '1ZAB234CDE567FGH890',
    mergedDocUrlNda: 'https://drive.google.com/file/d/1ZAB234CDE567FGH890/view',
    linkToMergedDocNda: 'NDA Agreement - Rohan Gupta',
    documentMergeStatusNda: 'Document successfully merged on 2024-03-20',
    lastUpdated: new Date().toISOString()
  }
];

async function addRealisticSampleData() {
  console.log('🚀 Adding realistic internship data to Appwrite...');
  console.log(`Database ID: ${databaseId}`);
  console.log(`Collection ID: ${internshipsCollectionId}`);
  console.log(`Total records to add: ${realisticRecords.length}`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const record of realisticRecords) {
    try {
      console.log(`Adding record: ${record.internId} - ${record.name} (${record.role})`);
      
      await databases.createDocument(
        databaseId,
        internshipsCollectionId,
        'unique()',
        record
      );
      
      success++;
      console.log(`✅ Added ${record.internId} - ${record.name}`);
      
    } catch (error) {
      failed++;
      errors.push({
        internId: record.internId,
        name: record.name,
        error: error.message
      });
      console.log(`❌ Failed to add ${record.internId} - ${record.name}: ${error.message}`);
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Realistic Sample Data Addition Summary');
  console.log('==========================================');
  console.log(`✅ Successfully added: ${success} records`);
  console.log(`❌ Failed to add: ${failed} records`);

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(error => {
      console.log(`- ${error.internId} (${error.name}): ${error.error}`);
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
      console.log('\n📋 Added records summary:');
      response.documents.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.internId} - ${doc.name} (${doc.role}) - ${doc.verification ? 'Verified' : 'Unverified'}`);
      });
    }
  } catch (error) {
    console.log('❌ Could not verify data:', error.message);
  }

  console.log('\n✅ Realistic sample data setup completed!');
  console.log('\n📝 Test these intern IDs on the certificate pages:');
  realisticRecords.forEach(record => {
    const status = record.verification ? '✅ Verified' : '⏳ Pending';
    console.log(`- ${record.internId} (${record.name}) - ${status}`);
  });
}

addRealisticSampleData()
  .then(() => {
    console.log('\n🎉 Realistic sample data addition completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Realistic sample data addition failed:', error);
    process.exit(1);
  });
