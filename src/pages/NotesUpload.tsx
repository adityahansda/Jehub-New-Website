import React, { useState, useEffect } from 'react';
import { Upload, FileText, Star, CheckCircle, AlertCircle, Wifi, WifiOff, Coins, ExternalLink, Play, Video } from 'lucide-react';
import { uploadWithFallback, checkUploadStatus } from '../lib/uploadService';
import { validateFile } from '../lib/github';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { pointsService } from '../services/pointsService';
import { generateNoteSlug } from '../utils/seo';
// Database operations now handled through API route


const NotesUpload = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    branch: '',
    semester: '',
    subject: '',
    description: '',
    tags: '',
    authorName: '',
    degree: '',
    noteType: 'free', // Default to free
    points: 50,
    file: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [githubUrl, setGithubUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ github: false, local: true, message: '' });
  const [uploadMethod, setUploadMethod] = useState<string>('');
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [uploadedNoteId, setUploadedNoteId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Check upload status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkUploadStatus();
        setUploadStatus(status);
      } catch (error) {
        console.error('Failed to check upload status:', error);
        setUploadStatus({ 
          github: false, 
          local: true, 
          message: 'Unable to check upload status. Using fallback service.' 
        });
      }
    };
    checkStatus();
  }, []);

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

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      // Upload file using fallback service
      const fileExtension = formData.file.name.split('.').pop();
      const sanitizedTitle = formData.title.replace(/\s+/g, '_');
      const githubPath = `notes/${formData.branch}/${formData.semester}/${sanitizedTitle}.${fileExtension}`;
      
      const uploadResult = await uploadWithFallback(formData.file, githubPath);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      const newGithubUrl = uploadResult.url!;
      const uploadMethod = uploadResult.method || 'unknown';
      setUploadMethod(uploadMethod);

      // Log the upload result for debugging
      console.log('Upload completed:', {
        method: uploadMethod,
        url: newGithubUrl,
        isGitHubUrl: newGithubUrl.includes('githubusercontent.com') || newGithubUrl.includes('github.com'),
        isMockUrl: newGithubUrl.includes('mockcdn.jehub.com')
      });

      if (progressIntervalId) clearInterval(progressIntervalId);
      setUploadProgress(100);

      // Fetch user's IP address
      const ipResponse = await fetch('/api/ip');
      const { ip } = await ipResponse.json();

      // Store metadata in database through API route
      const notesData = {
        title: formData.title,
        branch: formData.branch,
        semester: formData.semester,
        subject: formData.subject,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        authorName: formData.authorName,
        githubUrl: newGithubUrl,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        noteType: formData.noteType,
        points: formData.points,
        userIp: ip,
        degree: formData.degree
      };
      
      console.log('Saving to database with GitHub URL:', {
        githubUrl: newGithubUrl,
        method: uploadMethod
      });

      const dbResponse = await fetch('/api/notes-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notesData),
      });

      if (!dbResponse.ok) {
        const errorData = await dbResponse.json();
        console.error('Database save failed:', errorData);
        throw new Error(`Upload completed but database save failed: ${errorData.error || 'Unknown error'}`);
      }

      const dbResult = await dbResponse.json();
      console.log('Database save successful:', dbResult);
      
      // Store the uploaded note information
      const uploadedId = dbResult.noteId || dbResult.id || 'unknown';
      setUploadedNoteId(uploadedId);
      
      // Generate preview URL using the note ID and title
      if (uploadedId !== 'unknown') {
        const slug = generateNoteSlug(uploadedId, formData.title);
        const previewLink = `/notes/preview/${slug}`;
        setPreviewUrl(previewLink);
      }
      
      // Award upload bonus points to authenticated users
      if (user) {
        try {
          await pointsService.awardUploadBonus(
            user.$id,
            user.email,
            uploadedId,
            formData.title
          );
          setPointsAwarded(30); // Set points awarded for display
          console.log('Upload bonus points awarded!');
        } catch (pointsError) {
          console.error('Error awarding upload bonus:', pointsError);
          // Don't fail the upload if points award fails
        }
      }

      // Reset form
      setFormData({
        title: '',
        branch: '',
        semester: '',
        subject: '',
        description: '',
        tags: '',
        authorName: '',
        degree: '',
        noteType: 'free',
        points: 50,
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
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Upload Your Notes
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Share your knowledge with others and earn points - No login required!
          </p>
          
          {/* Demo Video Section */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-6 py-4 shadow-sm">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 mb-1">📺 Need help with uploading?</p>
                <a 
                  href="https://www.youtube.com/watch?v=cOSTc6qBRQw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-semibold"
                >
                  <Play className="h-4 w-4" />
                  Watch Upload Demo Video
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Upload Status Indicator */}
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
            {uploadStatus.github ? (
              <Wifi className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-500 mr-2" />
            )}
            <span className="text-sm text-gray-600">{uploadStatus.message}</span>
          </div>
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
              Notes uploaded successfully! Thank you for contributing to the platform.
            </p>
          </div>
        )}

        {/* Success Popup */}
        {isSubmitted && githubUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your notes have been uploaded successfully{uploadMethod === 'github' ? ' to GitHub' : ' using our secure service'}.
              </p>
              
              {/* Points awarded notification */}
              {pointsAwarded > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center">
                    <Coins className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800 font-medium">+{pointsAwarded} points awarded!</span>
                  </div>
                </div>
              )}
              
              {uploadMethod === 'local' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-700">Note: Using fallback upload service due to GitHub connectivity issues.</span>
                  </div>
                </div>
              )}
              
              {/* Preview page link (priority) */}
              {previewUrl ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 font-medium mb-2">📖 View your uploaded notes:</p>
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Notes Preview
                  </a>
                </div>
              ) : (
                /* Fallback to show file URL */
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">File URL:</p>
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                    {githubUrl}
                  </a>
                </div>
              )}
              
              <div className="flex gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Notes
                  </a>
                )}
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setGithubUrl('');
                    setPreviewUrl('');
                    setUploadedNoteId('');
                    setPointsAwarded(0);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                  <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                      Degree *
                    </label>
                    <select
                      id="degree"
                      required
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Degree</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="Diploma">Diploma</option>
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
                  <label htmlFor="noteType" className="block text-sm font-medium text-gray-700 mb-2">
                    Note Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="noteType"
                        value="free"
                        checked={formData.noteType === 'free'}
                        onChange={(e) => setFormData({ ...formData, noteType: e.target.value as 'free' | 'premium' })}
                        className="mr-2"
                      />
                      <span className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        🆓 FREE
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="noteType"
                        value="premium"
                        checked={formData.noteType === 'premium'}
                        onChange={(e) => setFormData({ ...formData, noteType: e.target.value as 'free' | 'premium' })}
                        className="mr-2"
                      />
                      <span className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ PREMIUM
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Free notes are accessible to everyone. Premium notes may have additional features.
                  </p>
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
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    id="points"
                    required
                    min="1"
                    max="1000"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value, 10) || 50 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter points for this upload (1-1000)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set points between 1-1000. Higher quality notes deserve more points!
                  </p>
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
                  <p className="text-2xl font-bold">{formData.points} Points</p>
                  <p className="text-sm text-blue-100">for this upload</p>
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