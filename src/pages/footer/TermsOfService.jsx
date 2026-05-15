import React from 'react';
import { FaFileContract } from 'react-icons/fa';
import FooterPage from './FooterPage';

const TermsOfService = () => {
  return (
    <FooterPage
      icon={<FaFileContract />}
      title="Terms of Service"
      subtitle="Last updated: October 18, 2025"
      content={
        <div className="space-y-10">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              By accessing and using Experience Sharing, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">2. User Accounts</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              To use certain features of our platform, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Be responsible for all activity under your account</li>
              <li>Notify us immediately of any illegal access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">3. User Content</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You retain all rights to the content you post. By sharing content on our platform, you grant us:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
              <li>A non-exclusive license to display your content</li>
              <li>The right to modify content for formatting purposes</li>
              <li>Permission to share content with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">4. Prohibited Activities</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
              <li>Post false, misleading, or offensive content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any laws or regulations</li>
              <li>Attempt to gain illegal access to our systems</li>
              <li>Use our platform for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">5. Termination</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">6. Limitation of Liability</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Experience Sharing is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">7. Changes to Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We may modify these terms at any time. Continued use of our service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">8. Contact</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Questions about our Terms of Service? Contact us at:{' '}
              <a href="mailto:wanderly.project@gmail.com" className="font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
                wanderly.project@gmail.com
              </a>
            </p>
          </section>
        </div>
      }
    />
  );
};

export default TermsOfService;




