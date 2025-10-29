import React from 'react';
import { FaPlane, FaMoneyBill, FaCamera, FaHiking, FaUtensils, FaBed } from 'react-icons/fa';

const TravelTips = () => {
  const tips = [
    {
      icon: <FaPlane className="text-3xl" />,
      title: "Planning Your Trip",
      color: "from-purple-500 to-blue-500",
      tips: [
        "Book flights 2-3 months in advance for best prices",
        "Use incognito mode when searching for flights",
        "Consider traveling during shoulder season",
        "Create a flexible itinerary with buffer days"
      ]
    },
    {
      icon: <FaMoneyBill className="text-3xl" />,
      title: "Budget & Money",
      color: "from-blue-500 to-cyan-500",
      tips: [
        "Notify your bank before traveling abroad",
        "Carry multiple payment methods",
        "Use local ATMs for better exchange rates",
        "Keep emergency cash in a safe place"
      ]
    },
    {
      icon: <FaCamera className="text-3xl" />,
      title: "Photography Tips",
      color: "from-cyan-500 to-teal-500",
      tips: [
        "Wake up early for golden hour photos",
        "Respect local photography restrictions",
        "Always ask permission before photographing people",
        "Backup your photos regularly"
      ]
    },
    {
      icon: <FaUtensils className="text-3xl" />,
      title: "Food & Dining",
      color: "from-teal-500 to-green-500",
      tips: [
        "Try local street food (where safe)",
        "Ask locals for restaurant recommendations",
        "Learn basic phrases in local language",
        "Be adventurous but mindful of food safety"
      ]
    },
    {
      icon: <FaBed className="text-3xl" />,
      title: "Accommodation",
      color: "from-green-500 to-emerald-500",
      tips: [
        "Read recent reviews before booking",
        "Check location and transportation access",
        "Confirm check-in times and requirements",
        "Keep important documents in hotel safe"
      ]
    },
    {
      icon: <FaHiking className="text-3xl" />,
      title: "Adventures & Activities",
      color: "from-emerald-500 to-purple-500",
      tips: [
        "Book popular activities in advance",
        "Check weather conditions beforehand",
        "Wear appropriate clothing and footwear",
        "Stay hydrated and bring snacks"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-4">✈️</div>
            <h1 className="text-4xl font-bold mb-4">Travel Tips</h1>
            <p className="text-lg text-blue-100">Expert advice for memorable journeys</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6">
          {tips.map((category, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{category.title}</h3>
              </div>
              <ul className="space-y-3">
                {category.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2">
                    <span className="text-purple-600 text-xl mt-0.5">•</span>
                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Want to share your own tips?</h3>
          <p className="text-gray-700 mb-6">
            Join our community and help fellow travelers make the most of their adventures!
          </p>
          <a
            href="/signup"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Share Your Tips
          </a>
        </div>
      </div>
    </div>
  );
};

export default TravelTips;

