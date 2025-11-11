import React from 'react';
import FooterPage from './FooterPage';

const DMCA = () => {
  const content = (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-bold text-gray-800">Digital Millennium Copyright Act (DMCA) Policy</h3>
      <p className="leading-relaxed">
        Experience Sharing respects the intellectual property rights of others and expects our users to do the same.
      </p>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Copyright Infringement:</h3>
      <p className="leading-relaxed">
        If you believe that your copyrighted work has been used on our platform without authorization, please notify us with:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
        <li>Identification of the copyrighted work</li>
        <li>URL or location of the infringing material</li>
        <li>Your contact information</li>
        <li>A statement of good faith belief</li>
        <li>Your physical or electronic signature</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Submitting a Claim:</h3>
      <p className="leading-relaxed">
        Send DMCA notices to:
        <br /><br />
        <strong>Email:</strong> <a href="mailto:wanderly.project@gmail.com" className="text-purple-600 hover:text-purple-700 font-semibold">wanderly.project@gmail.com</a>
        <br />
        <strong>Subject:</strong> DMCA Takedown Request
      </p>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Response Time:</h3>
      <p className="leading-relaxed">
        We investigate all valid DMCA claims and remove infringing content within 48 hours.
      </p>
    </div>
  );

  return <FooterPage icon="⚖️" title="DMCA Policy" subtitle="Copyright protection" content={content} />;
};

export default DMCA;

