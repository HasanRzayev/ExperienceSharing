import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getApiBaseUrl } from '../utils/env';

const RatingComponent = ({ experienceId, onRatingSubmit }) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    location: 0,
    value: 0,
    service: 0,
    cleanliness: 0,
    accuracy: 0
  });
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const token = Cookies.get('token');

  const ratingCategories = [
    { key: 'overall', label: 'Overall', icon: '⭐', required: true },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'value', label: 'Value', icon: '💰' },
    { key: 'service', label: 'Service', icon: '👨‍💼' },
    { key: 'cleanliness', label: 'Cleanliness', icon: '✨' },
    { key: 'accuracy', label: 'Accuracy', icon: '✓' }
  ];

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('🔒 Please log in to submit ratings.\n\nClick OK to go to the login page.');
      window.location.href = '/login';
      return;
    }

    if (!experienceId) {
      alert('❌ Experience identifier is missing.');
      return;
    }

    if (ratings.overall === 0) {
      alert('⭐ Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      
      const response = await axios.post(
        `${apiBaseUrl}/Rating/experience/${experienceId}`,
        {
          overallRating: ratings.overall,
          locationRating: ratings.location || null,
          valueRating: ratings.value || null,
          serviceRating: ratings.service || null,
          cleanlinessRating: ratings.cleanliness || null,
          accuracyRating: ratings.accuracy || null,
          review: review.trim() || null
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500 // Don't treat 401 as error
        }
      );

      if (response.status === 200) {
        alert('✅ Your rating has been submitted!');
        if (onRatingSubmit) onRatingSubmit();
        
        // Reset form
        setRatings({
          overall: 0,
          location: 0,
          value: 0,
          service: 0,
          cleanliness: 0,
          accuracy: 0
        });
        setReview('');
      } else if (response.status === 401) {
        alert('🔒 Your session has expired. Please log in again.\n\nClick OK to go to the login page.');
        window.location.href = '/login';
      } else if (response.status === 400 && response.data?.message?.includes('already')) {
        alert('✅ You have already rated this experience');
      } else {
        alert('❌ An error occurred. Please try again.');
      }
    } catch (error) {
      const responseData = error?.response?.data;
      let serverMessage = '';

      if (typeof responseData === 'string') {
        serverMessage = responseData;
      } else if (responseData) {
        serverMessage =
          responseData.message ||
          responseData.error ||
          JSON.stringify(responseData);
      }

      if (!serverMessage) {
        serverMessage = error?.message || 'An unexpected error occurred. Please try again.';
      }

      console.error('Error submitting rating:', {
        status: error?.response?.status,
        data: responseData,
        error
      });

      alert(`❌ ${serverMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label, icon }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {icon} {label}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= value 
                    ? 'text-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Rate This Experience ⭐
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating - Required */}
        <StarRating
          value={ratings.overall}
          onChange={(val) => handleRatingChange('overall', val)}
          label={ratingCategories[0].label}
          icon={ratingCategories[0].icon}
        />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Optional categories:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ratingCategories.slice(1).map((category) => (
              <StarRating
                key={category.key}
                value={ratings[category.key]}
                onChange={(val) => handleRatingChange(category.key, val)}
                label={category.label}
                icon={category.icon}
              />
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📝 Review (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {review.length}/1000 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || ratings.overall === 0}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default RatingComponent;

