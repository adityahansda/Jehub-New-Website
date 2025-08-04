import React from 'react';
import { FileText, Users, Shield, Award, AlertTriangle, Gavel, Mail, Calendar, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Effective Date: August 4, 2025</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to JEHUB! By accessing or using our services, you agree to be bound by these Terms of Service.
          </p>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">1. Eligibility</h2>
          </div>
          <p className="text-gray-700">
            You must be at least 18 years old to use JEHUB. Users must provide accurate registration information.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2. User Conduct</h2>
          </div>
          <p className="text-gray-700 mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Post harmful, misleading, or illegal content</li>
            <li>Infringe upon intellectual property</li>
            <li>Misuse the platform or attempt to harm others</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">3. User Content</h2>
          </div>
          <p className="text-gray-700 mb-4">
            You retain ownership of any content you upload. By uploading, you grant JEHUB a license to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Display, distribute, and promote your content</li>
            <li>Use content for educational and promotional purposes (with credit where applicable)</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">4. Points and Rewards</h2>
          </div>
          <p className="text-gray-700">
            Users may earn points by participating on the platform. JEHUB reserves the right to modify the points system at any time.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">5. Account Suspension</h2>
          </div>
          <p className="text-gray-700">
            We may suspend or terminate accounts for violating these terms or abusing the platform.
          </p>
        </div>

        {/* Section 6 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Gavel className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">6. Liability Disclaimer</h2>
          </div>
          <p className="text-gray-700 mb-4">JEHUB is provided "as-is." We are not responsible for:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Accuracy or legality of user-submitted content</li>
            <li>Technical errors or data loss</li>
            <li>Any damages arising from platform use</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">7. Changes to Terms</h2>
          </div>
          <p className="text-gray-700">
            We may revise these Terms from time to time. Continued use of the platform constitutes your agreement to the updated terms.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Contact Us</h2>
          </div>
          <p className="text-purple-100 mb-4">
            For any questions about these Terms, please email:
          </p>
          <a 
            href="mailto:jharkhandengineershub@gmail.com" 
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            jharkhandengineershub@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

