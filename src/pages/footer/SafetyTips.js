import React from 'react';
import FooterPage from './FooterPage';

const SafetyTips = () => {
  const content = (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Travel Safety Guidelines</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Your safety is our top priority. Follow these tips to ensure a safe and enjoyable travel experience.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Before You Travel</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>Research your destination thoroughly</li>
          <li>Check travel advisories and local laws</li>
          <li>Make copies of important documents</li>
          <li>Share your itinerary with family or friends</li>
          <li>Get appropriate travel insurance</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">While Traveling</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>Stay aware of your surroundings</li>
          <li>Keep valuables secure and out of sight</li>
          <li>Use trusted transportation services</li>
          <li>Stay in well-reviewed accommodations</li>
          <li>Keep emergency contacts handy</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Online Safety</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>Don't share sensitive personal information publicly</li>
          <li>Be cautious when meeting people from online</li>
          <li>Verify information before trusting recommendations</li>
          <li>Report suspicious behavior or content</li>
          <li>Use strong, unique passwords</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Health & Emergency</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>Keep necessary medications with you</li>
          <li>Know local emergency numbers</li>
          <li>Have your embassy contact information</li>
          <li>Get recommended vaccinations</li>
          <li>Carry a first-aid kit</li>
        </ul>
      </section>
    </div>
  );

  return <FooterPage icon="🛡️" title="Safety Tips" subtitle="Travel smart, stay safe" content={content} />;
};

export default SafetyTips;

