import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import { userService } from '../../services/userService';
import {
  Lock,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Edit3,
  Save,
  User,
  Phone,
  Calendar,
  GraduationCap,
  Building,
  Users,
  Camera,
  Upload,
  MessageCircle
} from 'lucide-react';

// Helper Components
interface InputFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  field: string;
  editMode: boolean;
  onChange: (field: string, value: string) => void;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ icon: Icon, label, value, field, editMode, onChange, type = "text" }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      {editMode ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      ) : (
        <p className="px-3 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg">
          {value || 'Not set'}
        </p>
      )}
    </div>
  );
};

interface SelectFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  field: string;
  editMode: boolean;
  onChange: (field: string, value: string) => void;
  options: string[];
}

const SelectField: React.FC<SelectFieldProps> = ({ icon: Icon, label, value, field, editMode, onChange, options }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      {editMode ? (
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <p className="px-3 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg">
          {value || 'Not set'}
        </p>
      )}
    </div>
  );
};

interface TextareaFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  field: string;
  editMode: boolean;
  onChange: (field: string, value: string) => void;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ icon: Icon, label, value, field, editMode, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      {editMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      ) : (
        <p className="px-3 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[80px]">
          {value || 'Not set'}
        </p>
      )}
    </div>
  );
};

const UserProfileSection: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form states for password/email change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile form data
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    gender: userProfile?.gender || '',
    college: userProfile?.college || '',
    branch: userProfile?.branch || '',
    semester: userProfile?.semester || '',
    year: userProfile?.year || '',
    bio: userProfile?.bio || '',
    telegramUsername: userProfile?.telegramUsername || ''
  });
  
  // Loading and error states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isGettingVerified, setIsGettingVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  // Avatar/Profile picture states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  
  // Custom avatar creation states
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState({
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 'text-4xl',
    fontWeight: 'font-bold',
    shape: 'rounded-full'
  });

  // Handle password change
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      await authService.changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!newEmail || !currentPassword) {
      setEmailError('Please fill in all fields');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsChangingEmail(true);
    setEmailError('');
    
    try {
      await authService.changeEmail(newEmail, currentPassword);
      setEmailSuccess(true);
      setCurrentPassword('');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
      }, 2000);
    } catch (error: any) {
      setEmailError(error.message || 'Failed to change email');
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Handle get verified
  const handleGetVerified = async () => {
    setIsGettingVerified(true);
    try {
      await authService.sendEmailVerification();
      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      alert('Failed to send verification email: ' + error.message);
    } finally {
      setIsGettingVerified(false);
    }
  };

  // Handle profile form input changes
  const handleInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user?.email) return;
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      await userService.updateUserProfile(user.email, profileForm);
      setSaveSuccess(true);
      setIsEditMode(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit cancellation
  const handleCancelEdit = () => {
    setProfileForm({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      dateOfBirth: userProfile?.dateOfBirth || '',
      gender: userProfile?.gender || '',
      college: userProfile?.college || '',
      branch: userProfile?.branch || '',
      semester: userProfile?.semester || '',
      year: userProfile?.year || '',
      bio: userProfile?.bio || '',
      telegramUsername: userProfile?.telegramUsername || ''
    });
    setIsEditMode(false);
    setSaveError('');
  };

  // Handle file selection for avatar upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAvatarError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setAvatarError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      setAvatarError('Please select a file first');
      return;
    }
    
    setIsUploadingAvatar(true);
    setAvatarError('');
    
    try {
      // Here you would implement actual file upload to your storage service
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile with new image URL
      // const imageUrl = await uploadToStorage(selectedFile);
      // await userService.updateUserProfile(user?.email || '', { profileImageUrl: imageUrl });
      
      setAvatarSuccess(true);
      setShowAvatarModal(false);
      setSelectedFile(null);
      setPreviewUrl('');
      
      setTimeout(() => {
        setAvatarSuccess(false);
      }, 3000);
    } catch (error: any) {
      setAvatarError(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle custom avatar creation
  const handleCreateCustomAvatar = async () => {
    try {
      // Create a canvas element to generate the custom avatar
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set background
        ctx.fillStyle = avatarOptions.backgroundColor;
        ctx.fillRect(0, 0, 200, 200);
        
        // Add text (first letter of name)
        ctx.fillStyle = avatarOptions.textColor;
        ctx.font = `bold 80px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const letter = (profileForm.name || user?.name || 'U')[0].toUpperCase();
        ctx.fillText(letter, 100, 100);
        
        // Convert to blob and simulate upload
        canvas.toBlob(async (blob) => {
          if (blob) {
            // Here you would upload the generated avatar
            // const imageUrl = await uploadBlobToStorage(blob);
            // await userService.updateUserProfile(user?.email || '', { profileImageUrl: imageUrl });
            
            setAvatarSuccess(true);
            setShowAvatarCreator(false);
            
            setTimeout(() => {
              setAvatarSuccess(false);
            }, 3000);
          }
        }, 'image/png');
      }
    } catch (error: any) {
      setAvatarError(error.message || 'Failed to create custom avatar');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pr-8 md:pr-12 lg:pr-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 w-full max-w-none">
        
        {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 mb-4 md:mb-0">
          <div className="relative group">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-800 ring-blue-500 cursor-pointer hover:ring-blue-600 transition-all"
              onClick={() => setShowAvatarModal(true)}
            >
              {userProfile?.profileImageUrl ? (
                <Image src={userProfile.profileImageUrl} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-400">
                  {(profileForm.name || user?.name || 'U')[0].toUpperCase()}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            
            {/* Always visible camera button */}
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h1 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">{isEditMode ? profileForm.name : (userProfile?.name || user?.name)}</h1>
            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 text-sm mt-1">
              <span>{user?.email}</span>
              {userProfile?.isProfileComplete ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full text-xs font-semibold flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified
                </span>
              ) : (
                <button 
                  onClick={handleGetVerified} 
                  disabled={isGettingVerified} 
                  className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-full text-xs font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-800/30 transition-colors flex items-center disabled:opacity-60"
                >
                  {isGettingVerified ? 'Sending...' : 'Get Verified'}
                </button>
              )}
            </div>
            <div className="mt-3 space-x-3">
              <button onClick={() => setShowPasswordModal(true)} className="text-xs text-blue-500 hover:underline">Change Password</button>
              <button onClick={() => setShowEmailModal(true)} className="text-xs text-blue-500 hover:underline">Change Email</button>
            </div>
          </div>
        </div>
        <div>
          {isEditMode ? (
            <div className="flex gap-3">
              <button 
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditMode(true)} 
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      {/* Save status messages */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-sm text-red-800 dark:text-red-200">{saveError}</p>
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <p className="text-sm text-green-800 dark:text-green-200">Profile saved successfully!</p>
        </div>
      )}
      
      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Personal Information</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your personal and contact details.</p>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField icon={User} label="Full Name" value={profileForm.name} field="name" editMode={isEditMode} onChange={handleInputChange} />
          <InputField icon={Phone} label="Phone Number" value={profileForm.phone} field="phone" editMode={isEditMode} onChange={handleInputChange} />
          <InputField icon={Calendar} label="Date of Birth" value={profileForm.dateOfBirth} field="dateOfBirth" editMode={isEditMode} onChange={handleInputChange} type="date" />
          <SelectField icon={Users} label="Gender" value={profileForm.gender} field="gender" editMode={isEditMode} onChange={handleInputChange} options={['Male', 'Female', 'Other']} />
        </div>
      </div>
      
      <hr className="my-8 border-gray-200 dark:border-gray-700" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Academic Details</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your current academic information.</p>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField icon={Building} label="College" value={profileForm.college} field="college" editMode={isEditMode} onChange={handleInputChange} />
          <InputField icon={GraduationCap} label="Branch" value={profileForm.branch} field="branch" editMode={isEditMode} onChange={handleInputChange} />
          <InputField icon={GraduationCap} label="Semester" value={profileForm.semester} field="semester" editMode={isEditMode} onChange={handleInputChange} />
          <InputField icon={Calendar} label="Year" value={profileForm.year} field="year" editMode={isEditMode} onChange={handleInputChange} />
        </div>
      </div>
      
      <hr className="my-8 border-gray-200 dark:border-gray-700" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Additional Information</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your bio and social links.</p>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField icon={MessageCircle} label="Telegram Username" value={profileForm.telegramUsername} field="telegramUsername" editMode={isEditMode} onChange={handleInputChange} />
          <div className="md:col-span-2">
            <TextareaField icon={User} label="Bio" value={profileForm.bio} field="bio" editMode={isEditMode} onChange={handleInputChange} />
          </div>
        </div>
      </div>
      </div>
      
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-sm text-green-800 dark:text-green-200">Password changed successfully!</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  placeholder="Current Password" 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder="New Password" 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isChangingPassword}
              >
                Cancel
              </button>
              <button 
                onClick={handlePasswordChange} 
                disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Email</h2>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {emailError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200">{emailError}</p>
              </div>
            )}
            
            {emailSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-sm text-green-800 dark:text-green-200">Email changed successfully! Please verify your new email.</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Email</label>
                <input 
                  type="email" 
                  placeholder="Enter new email address" 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter your current password" 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <Shield className="h-4 w-4 inline mr-1" />
                You will need to verify your new email address after changing it.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowEmailModal(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isChangingEmail}
              >
                Cancel
              </button>
              <button 
                onClick={handleEmailChange} 
                disabled={isChangingEmail || !newEmail || !currentPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
              >
                {isChangingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Changing...
                  </>
                ) : (
                  'Change Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Profile Picture</h2>
              <button onClick={() => setShowAvatarModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {avatarError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200">{avatarError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Image Preview */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 mb-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                
                {/* File input */}
                <div className="w-full">
                  <label className="w-full text-center px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Choose Image
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>
              
              {/* Custom Avatar Creator */}
              <div className="text-center md:text-left">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Or create a custom avatar:</p>
                <button 
                  onClick={() => {
                    setShowAvatarModal(false);
                    setShowAvatarCreator(true);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Create Custom Avatar
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAvatarModal(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isUploadingAvatar}
              >
                Cancel
              </button>
              <button 
                onClick={handleAvatarUpload} 
                disabled={!selectedFile || isUploadingAvatar}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
              >
                {isUploadingAvatar ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Avatar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Avatar Creator Modal */}
      {showAvatarCreator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create Custom Avatar</h2>
            
            {/* Avatar preview */}
            <div className={`w-32 h-32 mx-auto mb-4 flex items-center justify-center ${avatarOptions.shape}`} style={{ backgroundColor: avatarOptions.backgroundColor }}>
              <span className={`${avatarOptions.fontSize} ${avatarOptions.fontWeight}`} style={{ color: avatarOptions.textColor }}>
                {(profileForm.name || user?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
            
            {/* Avatar options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Background Color</label>
                <input type="color" value={avatarOptions.backgroundColor} onChange={(e) => setAvatarOptions({ ...avatarOptions, backgroundColor: e.target.value })} className="w-full h-10 p-1 border-none cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Text Color</label>
                <input type="color" value={avatarOptions.textColor} onChange={(e) => setAvatarOptions({ ...avatarOptions, textColor: e.target.value })} className="w-full h-10 p-1 border-none cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Shape</label>
                <select value={avatarOptions.shape} onChange={(e) => setAvatarOptions({ ...avatarOptions, shape: e.target.value })} className="w-full p-2 border border-gray-300 rounded">
                  <option value="rounded-full">Circle</option>
                  <option value="rounded-lg">Square</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAvatarCreator(false)} className="px-4 py-2 text-sm bg-gray-200 rounded">Cancel</button>
              <button onClick={handleCreateCustomAvatar} className="px-4 py-2 text-sm bg-blue-600 text-white rounded">Create and Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileSection;

