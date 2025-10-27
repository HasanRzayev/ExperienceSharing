import React, { useState, useEffect } from 'react';
import { Stories } from 'react-insta-stories';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaPlus } from 'react-icons/fa';
import StatusUploadModal from './StatusUploadModal';

const OtherUserStories = ({ userId, userInfo }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnviewed, setHasUnviewed] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  useEffect(() => {
    if (userId) {
      fetchStories();
    }
  }, [userId]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      if (!token) return;

      const response = await axios.get(`${apiBaseUrl}/Status/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        const formattedStories = formatStoriesForReactInstaStories(response.data);
        setStories(formattedStories);
        // Check if any story is unviewed
        const hasUnviewedStory = response.data.some(status => !status.isViewed);
        setHasUnviewed(hasUnviewedStory);
      } else {
        setStories([]);
        setHasUnviewed(false);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
      setHasUnviewed(false);
    } finally {
      setLoading(false);
    }
  };

  const formatStoriesForReactInstaStories = (statuses) => {
    return statuses.map(status => ({
      url: status.imageUrl || status.videoUrl || status.mediaUrl,
      type: status.videoUrl ? 'video' : 'image',
      duration: status.videoUrl ? 10000 : 5000,
      header: {
        heading: `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`,
        subheading: `Posted ${new Date(status.createdAt).toLocaleDateString()}`,
        profileImage: userInfo?.profileImage || 'https://via.placeholder.com/50'
      }
    }));
  };

  const handleStoryClick = () => {
    if (stories.length > 0) {
      setIsOpen(true);
    }
  };

  const handleCloseStories = () => {
    setIsOpen(false);
    // Refresh to mark as viewed
    fetchStories();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-w-[60px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't show if no stories
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <>
      <div 
        className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer transition-transform hover:scale-105" 
        onClick={handleStoryClick}
      >
        <div className="relative">
          <div className={`w-14 h-14 rounded-full ${hasUnviewed ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-0.5' : 'bg-gray-200 p-0.5'}`}>
            <img
              src={userInfo?.profileImage || "https://via.placeholder.com/56"}
              alt={userInfo?.firstName}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {hasUnviewed && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <span className="text-xs text-gray-600 truncate max-w-[60px]">
          {userInfo?.firstName || 'User'}
        </span>
      </div>

      {/* Stories Viewer using react-insta-stories */}
      {isOpen && stories.length > 0 && (
        <div className="fixed inset-0 bg-black z-50" onClick={handleCloseStories}>
          <Stories
            stories={stories}
            currentIndex={0}
            onStoryEnd={(s, st) => {
              if (st + 1 >= stories.length) {
                handleCloseStories();
              }
            }}
            onAllStoriesEnd={handleCloseStories}
            onPrevious={(s, st) => {
              if (st === 0) {
                handleCloseStories();
              }
            }}
            defaultInterval={5000}
            loop={false}
            keyboardNavigation={true}
          />
        </div>
      )}
    </>
  );
};

export default OtherUserStories;
