import React from 'react';

const FooterPage = ({ icon, title, subtitle, content }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-4">{icon}</div>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {subtitle && <p className="text-lg text-blue-100">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {content}
        </div>
      </div>
    </div>
  );
};

export default FooterPage;

