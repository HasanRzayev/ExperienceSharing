import React from 'react';
import { FaHeart, FaGlobeAmericas, FaUsers, FaRocket } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">About Experience Sharing</h1>
            <p className="text-xl text-blue-100">
              Connecting travelers worldwide through authentic experiences and inspiring stories
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaHeart className="text-purple-600" />
            Our Story
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Experience Sharing was born from a simple idea: everyone has unique travel experiences worth sharing. 
              We believe that the best travel recommendations come from real people who've been there, done that, 
              and want to help others discover the world's hidden gems.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our platform connects travelers from all corners of the globe, creating a community where authentic 
              experiences are shared, friendships are formed, and wanderlust is celebrated. Whether you're planning 
              your next adventure or reminiscing about past journeys, Experience Sharing is your home.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <FaRocket className="text-3xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To inspire and empower travelers by providing a platform where authentic experiences are shared, 
              connections are made, and the world becomes more accessible to everyone.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <FaGlobeAmericas className="text-3xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To become the world's most trusted community for travelers, where every journey is documented, 
              every experience is valued, and every traveler finds their next adventure.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Share Your Stories</h4>
              <p className="text-gray-600">
                Document your travels with photos, descriptions, and tips. Help others discover amazing places 
                through your eyes.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🗺️</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">AI-Powered Recommendations</h4>
              <p className="text-gray-600">
                Get personalized travel suggestions powered by AI. Discover hidden gems and must-visit 
                destinations tailored to your interests.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Connect with Travelers</h4>
              <p className="text-gray-600">
                Chat with fellow travelers, share tips, and build meaningful connections with people who 
                share your passion for exploration.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🌟</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Discover & Explore</h4>
              <p className="text-gray-600">
                Browse curated experiences from around the world. Filter by location, activity type, 
                and popularity to find your perfect adventure.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
          <FaUsers className="text-5xl text-purple-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Community</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We're more than just a platform – we're a global community of passionate travelers, 
            explorers, and adventure seekers. Join thousands of users who are already sharing their 
            experiences and inspiring others to explore the world.
          </p>
          <div className="flex justify-center gap-6 text-lg">
            <div className="bg-white rounded-xl px-6 py-4 shadow-md">
              <div className="text-3xl font-bold text-purple-600 mb-1">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-xl px-6 py-4 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-1">50K+</div>
              <div className="text-gray-600">Experiences Shared</div>
            </div>
            <div className="bg-white rounded-xl px-6 py-4 shadow-md">
              <div className="text-3xl font-bold text-indigo-600 mb-1">150+</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

