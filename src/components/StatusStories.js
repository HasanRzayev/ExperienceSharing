import React, { useState, useEffect } from 'react';
import { Stories } from 'react-insta-stories';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaPlus, FaTimes } from 'react-icons/fa';
import StatusUploadModal from './StatusUploadModal';

const StatusStories = ({ userId, currentUser, onStoryClick }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

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
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const formatStoriesForReactInstaStories = (statuses) => {
    return statuses.map(status => {
      const mediaUrl = status.imageUrl || status.videoUrl || status.mediaUrl;
      if (!mediaUrl) return null;
      
      return {
        url: mediaUrl,
        type: status.videoUrl ? 'video' : 'image',
        duration: status.videoUrl ? 10000 : 5000,
        header: {
          heading: `${status.user?.firstName || ''} ${status.user?.lastName || ''}`,
          subheading: `Posted ${new Date(status.createdAt).toLocaleDateString()}`,
          profileImage: status.user?.profileImage || 'https://via.placeholder.com/50'
        }
      };
    }).filter(story => story !== null);
  };

  const handleUploadSuccess = () => {
    fetchStories(); // Refresh stories after upload
  };

  const handleStoryClick = () => {
    if (stories.length > 0) {
      setCurrentStoryIndex(0);
      setIsOpen(true);
    } else {
      setShowUploadModal(true);
    }
  };

  const handleCloseStories = () => {
    setIsOpen(false);
    setCurrentStoryIndex(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-w-[60px]">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show empty state if no stories
  if (!stories || stories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-[60px]">
        <button
          onClick={() => setShowUploadModal(true)}
          className="relative"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-0.5 flex items-center justify-center">
              <FaPlus className="text-gray-400 text-xl" />
            </div>
          </div>
        </button>
        <span className="text-xs text-gray-600">Your Status</span>
        <StatusUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer" onClick={handleStoryClick}>
        <div className="relative">
          <img
            src={currentUser?.profileImage || stories[0]?.header?.profileImage || 'https://via.placeholder.com/56'}
            alt="Story"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5">
            <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center">
              <FaPlus className="text-purple-600 text-xs" />
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-600">Your Status</span>
      </div>

      {/* Stories Viewer using react-insta-stories */}
      {isOpen && stories.length > 0 && (
        <div className="fixed inset-0 bg-black z-50" onClick={handleCloseStories}>
          <Stories
            stories={stories}
            onAllStoriesEnd={handleCloseStories}
            defaultInterval={5000}
            loop={false}
            keyboardNavigation={true}
            isPaused={false}
          />
        </div>
      )}

      <StatusUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadSuccess}
      />
    </>
  );
};

export default StatusStories;