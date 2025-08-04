import React from 'react';
import { Shield, Lock, Eye, UserCheck, Mail, Calendar } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Effective Date: August 4, 2025</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            At JEHUB, we respect your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you interact with our platform.
          </p>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
          </div>
          <p className="text-gray-700 mb-4">We may collect:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Personal data (name, email, branch, semester, etc.)</li>
            <li>Uploaded content (notes, comments, feedback)</li>
            <li>Usage data (log data, device type, IP address)</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Data</h2>
          </div>
          <p className="text-gray-700 mb-4">We use the collected data to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Provide and improve our services</li>
            <li>Manage user accounts and rewards</li>
            <li>Communicate updates, offers, or important information</li>
            <li>Monitor user activity for safety and platform integrity</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">We may use cookies or similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Enhance user experience</li>
            <li>Remember your preferences</li>
            <li>Analyze platform usage</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Sharing Your Information</h2>
          <p className="text-gray-700 mb-4">We do not sell your personal data. Data may be shared with:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Service providers (e.g., for analytics, hosting)</li>
            <li>Legal authorities if required by law</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
          </div>
          <p className="text-gray-700">
            We implement appropriate security measures to protect your data. However, no method of transmission over the internet is 100% secure.
          </p>
        </div>

        {/* Section 6 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Access, correct, or delete your data</li>
            <li>Opt out of communications</li>
            <li>Request data portability</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Children's Privacy</h2>
          <p className="text-gray-700">
            Our services are not intended for users under the age of 18. We do not knowingly collect data from minors.
          </p>
        </div>

        {/* Section 8 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this policy occasionally. Changes will be posted on this page.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Contact Us</h2>
          </div>
          <p className="text-blue-100 mb-4">
            If you have questions about this Privacy Policy, contact us at:
          </p>
          <a 
            href="mailto:jharkhandengineershub@gmail.com" 
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            jharkhandengineershub@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

