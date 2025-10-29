import React from 'react';
import { FaUserPlus, FaCamera, FaHeart, FaComments, FaMapMarkedAlt, FaRobot } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaUserPlus className="text-4xl" />,
      title: "1. Create Your Account",
      description: "Sign up in seconds using your email or Google account. It's completely free!",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: <FaCamera className="text-4xl" />,
      title: "2. Share Your Experiences",
      description: "Upload photos and share stories from your travels. Add locations, descriptions, and tags to help others discover your adventures.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaMapMarkedAlt className="text-4xl" />,
      title: "3. Discover New Places",
      description: "Browse experiences from travelers worldwide. Use filters to find destinations that match your interests and travel style.",
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: <FaRobot className="text-4xl" />,
      title: "4. Get AI Recommendations",
      description: "Use our AI Travel Guide to get personalized suggestions for activities, restaurants, and hidden gems at any destination.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: <FaHeart className="text-4xl" />,
      title: "5. Like & Comment",
      description: "Engage with the community by liking posts and leaving comments. Share your own tips and experiences.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaComments className="text-4xl" />,
      title: "6. Connect with Travelers",
      description: "Follow other travelers, send messages, and build lasting connections with people who share your passion for exploration.",
      color: "from-emerald-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">How It Works</h1>
            <p className="text-lg text-blue-100">Your journey starts here - in just 6 simple steps</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-white`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to Start Your Journey?</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Join thousands of travelers sharing their experiences worldwide
            </p>
            <a
              href="/signup"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

