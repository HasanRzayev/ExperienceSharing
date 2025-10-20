import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchRecommendations();
    }
  }, [token]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.get(
        `${apiBaseUrl}/AIRecommendation/for-you?count=6`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🤖</span>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Sizin üçün Tövsiyələr
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Sizin üçün Tövsiyələr
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI ilə seçilmiş şəxsi tövsiyələr
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
            ⚡ AI POWERED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((exp) => (
          <div
            key={exp.id}
            onClick={() => navigate(`/card/${exp.id}`)}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              {exp.imageUrls && exp.imageUrls.length > 0 ? (
                <img
                  src={exp.imageUrls[0].url}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🌍
                </div>
              )}
              
              {/* AI Badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <span>🤖</span> AI Pick
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 line-clamp-1">
                {exp.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="line-clamp-1">{exp.location}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    ❤️ {exp.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {exp.commentCount || 0}
                  </span>
                </div>
                <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Bax →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 Bəyənmələrinizə və maraqlarınıza əsasən AI tərəfindən seçilmişdir
        </p>
      </div>
    </div>
  );
};

export default AIRecommendations;

