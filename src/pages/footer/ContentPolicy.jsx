import React from 'react';
import FooterPage from './FooterPage';

const ContentPolicy = () => {
  const content = (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-bold text-gray-800">Content Standards</h3>
      <p className="leading-relaxed">
        All content shared on Experience Sharing must meet our community standards. This policy outlines what is and isn't allowed.
      </p>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Allowed Content:</h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Travel experiences and personal stories</li>
        <li>Photos and videos from your trips</li>
        <li>Helpful tips and recommendations</li>
        <li>Cultural insights and observations</li>
        <li>Restaurant and accommodation reviews</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Prohibited Content:</h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Hate speech, discrimination, or harassment</li>
        <li>Violent, graphic, or disturbing content</li>
        <li>Nudity or sexually explicit material</li>
        <li>False information or misleading claims</li>
        <li>Spam, advertisements, or promotional content</li>
        <li>Content that violates copyright or intellectual property</li>
        <li>Personal information of others without consent</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Content Moderation:</h3>
      <p className="leading-relaxed">
        Our team reviews reported content and may remove material that violates this policy. 
        We use AI moderation tools to help identify problematic content quickly.
      </p>

      <h3 className="text-xl font-bold text-gray-800 mt-8">Reporting:</h3>
      <p className="leading-relaxed">
        If you see content that violates our policy, please report it. We investigate all reports 
        and take appropriate action within 24 hours.
      </p>
    </div>
  );

  return <FooterPage icon="📋" title="Content Guidelines" subtitle="What you can and can't post" content={content} />;
};

export default ContentPolicy;

