import React, { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';

const WishlistRegistration: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    branch: '',
    yearsOfStudy: '',
    collegeName: '',
    email: '',
    telegramId: '',
    referCode: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldLabels = {
    name: 'Full Name',
    branch: 'Branch/Department',
    yearsOfStudy: 'Year of Study',
    collegeName: 'College Name',
    email: 'Email Address',
    telegramId: 'Telegram ID',
    referCode: 'Referral Code (Optional)'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Clear messages on input change
    if (message) setMessage('');
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/beta-wishlist-sheets', form);
      
      let message = response.data.message;
      // Add referral code success message if applicable
      if (form.referCode && form.referCode.trim()) {
        message += ' Your referral code was valid and the referrer has been awarded 10 points!';
      }
      
      setMessage(message);
      setForm({
        name: '',
        branch: '',
        yearsOfStudy: '',
        collegeName: '',
        email: '',
        telegramId: '',
        referCode: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Beta Wishlist Registration - JEHub</title>
        <meta name="description" content="Join the JEHub Beta Program - Get early access to exclusive features and content." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jehub.in/beta-wishlist" />
      </Head>

      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-600 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Get early access to exclusive features and be part of our growing community
              </p>
            </div>

            {/* Form */}
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
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    {fieldLabels.name} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-purple-500/50 text-white rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 placeholder-gray-400 hover:border-purple-400/70"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-2">
                    {fieldLabels.branch} *
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="e.g., Computer Science, Mechanical"
                  />
                </div>

                {/* Years of Study */}
                <div>
                  <label htmlFor="yearsOfStudy" className="block text-sm font-medium text-gray-300 mb-2">
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
                    <option value="" className="bg-gray-700 text-white">Select Year</option>
                    <option value="1st Year" className="bg-gray-700 text-white">1st Year</option>
                    <option value="2nd Year" className="bg-gray-700 text-white">2nd Year</option>
                    <option value="3rd Year" className="bg-gray-700 text-white">3rd Year</option>
                    <option value="4th Year" className="bg-gray-700 text-white">4th Year</option>
                    <option value="Graduate" className="bg-gray-700 text-white">Graduate</option>
                    <option value="Post Graduate" className="bg-gray-700 text-white">Post Graduate</option>
                  </select>
                </div>

                {/* College Name */}
                <div>
                  <label htmlFor="collegeName" className="block text-sm font-medium text-gray-300 mb-2">
                    {fieldLabels.collegeName} *
                  </label>
                  <input
                    type="text"
                    id="collegeName"
                    name="collegeName"
                    value={form.collegeName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your college name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    {fieldLabels.email} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Telegram ID */}
                <div>
                  <label htmlFor="telegramId" className="block text-sm font-medium text-gray-300 mb-2">
                    {fieldLabels.telegramId} *
                  </label>
                  <input
                    type="text"
                    id="telegramId"
                    name="telegramId"
                    value={form.telegramId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="@yourusername"
                  />
                </div>
              </div>

              {/* Refer Code */}
              <div>
                <label htmlFor="referCode" className="block text-sm font-medium text-gray-300 mb-2">
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
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 text-white font-semibold py-3 px-6 rounded-lg hover:via-yellow-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Join Beta Program</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎉 Beta Program Benefits:</h3>
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
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default WishlistRegistration;

