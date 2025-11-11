import React from 'react';
import FooterPage from './FooterPage';

const CommunityGuidelines = () => {
  const content = (
    <div className="space-y-6 text-gray-700">
      <p className="text-lg leading-relaxed">
        Our community thrives on respect, authenticity, and shared passion for travel. Please follow these guidelines to keep Experience Sharing a welcoming place for everyone.
      </p>
      
      <h3 className="text-xl font-bold text-gray-800 mt-8">✅ Do:</h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Share authentic and honest experiences</li>
        <li>Be respectful and kind to all users</li>
        <li>Give credit when using others' recommendations</li>
        <li>Report inappropriate content or behavior</li>
        <li>Help fellow travelers with helpful tips</li>
        <li>Respect cultural differences and local customs</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 mt-8">❌ Don't:</h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Post false, misleading, or exaggerated information</li>
        <li>Harass, bully, or discriminate against others</li>
        <li>Share inappropriate, offensive, or illegal content</li>
        <li>Spam or advertise without permission</li>
        <li>Violate others' privacy or intellectual property</li>
        <li>Create fake accounts or impersonate others</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Consequences:</h3>
      <p className="leading-relaxed">
        Violations of these guidelines may result in content removal, account suspension, or permanent ban, 
        depending on the severity of the violation.
      </p>

      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mt-8 rounded">
        <p className="text-gray-700">
          <strong>Remember:</strong> We're all travelers at heart. Treat others the way you'd want to be treated 
          on your journey. Together, we build a community that inspires and supports.
        </p>
      </div>
    </div>
  );

  return <FooterPage icon="🤝" title="Community Guidelines" subtitle="Building a respectful community together" content={content} />;
};

export default CommunityGuidelines;

