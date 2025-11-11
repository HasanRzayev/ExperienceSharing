import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button at the top of the page. You can register using your email or sign up with Google for quick access."
    },
    {
      question: "Is Experience Sharing free to use?",
      answer: "Yes! Experience Sharing is completely free. You can share unlimited experiences, connect with travelers, and explore destinations at no cost."
    },
    {
      question: "How do I share my travel experience?",
      answer: "Once logged in, click on the 'Share' button in the navigation bar. Upload photos, add a description, location, and tags to share your experience with the community."
    },
    {
      question: "Can I edit or delete my posts?",
      answer: "Yes! You can edit or delete your posts anytime from your profile page or directly from the post card using the edit/delete buttons."
    },
    {
      question: "How does the AI Travel Guide work?",
      answer: "The AI Travel Guide uses Google's Gemini AI to provide personalized recommendations. Simply enter your destination, and get curated suggestions for activities, restaurants, photo spots, and local tips."
    },
    {
      question: "Can I message other users?",
      answer: "Yes! You can send messages to users you follow or who follow you. Go to the Messages page and start a conversation."
    },
    {
      question: "How do I follow other travelers?",
      answer: "Visit a user's profile and click the 'Follow' button. You'll see their posts in your Feed and can message them directly."
    },
    {
      question: "What file types can I upload?",
      answer: "You can upload images (JPG, PNG, GIF), videos (MP4, AVI, MOV), and audio files (MP3, WAV). Maximum file size is 10MB per file."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page. Enter your email, and we'll send you a password reset link."
    },
    {
      question: "Can I use Experience Sharing on mobile?",
      answer: "Yes! Our platform is fully responsive and works great on all devices - phones, tablets, and desktops."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Click the 'Report' button on any post or message. Our team reviews all reports and takes appropriate action within 24 hours."
    },
    {
      question: "Can I share experiences privately?",
      answer: "Currently, all shared experiences are public. Private sharing is planned for future updates. You can share experiences directly with specific users via chat."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <FaQuestionCircle className="text-6xl mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-blue-100">Find answers to common questions about Experience Sharing</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-800 text-left">{faq.question}</h3>
                {openIndex === index ? (
                  <FaChevronUp className="text-purple-600 text-xl flex-shrink-0 ml-4" />
                ) : (
                  <FaChevronDown className="text-gray-400 text-xl flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Still have questions?</h3>
          <p className="text-gray-700 mb-6">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

