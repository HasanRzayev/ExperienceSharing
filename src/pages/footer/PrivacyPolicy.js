import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <FaShieldAlt className="text-6xl mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-blue-100">Last updated: October 18, 2025</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Name, email address, and profile information</li>
              <li>Travel experiences, photos, and descriptions you share</li>
              <li>Messages and interactions with other users</li>
              <li>Location data (only when you choose to share it)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience and provide recommendations</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure platform safety and prevent misuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal information. We may share your information only:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no method 
              of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:wanderly.project@gmail.com" className="text-purple-600 hover:text-purple-700 font-semibold">
                wanderly.project@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

