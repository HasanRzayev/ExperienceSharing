import React from 'react';
import FooterPage from './FooterPage';

const Featured = () => {
  const content = (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-bold text-gray-800">Featured Experiences</h3>
      <p className="leading-relaxed">
        Discover our curated collection of the most inspiring travel experiences shared by our community.
      </p>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mt-8">
        <h4 className="text-lg font-bold text-gray-800 mb-4">This Week's Top Experiences</h4>
        <p className="text-gray-700">
          Visit our <a href="/explore" className="text-purple-600 hover:text-purple-700 font-semibold">Explore page</a> to browse the most popular and highly-rated experiences from around the world.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="border-l-4 border-purple-500 pl-4">
          <h4 className="font-bold text-gray-800 mb-2">🏆 Most Liked</h4>
          <p className="text-gray-600 text-sm">Experiences that captured hearts</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-800 mb-2">🔥 Trending Now</h4>
          <p className="text-gray-600 text-sm">Currently popular destinations</p>
        </div>
        <div className="border-l-4 border-cyan-500 pl-4">
          <h4 className="font-bold text-gray-800 mb-2">⭐ Top Rated</h4>
          <p className="text-gray-600 text-sm">Highest-rated experiences</p>
        </div>
        <div className="border-l-4 border-teal-500 pl-4">
          <h4 className="font-bold text-gray-800 mb-2">🆕 Recently Added</h4>
          <p className="text-gray-600 text-sm">Fresh new adventures</p>
        </div>
      </div>
    </div>
  );

  return <FooterPage icon="⭐" title="Featured Experiences" subtitle="Discover the best of our community" content={content} />;
};

export default Featured;

