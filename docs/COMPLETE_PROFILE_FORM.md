# Enhanced Complete Profile Form

This document describes the enhanced complete profile form with comprehensive student data collection and profile photo upload functionality.

## Features

### 1. Profile Photo Upload
- **Image Upload**: Users can upload a profile photo by clicking the camera button
- **File Validation**: Supports common image formats (JPEG, PNG, GIF, WebP)
- **Size Limit**: Maximum file size of 5MB
- **Preview**: Live preview of uploaded image
- **Remove Option**: Users can remove uploaded photos

### 2. Comprehensive Form Fields

#### Basic Information
- **Full Name** (Required)
- **Email Address** (Required) - Pre-filled from OAuth
- **Phone Number** (Required) - With validation for Indian mobile numbers
- **Alternate Phone** (Optional)
- **Date of Birth** (Optional) - Age validation (minimum 13 years)
- **Gender** (Optional) - Multiple options including "Prefer not to say"

#### Academic Information
- **College/University** (Optional)
- **College Email** (Optional) - Separate from personal email
- **Branch/Stream** (Optional) - Comprehensive list of engineering and other branches
- **Academic Year** (Optional) - From 1st Year to PhD
- **Current Semester** (Optional) - 1st to 8th semester
- **Enrollment Number** (Optional)
- **Current GPA** (Optional)

#### Address Information
- **Current Address** (Optional) - Full address text area
- **City** (Optional)
- **State** (Optional) - Dropdown with all Indian states and UTs
- **Country** (Default: India)
- **Pincode** (Optional)

#### Personal Information
- **About You** (Optional) - Bio/description text area
- **Interests & Hobbies** (Optional)
- **Skills** (Optional) - Technical and other skills
- **Languages Known** (Optional)

#### Social Links (Optional)
- **LinkedIn Profile**
- **GitHub Profile**
- **Portfolio/Website**

### 3. Enhanced Validation

#### Client-side Validation
- **Required Fields**: Full name, email, phone number
- **Email Format**: Standard email validation
- **Phone Format**: Indian mobile number validation (10 digits starting with 6-9)
- **Age Validation**: Minimum 13 years for date of birth
- **URL Validation**: For social media links

#### Server-side Validation
- Additional validation before database storage
- Sanitization of user inputs
- Duplicate email/phone prevention

### 4. Database Schema

The form data is designed to be stored in a comprehensive student profiles collection with the following attributes:

```javascript
// Basic Information
userId: string (required) - Links to auth user
fullName: string (required)
email: string (required)
phone: string (required)
alternatePhone: string (optional)
dateOfBirth: datetime (optional)
gender: string (optional)

// Academic Information
college: string (optional)
collegeEmail: string (optional)
branch: string (optional)
semester: string (optional)
year: string (optional)
enrollmentNumber: string (optional)
currentGPA: string (optional)

// Personal Information
bio: string (optional)
interests: string (optional)
skills: string (optional)
languages: string (optional)

// Address Information
currentAddress: string (optional)
permanentAddress: string (optional)
city: string (optional)
state: string (optional)
country: string (optional)
pincode: string (optional)

// Social Links
linkedinUrl: string (optional)
githubUrl: string (optional)
portfolioUrl: string (optional)

// Profile Management
profileImageUrl: string (optional)
isProfileComplete: boolean (required)
profileCompletedAt: datetime (optional)
lastUpdated: datetime (optional)

// Preferences
preferredLanguage: string (optional)
notificationPreferences: string (optional) // JSON

// Additional Fields
admissionYear: string (optional)
graduationYear: string (optional)
courseType: string (optional)
specialization: string (optional)
visibility: string (optional)
contactPreference: string (optional)
lastLoginAt: datetime (optional)
accountStatus: string (optional)
emailVerified: boolean (optional)
phoneVerified: boolean (optional)
```

### 5. Database Setup

**Using Existing Users Collection:**

Since you already have a users collection (`6873f4f10034ced70a40`), we've enhanced it with additional profile attributes. To add the missing attributes to your existing collection, run:

```bash
node scripts/add-missing-profile-attributes.js
```

