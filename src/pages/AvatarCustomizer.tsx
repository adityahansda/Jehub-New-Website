import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  Download,
  Save,
  RefreshCw,
  User,
  Palette,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface AvatarOptions {
  seed: string;
  backgroundColor: string;
  clothesColor: string;
  eyebrowType: string;
  eyeType: string;
  mouthType: string;
  skinColor: string;
  hairColor: string;
  hatColor: string;
  clothingType: string;
}

const AvatarCustomizer = () => {
  const [avatarOptions, setAvatarOptions] = useState<AvatarOptions>({
    seed: 'custom-avatar',
    backgroundColor: 'b6e3f4',
    clothesColor: '3f82f6',
    eyebrowType: 'Default',
    eyeType: 'Default',
    mouthType: 'Default',
    skinColor: 'fdbcb4',
    hairColor: '724133',
    hatColor: 'aa6c39',
    clothingType: 'Shirt'
  });

  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [avatarType, setAvatarType] = useState<'generated' | 'uploaded'>('generated');

  // Color options
  const backgroundColors = [
    { name: 'Sky Blue', value: 'b6e3f4' },
    { name: 'Pink', value: 'fce7f3' },
    { name: 'Green', value: 'd1fae5' },
    { name: 'Purple', value: 'e9d5ff' },
    { name: 'Yellow', value: 'fef3c7' },
    { name: 'Orange', value: 'fed7aa' }
  ];

  const skinColors = [
    { name: 'Light', value: 'fdbcb4' },
    { name: 'Medium', value: 'f8d25c' },
    { name: 'Dark', value: 'd08b5b' },
    { name: 'Pale', value: 'ffd5dc' },
    { name: 'Tan', value: 'edb98a' }
  ];

  const hairColors = [
    { name: 'Brown', value: '724133' },
    { name: 'Black', value: '2c1b18' },
    { name: 'Blonde', value: 'b58143' },
    { name: 'Red', value: 'a55728' },
    { name: 'Gray', value: '4a5568' }
  ];

  const clothingTypes = ['Shirt', 'Hoodie', 'Overall', 'BlazerShirt', 'GraphicShirt'];
  const eyeTypes = ['Default', 'Close', 'Cry', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky'];
  const mouthTypes = ['Default', 'Concerned', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit'];
  const eyebrowTypes = ['Default', 'Angry', 'AngryNatural', 'FlatNatural', 'RaisedExcited', 'SadConcerned', 'UnibrowNatural', 'UpDown'];

  useEffect(() => {
    // Load saved user info
    const savedUserInfo = localStorage.getItem('guestUserInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo(parsed);
        setAvatarOptions(prev => ({ ...prev, seed: parsed.name || 'custom-avatar' }));
      } catch (error) {
        console.error('Error parsing saved user info:', error);
      }
    }
  }, []);

  const generateAvatarUrl = () => {
    const params = new URLSearchParams({
      seed: avatarOptions.seed,
      backgroundColor: avatarOptions.backgroundColor,
      clothesColor: avatarOptions.clothesColor,
      eyebrowType: avatarOptions.eyebrowType,
      eyeType: avatarOptions.eyeType,
      mouthType: avatarOptions.mouthType,
      skinColor: avatarOptions.skinColor,
      hairColor: avatarOptions.hairColor,
      clothingType: avatarOptions.clothingType,
      size: '200'
    });
    
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setCustomFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAvatarType('uploaded');
    }
  };

  const uploadToGitHub = async () => {
    if (!customFile && avatarType === 'uploaded') {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (avatarType === 'uploaded' && customFile) {
        // Handle custom file upload
        const buffer = await customFile.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        fileContent = btoa(String.fromCharCode(...uint8Array));
        fileName = `avatar-${userInfo.name || 'user'}-${Date.now()}.${customFile.type.split('/')[1]}`;
        mimeType = customFile.type;
      } else {
        // Handle generated avatar
        const avatarUrl = generateAvatarUrl();
        const response = await fetch(avatarUrl);
        const svgText = await response.text();
        fileContent = btoa(svgText);
        fileName = `avatar-${userInfo.name || 'user'}-${Date.now()}.svg`;
        mimeType = 'image/svg+xml';
      }

      // Upload to GitHub (mock implementation - you'll need to implement actual GitHub API)
      const uploadResponse = await fetch('/api/upload-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileContent,
          mimeType,
          userInfo,
          avatarOptions: avatarType === 'generated' ? avatarOptions : null
        })
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      
      // Save avatar URL to user data
      const updatedUserInfo = {
        ...userInfo,
        avatarUrl: result.avatarUrl,
        customAvatar: true
      };
      
      localStorage.setItem('guestUserInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      
      setUploadStatus('success');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadAvatar = async () => {
    try {
      let url: string;
      let filename: string;

      if (avatarType === 'uploaded' && previewUrl) {
        url = previewUrl;
        filename = `custom-avatar-${Date.now()}.${customFile?.type.split('/')[1] || 'png'}`;
      } else {
        url = generateAvatarUrl();
        filename = `generated-avatar-${Date.now()}.svg`;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download avatar');
    }
  };

  const randomizeAvatar = () => {
    setAvatarOptions({
      ...avatarOptions,
      seed: Math.random().toString(36).substring(7),
      backgroundColor: backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value,
      clothesColor: ['3f82f6', 'ef4444', '10b981', 'f59e0b', '8b5cf6'][Math.floor(Math.random() * 5)],
      eyebrowType: eyebrowTypes[Math.floor(Math.random() * eyebrowTypes.length)],
      eyeType: eyeTypes[Math.floor(Math.random() * eyeTypes.length)],
      mouthType: mouthTypes[Math.floor(Math.random() * mouthTypes.length)],
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)].value,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)].value,
      clothingType: clothingTypes[Math.floor(Math.random() * clothingTypes.length)]
    });
    setAvatarType('generated');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/notes-download"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Notes
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Avatar Customizer</h1>
            <p className="text-gray-600">Create your perfect avatar and use it across the platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Preview</h3>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {avatarType === 'uploaded' && previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Custom Avatar"
                      width={200}
                      height={200}
                      className="rounded-full border-4 border-blue-200"
                    />
                  ) : (
                    <Image
                      src={generateAvatarUrl()}
                      alt="Generated Avatar"
                      width={200}
                      height={200}
                      className="rounded-full border-4 border-blue-200"
                    />
                  )}
                </div>
              </div>

              {/* Avatar Type Selector */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAvatarType('generated')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    avatarType === 'generated'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Palette className="h-4 w-4 inline mr-1" />
                  Generated
                </button>
                <button
                  onClick={() => setAvatarType('uploaded')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    avatarType === 'uploaded'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Camera className="h-4 w-4 inline mr-1" />
                  Upload
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={uploadToGitHub}
                  disabled={isUploading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {isUploading ? 'Saving...' : 'Save Avatar'}
                </button>

                <button
                  onClick={downloadAvatar}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download
                </button>

                {avatarType === 'generated' && (
                  <button
                    onClick={randomizeAvatar}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Randomize
                  </button>
                )}
              </div>

              {/* Status Messages */}
              {uploadStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 text-sm">Avatar saved successfully!</span>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800 text-sm">Failed to save avatar. Please try again.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {avatarType === 'uploaded' ? (
                /* File Upload Section */
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload Custom Avatar</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-lg font-medium text-gray-700 mb-2">
                        Click to upload your avatar
                      </span>
                      <span className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                  </div>

                  {customFile && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-800 text-sm">
                        File selected: {customFile.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Avatar Customization Options */
                <div className="space-y-8">
                  <h3 className="text-lg font-semibold text-gray-900">Customize Your Avatar</h3>

                  {/* User Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) => {
                          const newUserInfo = { ...userInfo, name: e.target.value };
                          setUserInfo(newUserInfo);
                          setAvatarOptions(prev => ({ ...prev, seed: e.target.value || 'custom-avatar' }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Background Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Background Color</label>
                    <div className="grid grid-cols-6 gap-3">
                      {backgroundColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAvatarOptions({ ...avatarOptions, backgroundColor: color.value })}
                          className={`w-12 h-12 rounded-lg border-2 transition-all ${
                            avatarOptions.backgroundColor === color.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: `#${color.value}` }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Skin Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Skin Color</label>
                    <div className="grid grid-cols-5 gap-3">
                      {skinColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAvatarOptions({ ...avatarOptions, skinColor: color.value })}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            avatarOptions.skinColor === color.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: `#${color.value}` }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hair Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Hair Color</label>
                    <div className="grid grid-cols-5 gap-3">
                      {hairColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAvatarOptions({ ...avatarOptions, hairColor: color.value })}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            avatarOptions.hairColor === color.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: `#${color.value}` }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dropdowns for other options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Eyes</label>
                      <select
                        value={avatarOptions.eyeType}
                        onChange={(e) => setAvatarOptions({ ...avatarOptions, eyeType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {eyeTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mouth</label>
                      <select
                        value={avatarOptions.mouthType}
                        onChange={(e) => setAvatarOptions({ ...avatarOptions, mouthType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {mouthTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Eyebrows</label>
                      <select
                        value={avatarOptions.eyebrowType}
                        onChange={(e) => setAvatarOptions({ ...avatarOptions, eyebrowType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {eyebrowTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Clothing</label>
                      <select
                        value={avatarOptions.clothingType}
                        onChange={(e) => setAvatarOptions({ ...avatarOptions, clothingType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {clothingTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
