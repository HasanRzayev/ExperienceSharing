import React from 'react';
import { FaFileContract } from 'react-icons/fa';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <FaFileContract className="text-6xl mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-blue-100">Last updated: October 18, 2025</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Experience Sharing, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use certain features of our platform, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Be responsible for all activity under your account</li>
              <li>Notify us immediately of any illegal access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain all rights to the content you post. By sharing content on our platform, you grant us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>A non-exclusive license to display your content</li>
              <li>The right to modify content for formatting purposes</li>
              <li>Permission to share content with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Post false, misleading, or offensive content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any laws or regulations</li>
              <li>Attempt to gain illegal access to our systems</li>
              <li>Use our platform for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of 
              these terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Experience Sharing is provided "as is" without warranties of any kind. We are not liable 
              for any damages arising from your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these terms at any time. Continued use of our service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Questions about our Terms of Service? Contact us at:
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

export default TermsOfService;

