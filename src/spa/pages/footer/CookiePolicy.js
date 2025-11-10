import React from 'react';
import FooterPage from './FooterPage';

const CookiePolicy = () => {
  const content = (
    <div className="space-y-6 text-gray-700">
      <p className="leading-relaxed">
        Experience Sharing uses cookies to enhance your experience, analyze site traffic, and personalize content.
      </p>
      
      <h3 className="text-xl font-bold text-gray-800 mt-6">What are cookies?</h3>
      <p className="leading-relaxed">
        Cookies are small text files stored on your device when you visit our website. They help us remember your 
        preferences and improve your experience.
      </p>

      <h3 className="text-xl font-bold text-gray-800 mt-6">Types of cookies we use:</h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li><strong>Essential cookies:</strong> Required for the site to function (login, navigation)</li>
        <li><strong>Analytics cookies:</strong> Help us understand how you use our site</li>
        <li><strong>Preference cookies:</strong> Remember your settings and choices</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 mt-6">Managing cookies:</h3>
      <p className="leading-relaxed">
        You can control cookies through your browser settings. However, disabling certain cookies may affect 
        your ability to use some features of our platform.
      </p>
    </div>
  );

  return <FooterPage icon="🍪" title="Cookie Policy" subtitle="How we use cookies" content={content} />;
};

export default CookiePolicy;

