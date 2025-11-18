import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaHiking, FaLandmark, FaCamera, FaUtensils, FaSpa, FaParachuteBox } from "react-icons/fa";
import { MdExplore } from "react-icons/md";
import { GoogleGenerativeAI } from "@google/generative-ai";

function TravelGuide() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");

  const categories = [
    { 
      icon: FaHiking, 
      title: "Nature & Hiking", 
      color: "from-green-500 to-emerald-600",
      emoji: "🏞️"
    },
    { 
      icon: FaLandmark, 
      title: "Cultural & Historical", 
      color: "from-amber-500 to-orange-600",
      emoji: "🏛️"
    },
    { 
      icon: FaCamera, 
      title: "Entertainment & Social", 
      color: "from-purple-500 to-pink-600",
      emoji: "📸"
    },
    { 
      icon: FaUtensils, 
      title: "Food & Dining", 
      color: "from-red-500 to-rose-600",
      emoji: "🍽️"
    },
    { 
      icon: FaSpa, 
      title: "Relaxation & Wellness", 
      color: "from-blue-500 to-cyan-600",
      emoji: "🧘‍♂️"
    },
    { 
      icon: FaParachuteBox, 
      title: "Adventure & Sports", 
      color: "from-orange-500 to-red-600",
      emoji: "🚤"
    }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations(null);

    try {
      // Use REACT_APP_ prefix as setupProcessEnv.ts handles it
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your environment variables.");
      }

      const prompt = `You are a travel guide assistant. Provide detailed travel recommendations for "${location}".

Please provide information in the following categories (use exactly these headings):

🏞️ Nature & Hiking Activities:
List specific places, trails, parks, beaches, lakes, or natural attractions. Include what makes each special.

🏛️ Cultural & Historical Sites:
List museums, historical landmarks, ancient sites, religious buildings, and cultural attractions with brief descriptions.

📸 Entertainment & Social Activities:
List entertainment venues, clubs, bars, photo spots, shopping areas, and social meeting places.

🍽️ Food & Dining:
List famous restaurants, local cuisine to try, food markets, cafes, and unique dining experiences.

🧘‍♂️ Relaxation & Wellness:
List spas, wellness centers, yoga studios, peaceful spots, and relaxation activities.

🚤 Adventure & Sports:
List adventure activities like diving, kayaking, zip-lining, skiing, water sports, and extreme sports available.

📍 Best Photo Spots:
List the most Instagram-worthy locations for photography.

💡 Local Tips:
Provide 3-5 essential tips for visiting this location.

Format each section clearly with bullet points. Be specific with names and locations where possible.`;

      // Initialize Gemini AI with latest stable configuration
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Try models in order of preference with retry mechanism
      const models = ["gemini-1.5-flash", "gemini-pro", "gemini-2.5-flash"];
      let lastError = null;
      let text = null;

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 2048,
            },
          });

          // Generate content with retry logic
          let attempts = 0;
          const maxRetries = 3;
          const retryDelay = 2000; // 2 seconds

          while (attempts < maxRetries) {
            try {
              const result = await model.generateContent(prompt);
              const response = await result.response;
              text = response.text();
              break; // Success, exit retry loop
            } catch (err) {
              attempts++;
              lastError = err;
              
              // If it's a 503 or overloaded error and we have retries left, wait and retry
              if (attempts < maxRetries && (
                err.message?.includes("503") || 
                err.message?.includes("overloaded") ||
                err.message?.includes("quota")
              )) {
                console.log(`Model ${modelName} overloaded, retrying attempt ${attempts}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
                continue;
              }
              throw err; // Re-throw if not retryable or out of retries
            }
          }

          if (text) break; // Success with this model, exit model loop
        } catch (err) {
          lastError = err;
          console.log(`Model ${modelName} failed, trying next model...`);
          continue; // Try next model
        }
      }
      
      if (!text) {
        throw lastError || new Error("No recommendations received from AI after trying all available models.");
      }

      setRecommendations(parseRecommendations(text));
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      
      let errorMessage = "Failed to fetch recommendations. ";
      
      if (err.message?.includes("API key") || err.message?.includes("401") || err.message?.includes("403")) {
        errorMessage += "Please check your API key in the environment variables.";
      } else if (err.message?.includes("503") || err.message?.includes("overloaded")) {
        errorMessage += "The AI service is currently overloaded. Please wait a moment and try again.";
      } else if (err.message?.includes("404") || err.message?.includes("not found")) {
        errorMessage += "The AI model is currently unavailable. Please check your API key permissions and ensure Gemini API is enabled in Google Cloud Console.";
      } else if (err.message?.includes("quota") || err.message?.includes("429")) {
        errorMessage += "API quota exceeded. Please try again later or upgrade your API plan.";
      } else {
        errorMessage += err.message || "An unexpected error occurred. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const parseRecommendations = (text) => {
    const sections = {
      nature: "",
      cultural: "",
      entertainment: "",
      food: "",
      relaxation: "",
      adventure: "",
      photoSpots: "",
      tips: ""
    };

    // Split by emoji headers
    const natureSplit = text.split(/🏞️\s*Nature\s*&\s*Hiking\s*Activities?:/i);
    const culturalSplit = text.split(/🏛️\s*Cultural\s*&\s*Historical\s*Sites?:/i);
    const entertainmentSplit = text.split(/📸\s*Entertainment\s*&\s*Social\s*Activities?:/i);
    const foodSplit = text.split(/🍽️\s*Food\s*&\s*Dining:/i);
    const relaxationSplit = text.split(/🧘‍♂️\s*Relaxation\s*&\s*Wellness:/i);
    const adventureSplit = text.split(/🚤\s*Adventure\s*&\s*Sports:/i);
    const photoSplit = text.split(/📍\s*Best\s*Photo\s*Spots?:/i);
    const tipsSplit = text.split(/💡\s*Local\s*Tips?:/i);

    if (natureSplit.length > 1) {
      sections.nature = natureSplit[1].split(/🏛️|📸|🍽️|🧘‍♂️|🚤|📍|💡/)[0].trim();
    }
    if (culturalSplit.length > 1) {
      sections.cultural = culturalSplit[1].split(/📸|🍽️|🧘‍♂️|🚤|📍|💡/)[0].trim();
    }
    if (entertainmentSplit.length > 1) {
      sections.entertainment = entertainmentSplit[1].split(/🍽️|🧘‍♂️|🚤|📍|💡/)[0].trim();
    }
    if (foodSplit.length > 1) {
      sections.food = foodSplit[1].split(/🧘‍♂️|🚤|📍|💡/)[0].trim();
    }
    if (relaxationSplit.length > 1) {
      sections.relaxation = relaxationSplit[1].split(/🚤|📍|💡/)[0].trim();
    }
    if (adventureSplit.length > 1) {
      sections.adventure = adventureSplit[1].split(/📍|💡/)[0].trim();
    }
    if (photoSplit.length > 1) {
      sections.photoSpots = photoSplit[1].split(/💡/)[0].trim();
    }
    if (tipsSplit.length > 1) {
      sections.tips = tipsSplit[1].trim();
    }

    return sections;
  };

  // Format markdown text to HTML
  const formatMarkdown = (text) => {
    if (!text) return null;
    
    // Split by lines
    const lines = text.split('\n');
    const formatted = [];
    
    lines.forEach((line, index) => {
      if (!line.trim()) {
        formatted.push(<br key={`br-${index}`} />);
        return;
      }
      
      // Parse bullet points
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const content = line.replace(/^[\*\-]\s*/, '');
        // Parse bold text **text**
        const parts = content.split(/\*\*(.+?)\*\*/g);
        
        formatted.push(
          <div key={index} className="flex gap-3 mb-3">
            <span className="text-purple-600 font-bold text-lg mt-1">•</span>
            <div className="flex-1">
              {parts.map((part, i) => 
                i % 2 === 1 ? (
                  <strong key={i} className="font-bold text-gray-900 dark:text-gray-100">{part}</strong>
                ) : (
                  <span key={i} className="text-gray-800 dark:text-gray-200">{part}</span>
                )
              )}
            </div>
          </div>
        );
      } else {
        // Regular text with bold parsing
        const parts = line.split(/\*\*(.+?)\*\*/g);
        formatted.push(
          <p key={index} className="mb-2">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={i} className="font-bold text-gray-900 dark:text-gray-100">{part}</strong>
              ) : (
                <span key={i} className="text-gray-800 dark:text-gray-200">{part}</span>
              )
            )}
          </p>
        );
      }
    });
    
    return formatted;
  };

  const renderSection = (title, content, icon, color, emoji) => {
    if (!content) return null;

    const Icon = icon;
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 animate-fadeInUp border-l-4 border-transparent hover:border-purple-500">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-100">
          <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-transform`}>
            {emoji}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">
          {formatMarkdown(content)}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce shadow-2xl">
              <MdExplore className="text-6xl" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100">
            AI Travel Guide
          </h1>
          <p className="text-2xl text-blue-50 mb-10 font-light">
            Discover amazing activities and hidden gems powered by AI
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400 text-xl" />
              </div>
              <input
                type="text"
                placeholder="Where do you want to explore? (e.g., Paris, Bali, Tokyo, Baku...)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-16 pr-36 py-6 text-xl rounded-full border-4 border-white/80 backdrop-blur-lg bg-white/95 shadow-2xl focus:ring-4 focus:ring-white/50 focus:border-white outline-none transition-all text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Searching...</span>
                  </>
                ) : (
                  <>
                    <FaSearch className="text-xl" />
                    <span className="text-lg">Explore</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-800 font-bold text-lg mb-2">Oops! Something went wrong</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <MdExplore className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-purple-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              Exploring {location}...
            </h3>
            <p className="text-gray-600 text-lg mb-4">
              Our AI is discovering the best activities and hidden gems for you
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Preview */}
      {!recommendations && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              What You'll Discover
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Enter any location and get AI-powered recommendations across six amazing categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-2 border-transparent hover:border-purple-200 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                    {category.emoji}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get personalized recommendations for the best {category.title.toLowerCase()} experiences
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {recommendations && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold shadow-lg">
              ✨ AI Recommendations
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Your Guide to {location}
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Personalized recommendations powered by Google Gemini AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderSection(
              "Nature & Hiking Activities",
              recommendations.nature,
              FaHiking,
              "from-green-500 to-emerald-600",
              "🏞️"
            )}
            {renderSection(
              "Cultural & Historical Sites",
              recommendations.cultural,
              FaLandmark,
              "from-amber-500 to-orange-600",
              "🏛️"
            )}
            {renderSection(
              "Entertainment & Social",
              recommendations.entertainment,
              FaCamera,
              "from-purple-500 to-pink-600",
              "📸"
            )}
            {renderSection(
              "Food & Dining",
              recommendations.food,
              FaUtensils,
              "from-red-500 to-rose-600",
              "🍽️"
            )}
            {renderSection(
              "Relaxation & Wellness",
              recommendations.relaxation,
              FaSpa,
              "from-blue-500 to-cyan-600",
              "🧘‍♂️"
            )}
            {renderSection(
              "Adventure & Sports",
              recommendations.adventure,
              FaParachuteBox,
              "from-orange-500 to-red-600",
              "🚤"
            )}
          </div>

          {/* Photo Spots */}
          {recommendations.photoSpots && (
            <div className="mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white transform hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-white/30">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaCamera className="text-4xl" />
                </div>
                <h3 className="text-3xl font-bold">Best Photo Spots</h3>
              </div>
              <div className="text-lg leading-relaxed">
                {formatMarkdown(recommendations.photoSpots)}
              </div>
            </div>
          )}

          {/* Local Tips */}
          {recommendations.tips && (
            <div className="mt-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white transform hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-white/30">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-5xl">💡</span>
                </div>
                <h3 className="text-3xl font-bold">Local Tips</h3>
              </div>
              <div className="text-lg leading-relaxed">
                {formatMarkdown(recommendations.tips)}
              </div>
            </div>
          )}

          {/* Search Again Button */}
          <div className="text-center mt-16 mb-8">
            <button
              onClick={() => {
                setRecommendations(null);
                setLocation("");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <FaSearch className="text-2xl group-hover:rotate-12 transition-transform" />
              <span>Explore Another Destination</span>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333EA, #4F46E5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7E22CE, #4338CA);
        }
      `}</style>
    </main>
  );
}

export default TravelGuide;

