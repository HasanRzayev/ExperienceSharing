import React from 'react';
import FooterPage from './FooterPage';

const HelpCenter = () => {
  const content = (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Help Center</h2>
        <p className="text-gray-700 leading-relaxed">
          Find answers to common questions and learn how to make the most of Experience Sharing.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>Creating and setting up your account</li>
          <li>Completing your profile</li>
          <li>Understanding the platform features</li>
          <li>Privacy and security settings</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Sharing Experiences</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>How to create a post</li>
          <li>Adding photos and descriptions</li>
          <li>Using tags and locations</li>
          <li>Editing and deleting posts</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Community Features</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>Following other travelers</li>
          <li>Liking and commenting on posts</li>
          <li>Sending messages</li>
          <li>Sharing experiences via chat</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Need More Help?</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Can't find what you're looking for? Visit our <a href="/faq" className="text-purple-600 hover:text-purple-700 font-semibold">FAQ page</a> or <a href="/contact" className="text-purple-600 hover:text-purple-700 font-semibold">contact us</a> directly.
        </p>
      </section>
    </div>
  );

  return <FooterPage icon="🆘" title="Help Center" subtitle="We're here to help you!" content={content} />;
};

export default HelpCenter;

