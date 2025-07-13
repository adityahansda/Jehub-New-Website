import React, { useState } from 'react';
import { Upload, FileText, Star, CheckCircle } from 'lucide-react';
// import { db } from '../lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToGitHub, validateFile } from '../lib/github';
import LoadingSpinner from '../components/LoadingSpinner';
import { databases } from '../lib/appwrite';
import { ID } from 'appwrite';

const NotesUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    branch: '',
    semester: '',
    subject: '',
    description: '',
    tags: '',
    authorName: '',
    file: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [githubUrl, setGithubUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateFile(file);
        setFormData({ ...formData, file });
        setError('');
      } catch (err: any) {
        setError(err.message);
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    let progressIntervalId: NodeJS.Timeout | null = null;
    try {
      setIsSubmitting(true);
      setError('');

      // Simulate upload progress
      let progress = 0;
      setUploadProgress(progress);

      progressIntervalId = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
          if (progressIntervalId) clearInterval(progressIntervalId);
        }
        setUploadProgress(progress);
      }, 200);

      // Upload file to GitHub
      const fileExtension = formData.file.name.split('.').pop();
      const sanitizedTitle = formData.title.replace(/\s+/g, '_');
      const githubPath = `notes/${formData.branch}/${formData.semester}/${sanitizedTitle}.${fileExtension}`;
      const newGithubUrl = await uploadToGitHub(formData.file, githubPath);

      if (progressIntervalId) clearInterval(progressIntervalId);
      setUploadProgress(100);

      // Fetch user's IP address
      const ipResponse = await fetch('/api/ip');
      const { ip } = await ipResponse.json();

      // Store metadata in Appwrite
      const notesData = {
        title: formData.title,
        branch: formData.branch,
        semester: formData.semester,
        subject: formData.subject,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        authorName: formData.authorName,
        uploadDate: new Date().toISOString(),
        githubUrl: newGithubUrl,
        fileName: formData.file.name,
        userIp: ip,
        downloads: 0,
        likes: 0
      };

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        ID.unique(),
        notesData
      );

      // Reset form
      setFormData({
        title: '',
        branch: '',
        semester: '',
        subject: '',
        description: '',
        tags: '',
        authorName: '',
        file: null
      });

      setIsSubmitted(true);
      setGithubUrl(newGithubUrl); // Store the GitHub URL
    } catch (err: any) {
      if (progressIntervalId) clearInterval(progressIntervalId);
      setError(err.message || 'Failed to upload notes. Please try again.');
      setUploadFailed(true);
      console.error('Upload error:', err);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const branches = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Upload Your Notes
          </h1>
          <p className="text-xl text-gray-600">
            Share your knowledge with the community and earn points
          </p>
        </div>

        {/* Failure Message */}
        {uploadFailed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <p className="text-red-800 font-bold">Upload Failed!</p>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={() => {
                setUploadFailed(false);
                setError('');
              }}
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && !uploadFailed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {isSubmitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">
              Notes uploaded successfully! Thank you for contributing to the community.
            </p>
          </div>
        )}

        {/* Success Popup */}
        {isSubmitted && githubUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 mb-4">Your notes have been uploaded to GitHub.</p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {githubUrl}
                </a>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setGithubUrl('');
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a descriptive title for your notes"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                      Branch *
                    </label>
                    <select
                      id="branch"
                      required
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                      Semester *
                    </label>
                    <select
                      id="semester"
                      required
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((semester) => (
                        <option key={semester} value={semester}>
                          {semester}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Data Structures, Calculus, Physics"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what your notes cover, key topics, and any special features"
                  />
                </div>

                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name or nickname"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., algorithms, programming, exam-prep (comma separated)"
                  />
                </div>

                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="file"
                      required
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="file" className={`cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}>
                      {isSubmitting ? (
                        <LoadingSpinner size="large" className="mb-4" />
                      ) : (
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      )}
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {formData.file ? formData.file.name : 'Click to upload your notes'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Support: PDF, DOC, DOCX, PPT, PPTX, TXT (Max 100MB)
                      </p>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.file}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${(isSubmitting || !formData.file) ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" color="text-white" className="mr-2" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload Notes & Earn Points'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Upload Progress */}
          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">Uploading to GitHub</span>
                <span className="text-blue-800">{uploadProgress}%</span>
              </div>
              {/* Progress Bar */}
              {isSubmitting && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-600">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Points Information */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6">
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Earn Points</h3>
                <p className="text-blue-100 mb-4">
                  Upload quality notes and earn points that boost your ranking on the leaderboard
                </p>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold">50 Points</p>
                  <p className="text-sm text-blue-100">per upload</p>
                </div>
              </div>
            </div>

            {/* Upload Guidelines */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Upload Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Ensure notes are original and high quality
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Include clear titles and descriptions
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Use appropriate tags for better discovery
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Files should be readable and well-organized
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  No copyrighted material without permission
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  No inappropriate or spam content
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesUpload;