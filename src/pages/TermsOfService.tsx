import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">Terms of Service</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          These terms of service outline the rules and regulations for the use of JEHUB's Website, located at 
          <a href="https://jehub.in" className="text-blue-500 hover:underline">https://jehub.in</a>.
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceptance of terms</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          By accessing this website we assume you accept these terms and conditions. Do not continue to use the website if you 
          do not agree to take all of the terms and conditions stated on this page.
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cookies</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We employ the use of cookies. By accessing the JEHUB website, you agreed to use cookies in agreement with the JEHUB's 
          Privacy Policy.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Feel free to contact us if you have any questions about our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;