This script will:
- Add 25+ new profile attributes to your existing collection
- Create indexes for optimal query performance
- Preserve all existing user data
- Extend functionality without breaking existing features

**Existing Collection Structure:**
Your collection already has these core fields:
- Basic user data: `userId`, `name`, `email`, `avatar`
- Academic info: `college`, `branch`, `semester`, `bio`
- Gamification: `totalPoints`, `rank`, `level`, `notesUploaded`
- Activity tracking: `lastLoginDate`, `dailyLoginStreak`

**New Added Fields:**
- Contact: `phone`, `alternatePhone`
- Personal: `dateOfBirth`, `gender`, `interests`, `skills`
- Academic: `collegeEmail`, `year`, `enrollmentNumber`, `currentGPA`
- Address: `currentAddress`, `city`, `state`, `country`, `pincode`
- Social: `linkedinUrl`, `githubUrl`, `portfolioUrl`
- Profile: `profileImageUrl`, `isProfileComplete`, `profileCompletedAt`

### 6. Integration Points

#### Form Submission
```javascript
// Check if user already exists
const existingUserResponse = await databases.listDocuments(
  DATABASE_ID,
  collections.users,
  [Query.equal('email', user.email)]
);

const profileData = {
  userId: user.$id,
  name: formData.fullName,
  email: formData.email,
  updatedAt: new Date().toISOString(),
  college: formData.college,
  branch: formData.branch,
  semester: formData.semester,
  bio: formData.bio,
  phone: formData.phone,
  // ... all other fields
  isProfileComplete: true,
  profileCompletedAt: new Date().toISOString()
};

if (existingUserResponse.documents.length > 0) {
  // Update existing user
  await databases.updateDocument(
    DATABASE_ID,
    collections.users,
    existingUserResponse.documents[0].$id,
    profileData
  );
} else {
  // Create new user with default values
  await databases.createDocument(
    DATABASE_ID,
    collections.users,
    ID.unique(),
    {
      ...profileData,
      createdAt: new Date().toISOString(),
      joinDate: new Date().toISOString(),
      totalPoints: 0,
      rank: 0,
      role: 'student',
      level: 'beginner'
    }
  );
}
```

#### Image Upload Integration
The form includes hooks for integrating with Appwrite Storage or other file storage services:

```javascript
// Example integration with Appwrite Storage
const uploadProfileImage = async (file) => {
  const result = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file
  );
  return storage.getFileView(BUCKET_ID, result.$id);
};
```

### 7. Security Considerations

- **Input Sanitization**: All user inputs are validated and sanitized
- **File Upload Security**: Image files are validated for type and size
- **Privacy Settings**: Users can control visibility of their profile data
- **Data Encryption**: Sensitive data should be encrypted at rest
- **Access Control**: Proper permission settings on the database collection

### 8. User Experience Features

- **Auto-save**: Form data can be saved as draft
- **Progress Indicator**: Shows completion percentage
- **Smart Defaults**: Pre-fills data from OAuth providers
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper labels and keyboard navigation
- **Error Handling**: Clear error messages and validation feedback

### 9. Usage Instructions

1. **For Users**:
   - Fill required fields (marked with *)
   - Upload a profile photo (optional but recommended)
   - Complete as many sections as desired
   - Save or skip for later completion

2. **For Developers**:
   - Run the database setup script first
   - Update environment variables with collection ID
   - Integrate with your authentication system
   - Customize validation rules as needed
   - Implement file storage for profile images

### 10. Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_APPWRITE_STUDENT_PROFILES_COLLECTION_ID=student_profiles
APPWRITE_API_KEY=your_appwrite_api_key
```

### 11. Benefits

- **Comprehensive Data Collection**: Captures all relevant student information
- **Enhanced User Profiles**: Rich profiles for better connections
- **Search & Filtering**: Extensive data enables powerful search features
- **Analytics**: Better insights into user demographics
- **Personalization**: Improved content recommendations
- **Professional Networking**: Social links enable career networking

This enhanced form provides a solid foundation for building a comprehensive student community platform with rich user profiles and advanced features.
