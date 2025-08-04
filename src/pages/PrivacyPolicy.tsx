import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">Privacy Policy</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your privacy is important to us. It is JEHUB's policy to respect your privacy regarding any information we may collect from you across our website, <a href="https://jehub.in" className="text-blue-500 hover:underline">https://jehub.in</a>, and other sites we own and operate.
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Information we collect</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How we use your information</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We collect and use personal information solely for fulfilling those purposes specified by us and for other ancillary purposes, unless we obtain your consent or as required by law.
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Security of your information</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We take all reasonable steps to protect your information from misuse, loss, or unauthorized access, including by means of firewalls, data encryption, and access controls.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Feel free to contact us if you have any questions about how we handle user data and personal information.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

