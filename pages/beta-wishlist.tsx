import React, { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Navigation from "../src/components/Navigation";
import Footer from "../src/components/Footer";
import { useAuth } from "../src/contexts/AuthContext";
import Link from "next/link";


// Comprehensive list of colleges and institutes
const COLLEGES_LIST = {
  "Government Institutes (Diploma)": [
    "GOVERNMENT POLYTECHNIC NIRSA, DHANBAD",
    "GOVERNMENT POLYTECHNIC, ADITYAPUR",
    "GOVERNMENT POLYTECHNIC, BHAGA, DHANBAD",
    "GOVERNMENT POLYTECHNIC, DHANBAD",
    "GOVERNMENT POLYTECHNIC, DUMKA",
    "GOVERNMENT POLYTECHNIC, JAGANNATHPUR",
    "GOVERNMENT POLYTECHNIC, KHARSAWAN",
    "GOVERNMENT POLYTECHNIC, KHUTRI, BOKARO",
    "GOVERNMENT POLYTECHNIC, KODERMA",
    "GOVERNMENT POLYTECHNIC, LATEHAR",
  ],
  "Government Institutes (Other)": [
    "B.I.T , SINDRI , DHANBAD",
    "National Institute of Foundry & Forge Technology, Hatia",
  ],
  "Private Institutes (Diploma)": [
    "AL-KABIR POLYTECHNIC, JAMSHEDPUR",
    "BITT POLYTECHNIC, RANCHI",
    "CAMBRIDGE INSTITUTE OF POLYTECHNIC, RANCHI",
    "CENTRE FOR BIOINFORMATICS, RANCHI",
    "GIRIJA INSTITUTE OF POLYTECHNIC, RAMGARH",
    "INSTITUTE OF SCIENCE AND MANAGEMENT, PUNDAG, RANCHI",
    "K.K. COLLEGE OF ENGINEERING & MANAGEMENT, DHANBAD",
    "K.K. POLYTECHNIC, DHANBAD",
    "KHANDOLI INSTITUTE OF TECHNOLOGY, GIRIDIH",
    "NETAJI SUBHAS INSTITUTE OF HOTEL MANAGEMENT & TOURISM",
  ],
  "Private Institutes (B.Tech)": [
    "B.A COLLEGE OF ENGINEERING & TECHNOLOGY, JAMSHEDPUR",
    "CAMBRIDGE INSTITUTE OF TECHNOLOGY, TATISILWAI, RANCHI",
    "D.A.V INSTITUTE OF ENGINEERING & TECHNOLOGY, PALAMAU",
    "GURUGOVIND SINGH EDUCATIONAL SOCIETY TECHNICAL CAMPUS, BOKARO",
    "K.K. COLLEGE OF ENGINEERING & MANAGEMENT, DHANBAD",
    "MARYLAND INSTITUTE OF TECHNOLOGY & MANAGEMENT, JAMSHEDPUR",
    "NILAI EDUCATION TRUSTS GROUP OF INSTITUTIONS, THAKURGAON, BURMU, RANCHI",
    "R.T.C INSTITUTE OF TECHNOLOGY, RANCHI",
    "R.V.S COLLEGE OF ENGINEERING & TECHNOLOGY, JAMSHEDPUR",
    "RAMGOVIND INSTITUTE OF TECHNOLOGY, KODERMA",
  ],
  "Private Institutes (PG)": [
    "BIT Sindri, Dhanbad",
    "Cambridge Institute of Technology, Tatisilwai, Ranchi",
    "Guru Govind Singh Educational Society, Bokaro",
    "RVS College of Engineering & Technology",
  ],
  "PPP Institutes (Diploma)": [
    "BEHARAGORA POLYTECHNIC, BEHARAGORA",
    "CHANDIL POLYTECHNIC, CHANDIL",
    "GARHWA POLYTECHNIC, GARHWA",
    "GOLA POLYTECHNIC, GOLA",
    "MADHUPUR POLYTECHNIC, MADHUPUR",
    "PAKUR POLYTECHNIC",
    "SILLI POLYTECHNIC",
  ],
  "PPP Institutes (B.Tech)": [
    "CHAIBASA ENGINEERING COLLEGE",
    "DUMKA ENGINEERING COLLEGE",
    "RAMGARH ENGINEERING COLLEGE",
  ],
};

const WishlistRegistration: React.FC = () => {
  const router = useRouter();
  const { user, isVerified, userProfile, loading } = useAuth();
  
  // All hooks must be at the top level
  const [form, setForm] = useState({
    name: "",
    branch: "",
    yearsOfStudy: "",
    degree: "",
    collegeName: "",
    otherCollege: "",
    email: "",
    telegramId: "",
    referCode: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "checking" | "verified" | "unverified" | "not_member" | null
  >(null);
  const [verificationTimeoutId, setVerificationTimeoutId] =
    useState<NodeJS.Timeout | null>(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationUserData, setVerificationUserData] = useState<any>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!loading && !user) {
      // Don't redirect, just show the page with login popup
      return;
    }
  }, [user, loading, router]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    } else {
      // Clear form when user logs out
      setForm({
        name: "",
        branch: "",
        yearsOfStudy: "",
        degree: "",
        collegeName: "",
        otherCollege: "",
        email: "",
        telegramId: "",
        referCode: "",
      });
      setMessage("");
      setError("");
    }
  }, [user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <>
        <Head>
          <title>Beta Wishlist Registration - JEHub</title>
        </Head>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-600 pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
          <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl overflow-hidden border border-purple-500/30 p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-300">Checking authentication...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const fieldLabels = {
    name: "Full Name",
    branch: "Branch/Department",
    yearsOfStudy: "Year of Study",
    degree: "Degree",
    collegeName: "College Name",
    email: "Email Address",
    telegramId: "Telegram ID",
    referCode: "Referral Code (Optional)",
  };

  // Real-time Telegram verification function
  const verifyTelegramUser = async (username: string) => {
    if (!username || username.length < 3) {
      setVerificationStatus(null);
      setVerificationMessage("");
      setVerificationUserData(null);
      return;
    }

    setVerificationStatus("checking");
    setVerificationMessage("Checking...");

    try {
      const response = await axios.get(`/api/verify-telegram?username=${encodeURIComponent(username)}`);
      const data = response.data;

      if (data.is_member && data.isVerified) {
        setVerificationStatus("verified");
        setVerificationMessage("✅ Verified! You can proceed with registration.");
        setVerificationUserData(data.user_data);
      } else if (data.is_member && !data.isVerified) {
        setVerificationStatus("unverified");
        setVerificationMessage("⚠️ You are a member but not verified. Please send /verify in the Telegram group.");
        setVerificationUserData(data.user_data);
        setShowVerificationModal(true);
      } else {
        setVerificationStatus("not_member");
        setVerificationMessage("❌ Not a member. Please join our Telegram group first.");
        setVerificationUserData(null);
        setShowVerificationModal(true);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus("not_member");
      setVerificationMessage("❌ Error verifying Telegram membership. Please check your username.");
      setVerificationUserData(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setForm({
      ...form,
      [name]: value,
    });
    
    // Clear messages on input change
    if (message) setMessage("");
    if (error) setError("");

    // Handle Telegram ID verification with debouncing
    if (name === "telegramId") {
      // Clear previous timeout
      if (verificationTimeoutId) {
        clearTimeout(verificationTimeoutId);
      }

      // Reset verification status
      setVerificationStatus(null);
      setVerificationMessage("");
      setVerificationUserData(null);

      // Set new timeout for verification
      const timeoutId = setTimeout(() => {
        const cleanUsername = value.startsWith('@') ? value.substring(1) : value;
        if (cleanUsername.length >= 3) {
          verifyTelegramUser(cleanUsername);
        }
      }, 1000); // 1 second delay

      setVerificationTimeoutId(timeoutId);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    const requiredFields = ['name', 'branch', 'yearsOfStudy', 'degree', 'collegeName', 'email', 'telegramId'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'collegeName') {
        return !form.collegeName || (form.collegeName === 'other' && !form.otherCollege);
      }
      return !form[field as keyof typeof form];
    });
    

    
    // Validate branch format
    if (form.branch && !form.branch.match(/^[a-zA-Z\s&,.-]{2,50}$/)) {
      setError('Branch must be 2-50 characters long and contain only letters, spaces, and common punctuation');
      return;
    }
    
    // Validate years of study
    if (form.yearsOfStudy && !['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'].includes(form.yearsOfStudy)) {
      setError('Please select a valid year of study from the dropdown');
      return;
    }
    
    // Validate degree
    if (form.degree && !['B.Tech', 'Diploma', 'M.Tech', 'MBA', 'MCA', 'Other'].includes(form.degree)) {
      setError('Please select a valid degree from the dropdown');
      return;
    }
    
    // Validate college name
            if (form.collegeName && !form.collegeName.match(/^[a-zA-Z\s&,.\-()]{2,100}$/)) {
      setError('College name must be 2-100 characters long and contain only letters, spaces, and common punctuation');
      return;
    }
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate college name
    if (form.collegeName === 'other' && !form.otherCollege?.trim()) {
      setError('Please specify your college/institute name');
      return;
    }
    
    // Validate Telegram ID format
    if (form.telegramId && !form.telegramId.match(/^@?[a-zA-Z0-9_]{5,}$/)) {
      setError('Please enter a valid Telegram username (e.g., @username or username)');
      return;
    }
    

    
    // Check if user is authenticated
    if (!user) {
      setError("Please sign in to submit your registration.");
      return;
    }

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      // Check if email matches user's authenticated email
      if (user && form.email !== user.email) {
        setError(
          `📧 Email Mismatch\n\nThe email address in the form (${form.email}) must match your authenticated account email (${user.email}). Please update the email field to match your account.`
        );
        return;
      }

      // Prepare the data with the correct college name
      const submitData = {
        ...form,
        collegeName:
          form.collegeName === "other" ? form.otherCollege : form.collegeName,
      };

      const response = await axios.post(
        "/api/beta-wishlist-sheets",
        submitData
      );

      let message = response.data.message;
      // Add referral code success message if applicable
      if (form.referCode && form.referCode.trim()) {
        message +=
          " Your referral code was valid and the referrer has been awarded 10 points!";
      }

      setMessage(message);
      router.push("/wishlist-users");
      setForm({
        name: "",
        branch: "",
        yearsOfStudy: "",
        degree: "",
        collegeName: "",
        otherCollege: "",
        email: "",
        telegramId: "",
        referCode: "",
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "An error occurred. Please try again.";
      const errorType = err.response?.data?.type;
      const existingUser = err.response?.data?.existingUser;

      // Check if it's a verification error
      if (err.response?.data?.verificationRequired) {
        setError(
          `${errorMessage}\n\n📱 To fix this issue:\n1. Join our Telegram group: https://t.me/JharkhandEnginnersHub\n2. Send /verify message in the group\n3. Try submitting again\n\nNeed help? Contact us in the group!`
        );
      } else if (errorType === 'email_exists' || errorType === 'telegram_exists') {
        // Handle duplicate registration errors with enhanced UI
        setError(errorMessage);
        setShowDuplicateModal(true);
        setDuplicateInfo({ type: errorType, existingUser, message: errorMessage });
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Beta Wishlist Registration - JEHub</title>
        <meta
          name="description"
          content="Join the JEHub Beta Program - Get early access to exclusive features and content."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jehub.in/beta-wishlist" />
      </Head>

      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-600 pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl overflow-hidden border border-purple-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 px-8 py-6">
              <h1 className="text-3xl font-bold text-white text-center">
                🚀 Join JEHub Beta Program
              </h1>
              <p className="text-gray-300 text-center mt-2">
                Get early access to exclusive features and be part of our
                growing community
              </p>
              

            </div>

            {/* Telegram Group Info */}
            <div className="px-3 sm:px-6 lg:px-8 py-4 bg-green-900/30 border-b border-green-500/30">
              <div className="w-full">
                <h3 className="text-white font-semibold mb-3 text-center sm:text-left">
                  🚀 Join Our Telegram Community
                </h3>
                <p className="text-gray-300 text-sm mb-4 text-center sm:text-left leading-relaxed">
                  {user ? (
                    "✅ You're signed in and ready to join the beta program! We encourage you to join our Telegram group for updates and support."
                  ) : (
                    "📝 Fill out the form below and sign in to join the beta program! We encourage you to join our Telegram group for updates and support."
                  )}
                </p>
                <div className="space-y-3 text-sm">
                  {/* Join Community Row - Mobile Friendly */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="flex items-center space-x-2 justify-center sm:justify-start">
                      <span className="text-green-400 text-lg">💬</span>
                      <span className="text-gray-300 font-medium">Join our community:</span>
                    </div>
                    <a
                      href="https://t.me/JharkhandEnginnersHub"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all text-center sm:text-left transition-colors duration-200"
                    >
                      https://t.me/JharkhandEnginnersHub
                    </a>
                  </div>
                  
                  {/* Notifications Row */}
                  <div className="flex items-start space-x-2 justify-center sm:justify-start">
                    <span className="text-green-400 text-lg flex-shrink-0">🔔</span>
                    <span className="text-gray-300 text-center sm:text-left leading-relaxed">
                      Get notifications about beta updates and new features
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            {user ? (
              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                
                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                  >
                    ✅ {message}
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                  >
                    ❌ {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      {fieldLabels.name} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg transition-all duration-200 placeholder-gray-400 ${"bg-gray-700 border-2 border-purple-500/50 text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-purple-400/70"}`}
                      placeholder={"Enter your full name"}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter your full name (2-50 characters, letters and spaces only)
                    </p>
                  </div>

                  {/* Branch */}
                  <div>
                    <label
                      htmlFor="branch"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      {fieldLabels.branch} *
                    </label>
                    <input
                      type="text"
                      id="branch"
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                      placeholder="Your Branch Name"
                      required
                      className={`w-full px-4 py-3 rounded-lg transition-all duration-200 placeholder-gray-400 ${"bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"}`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter your branch/department (e.g., Computer Science, Mechanical Engineering)
                    </p>
                  </div>

                {/* Years of Study */}
                <div>
                  <label
                    htmlFor="yearsOfStudy"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    {fieldLabels.yearsOfStudy} *
                  </label>
                  <select
                    id="yearsOfStudy"
                    name="yearsOfStudy"
                    value={form.yearsOfStudy}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" className="bg-gray-700 text-white">
                      Select Year
                    </option>
                    <option value="1st Year" className="bg-gray-700 text-white">
                      1st Year
                    </option>
                    <option value="2nd Year" className="bg-gray-700 text-white">
                      2nd Year
                    </option>
                    <option value="3rd Year" className="bg-gray-700 text-white">
                      3rd Year
                    </option>
                    <option value="4th Year" className="bg-gray-700 text-white">
                      4th Year
                    </option>
                    <option value="Graduate" className="bg-gray-700 text-white">
                      Graduate
                    </option>
                    <option
                      value="Post Graduate"
                      className="bg-gray-700 text-white"
                    >
                      Post Graduate
                    </option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Select your current year of study or graduation status
                  </p>
                </div>

                {/* Degree */}
                <div>
                  <label
                    htmlFor="degree"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    {fieldLabels.degree} *
                  </label>
                  <select
                    id="degree"
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" className="bg-gray-700 text-white">
                      Select Degree
                    </option>
                    <option value="B.Tech" className="bg-gray-700 text-white">
                      B.Tech
                    </option>
                    <option value="Diploma" className="bg-gray-700 text-white">
                      Diploma
                    </option>
                    <option value="M.Tech" className="bg-gray-700 text-white">
                      M.Tech
                    </option>
                    <option value="MBA" className="bg-gray-700 text-white">
                      MBA
                    </option>
                    <option value="MCA" className="bg-gray-700 text-white">
                      MCA
                    </option>
                    <option value="Other" className="bg-gray-700 text-white">
                      Other
                    </option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    {fieldLabels.email} * {user ? '(Auto-filled from your account)' : '(Will be set from your account after login)'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    readOnly={!!user}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 placeholder-gray-400 ${
                      user 
                        ? 'bg-gray-600 border border-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder={user ? "your.email@example.com" : "Enter your email (will be verified after login)"}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {user 
                      ? 'This email is automatically set from your authenticated account and cannot be changed.'
                      : 'Enter your email address. It will be verified against your account after you sign in. Make sure it matches the email you use to sign in!'
                    }
                    {!user && (
                      <span className="block mt-1 text-yellow-400">
                        ⚠️ The email must be in a valid format (e.g., user@example.com)
                      </span>
                    )}
                  </p>
                </div>

                {/* Telegram ID with Verification */}
                <div>
                  <label
                    htmlFor="telegramId"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    {fieldLabels.telegramId} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="telegramId"
                      name="telegramId"
                      value={form.telegramId}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 pr-12 bg-gray-700 border-2 text-white rounded-lg focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                        verificationStatus === "verified"
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : verificationStatus === "unverified"
                          ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500"
                          : verificationStatus === "not_member"
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : verificationStatus === "checking"
                          ? "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
                          : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                      placeholder="@yourusername"
                    />
                    {/* Verification Status Indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {verificationStatus === "checking" && (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {verificationStatus === "verified" && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {verificationStatus === "unverified" && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {verificationStatus === "not_member" && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Verification Message */}
                  {verificationMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 p-3 rounded-lg text-sm ${
                        verificationStatus === "verified"
                          ? "bg-green-900/30 border border-green-500/30 text-green-400"
                          : verificationStatus === "unverified"
                          ? "bg-yellow-900/30 border border-yellow-500/30 text-yellow-400"
                          : verificationStatus === "not_member"
                          ? "bg-red-900/30 border border-red-500/30 text-red-400"
                          : "bg-blue-900/30 border border-blue-500/30 text-blue-400"
                      }`}
                    >
                      {verificationMessage}
                    </motion.div>
                  )}
                  
                  {/* Telegram ID Format Note */}
                  <p className="text-xs text-gray-400 mt-1">
                    Enter your Telegram username (e.g., @username or username). Must be at least 5 characters long.
                  </p>
                </div>
              </div>
              {/* College/University - Full Width */}
              <div>
                <label
                  htmlFor="collegeName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {fieldLabels.collegeName} *
                </label>
                <select
                  id="collegeName"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select your College/Institute</option>
                  {Object.entries(COLLEGES_LIST).map(([category, colleges]) => (
                    <optgroup key={category} label={category}>
                      {colleges.map((college) => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="other">Other (Not Listed)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Select your college from the list or choose "Other" to specify a different one
                </p>
                {form.collegeName === "other" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Please specify your college/institute name
                    </label>
                    <input
                      type="text"
                      name="otherCollege"
                      value={form.otherCollege || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter your college/institute name"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This field is required when selecting "Other (Not Listed)"
                    </p>
                  </div>
                )}
              </div>

              {/* Refer Code */}
              <div>
                <label
                  htmlFor="referCode"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {fieldLabels.referCode}
                </label>
                <input
                  type="text"
                  id="referCode"
                  name="referCode"
                  value={form.referCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter referral code if you have one"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional: Enter a valid referral code (3-10 characters, letters and numbers only)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || (!!form.telegramId && verificationStatus !== "verified")}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform ${isSubmitting || (form.telegramId && verificationStatus !== "verified")
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : form.telegramId && verificationStatus === "checking" ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Telegram...</span>
                    </div>
                  ) : form.telegramId && verificationStatus !== "verified" ? (
                    "Please verify Telegram membership first"
                  ) : !user ? (
                    "📝 Fill Form & Sign In"
                  ) : (
                    "🚀 Join Beta Program"
                  )}
                </button>
              </div>
            </form>
            ) : (
              /* Login Required Section for Unauthenticated Users */
              <div className="px-8 py-6 text-center">
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6 mb-6">
                  <span className="text-4xl mb-4 block">🔐</span>
                  <h3 className="text-xl font-semibold text-yellow-200 mb-2">
                    Sign In Required
                  </h3>
                  <p className="text-yellow-300 mb-6">
                    You need to sign in to join the beta program
                  </p>
                  <button
                    onClick={() => router.push('/login?redirect=/beta-wishlist')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🎉 Beta Program Benefits:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Direct feedback channel with developers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Exclusive content and study materials</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Priority support and assistance</span>
                </li>
              </ul>
              {!user && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm text-center">
                    💡 <strong>Ready to join?</strong> Sign in to get started!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowVerificationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            {verificationStatus === "not_member" ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Join Our Telegram Community First</h3>
                  <p className="text-gray-300 text-sm">You need to be a member of our Telegram group to register for the beta program.</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-2">📋 Steps to Join:</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">1.</span>
                        <span>Click the button below to join our Telegram group</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">2.</span>
                        <span>Wait a few minutes for our system to sync your membership</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">3.</span>
                        <span>Come back and enter your Telegram username again</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <a
                    href="https://t.me/JharkhandEnginnersHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                    </svg>
                    <span>Join Telegram Group</span>
                  </a>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    I'll join later
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Verification Required</h3>
                  <p className="text-gray-300 text-sm">You're a member of our group but need to verify for beta access.</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">⚡ Quick Verification:</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 font-bold">1.</span>
                        <span>Go to our Telegram group</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 font-bold">2.</span>
                        <span>Send the message: <code className="bg-gray-700 px-1 rounded">/verify</code></span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 font-bold">3.</span>
                        <span>Wait for confirmation, then try again here</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <a
                    href="https://t.me/JharkhandEnginnersHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                    </svg>
                    <span>Open Telegram Group</span>
                  </a>
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      // Re-check verification after modal close
                      if (form.telegramId) {
                        const cleanUsername = form.telegramId.startsWith('@') ? form.telegramId.substring(1) : form.telegramId;
                        if (cleanUsername.length >= 3) {
                          setTimeout(() => verifyTelegramUser(cleanUsername), 1000);
                        }
                      }
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    I've sent /verify - Check again
                  </button>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Duplicate Registration Modal */}
      {showDuplicateModal && duplicateInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDuplicateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {duplicateInfo.type === 'email_exists' ? '📧 Email Already Registered' : '📱 Telegram Account Already Used'}
              </h3>
              <p className="text-gray-300 text-sm">
                {duplicateInfo.type === 'email_exists' 
                  ? 'This email address is already registered for the beta program.'
                  : 'This Telegram account is already registered for the beta program.'}
              </p>
            </div>
            
            {duplicateInfo.existingUser && duplicateInfo.type === 'telegram_exists' && (
              <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4 mb-6">
                <h4 className="text-orange-400 font-semibold mb-3">📋 Registration Details:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registered by:</span>
                    <span className="font-medium">{duplicateInfo.existingUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium">{duplicateInfo.existingUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">College:</span>
                    <span className="font-medium text-xs">{duplicateInfo.existingUser.collegeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registered on:</span>
                    <span className="font-medium">{duplicateInfo.existingUser.registrationDate}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
              <h4 className="text-blue-400 font-semibold mb-2">💡 What you can do:</h4>
              <div className="space-y-2 text-sm text-gray-300">
                {duplicateInfo.type === 'email_exists' ? (
                  <>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">1.</span>
                      <span>Use a different email address to register</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">2.</span>
                      <span>Check if you already registered and visit the <Link href="/wishlist-users" className="text-blue-300 underline">wishlist users page</Link></span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">3.</span>
                      <span>Contact support if you believe this is an error</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">1.</span>
                      <span>Use a different Telegram account to register</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">2.</span>
                      <span>Each person can only register once with one Telegram account</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">3.</span>
                      <span>Contact the person who already used this account if this was a mistake</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/wishlist-users"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>View Wishlist Users</span>
              </Link>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <Footer />
    </>
  );
};

export default WishlistRegistration;
