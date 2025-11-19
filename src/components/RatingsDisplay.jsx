import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getApiBaseUrl } from '../utils/env';

const RatingsDisplay = ({ experienceId, refreshTrigger }) => {
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const token = Cookies.get('token');

  const currentUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        payload.userId ||
        payload.id ||
        payload.sub ||
        null
      );
    } catch (error) {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!experienceId) {
      setRatingsData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchRatings();
  }, [experienceId, refreshTrigger]);

  const fetchRatings = async () => {
    if (!experienceId) return;
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(
        `${apiBaseUrl}/Rating/experience/${experienceId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // Normalize response data structure
      const data = response.data;
      setRatingsData({
        ratings: data.ratings || data.Ratings || [],
        averages: data.averages || data.Averages || {
          overall: 0,
          location: 0,
          value: 0,
          service: 0,
          cleanliness: 0,
          accuracy: 0
        },
        totalCount: data.totalCount || data.TotalCount || 0
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatingsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (ratingId) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      await axios.post(
        `${apiBaseUrl}/Rating/${ratingId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRatings(); // Refresh
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleDelete = async (ratingId) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (!window.confirm('Bu reytinqi silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      setDeletingId(ratingId);
      const apiBaseUrl = getApiBaseUrl();
      await axios.delete(`${apiBaseUrl}/Rating/${ratingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRatings();
      alert('Reytinq silindi.');
    } catch (error) {
      console.error('Error deleting rating:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Reytinq silinərkən xəta baş verdi.';
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading ratings...</div>;
  }

  if (!ratingsData || ratingsData.totalCount === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Bu təcrübəyə hələ qiymət verilməyib</p>
      </div>
    );
  }

  const { ratings, averages, totalCount } = ratingsData;

  const CategoryBar = ({ label, average, icon }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm w-24 text-gray-600 dark:text-gray-400">
        {icon} {label}
      </span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full transition-all"
          style={{ width: `${(average / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-white w-8">
        {average.toFixed(1)}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-800 dark:text-white">
                {averages.overall.toFixed(1)}
              </span>
              <span className="text-2xl text-yellow-400">⭐</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {totalCount} qiymətləndirmə
            </p>
          </div>
        </div>

        {/* Category Averages */}
        {(averages.location > 0 || averages.value > 0 || averages.service > 0) && (
          <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {averages.location > 0 && <CategoryBar label="Məkan" average={averages.location} icon="📍" />}
            {averages.value > 0 && <CategoryBar label="Dəyər" average={averages.value} icon="💰" />}
            {averages.service > 0 && <CategoryBar label="Xidmət" average={averages.service} icon="👨‍💼" />}
            {averages.cleanliness > 0 && <CategoryBar label="Təmizlik" average={averages.cleanliness} icon="✨" />}
            {averages.accuracy > 0 && <CategoryBar label="Dəqiqlik" average={averages.accuracy} icon="✓" />}
          </div>
        )}
      </div>

      {/* Individual Ratings */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Rəylər</h3>
        
        {ratings.map((rating) => {
          const ratingId = rating.id || rating.Id;
          const overallRating = rating.overallRating || rating.OverallRating || 0;
          const review = rating.review || rating.Review;
          const helpfulCount = rating.helpfulCount || rating.HelpfulCount || 0;
          const createdAt = rating.createdAt || rating.CreatedAt;
          const userName = rating.user?.userName || rating.user?.UserName || "Unknown";
          const profileImage = rating.user?.profileImage || rating.user?.ProfileImage || 'https://via.placeholder.com/40';
          const ownerId = rating.user?.id || rating.user?.Id || rating.userId || rating.UserId;
          const canDelete = currentUserId && ownerId && currentUserId.toString() === ownerId.toString();

          return (
            <div key={ratingId} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={profileImage}
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {createdAt ? new Date(createdAt).toLocaleDateString('az-AZ') : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-lg">⭐</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {overallRating}
                  </span>
                </div>
              </div>

              {review && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {review}
                </p>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleHelpful(ratingId)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>Faydalı ({helpfulCount})</span>
                </button>

                {canDelete && (
                  <button
                    onClick={() => handleDelete(ratingId)}
                    disabled={deletingId === ratingId}
                    className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === ratingId ? 'Silinir...' : 'Sil'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingsDisplay;

