import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AnalyticsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.get(`${apiBaseUrl}/UserAnalytics/my-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center text-gray-600">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Experiences */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Experiences</p>
              <p className="mt-2 text-3xl font-bold">{stats.totalExperiences}</p>
            </div>
            <div className="rounded-full bg-white bg-opacity-20 p-3">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-100">Total Likes</p>
              <p className="mt-2 text-3xl font-bold">{stats.totalLikes}</p>
            </div>
            <div className="rounded-full bg-white bg-opacity-20 p-3">
              <svg className="size-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Comments */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Comments</p>
              <p className="mt-2 text-3xl font-bold">{stats.totalComments}</p>
            </div>
            <div className="rounded-full bg-white bg-opacity-20 p-3">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Followers */}
        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Followers</p>
              <p className="mt-2 text-3xl font-bold">{stats.followersCount}</p>
            </div>
            <div className="rounded-full bg-white bg-opacity-20 p-3">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Following */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-100">Following</p>
              <p className="mt-2 text-3xl font-bold">{stats.followingCount}</p>
            </div>
            <div className="rounded-full bg-white bg-opacity-20 p-3">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Engagement Rate</p>
              <p className="mt-2 text-3xl font-bold">{stats.engagementRate.toFixed(1)}</p>
              <p className="mt-1 text-xs text-orange-100">per experience</p>
            </div>
            <div className="rounded-full bg-white bg-opacity-20 p-3">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Most Liked Experience */}
      {stats.mostLikedExperience && stats.mostLikedExperience.likesCount > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <svg className="size-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Most Popular Experience
          </h3>
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-gray-700 dark:to-gray-600">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">{stats.mostLikedExperience.title}</h4>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {stats.mostLikedExperience.location}
              </span>
              <span className="flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400">
                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {stats.mostLikedExperience.likesCount} likes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Activity Chart (Simple Bar Chart) */}
      {stats.monthlyStats && stats.monthlyStats.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Monthly Activity</h3>
          <div className="space-y-3">
            {stats.monthlyStats.map((month, index) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const maxCount = Math.max(...stats.monthlyStats.map(m => m.count));
              const widthPercentage = (month.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {monthNames[month.month - 1]} {month.year}
                  </span>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-purple-500 to-blue-500 pr-3 transition-all duration-500"
                      style={{ width: `${widthPercentage}%` }}
                    >
                      <span className="text-sm font-semibold text-white">{month.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Average Rating */}
      <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Performance Metrics</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <svg className="size-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.averageRating.toFixed(1)} / 5.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <svg className="size-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.engagementRate.toFixed(1)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">interactions per post</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;

