import React, { useState, useEffect } from 'react';
import { Stories } from 'react-insta-stories';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaPlus, FaTimes } from 'react-icons/fa';
import StatusUploadModal from './StatusUploadModal';

const StatusStories = ({ userId, currentUser }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  useEffect(() => {
    fetchStories();
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
        heading: `${status.user?.firstName || ''} ${status.user?.lastName || ''}`,
        subheading: `Posted ${new Date(status.createdAt).toLocaleDateString()}`,
        profileImage: status.user?.profileImage || 'https://via.placeholder.com/50'
      },
      originalData: status // Keep original data for reference
    }));
  };

  const handleStoryClick = (storyIndex) => {
    setSelectedStory(stories[storyIndex]);
    setCurrentStoryIndex(storyIndex);
    setIsOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchStories(); // Refresh stories after upload
  };

  const storyConfig = {
    loop: false,
    defaultInterval: 5000,
    onStoryEnd: () => {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        setIsOpen(false);
        setSelectedStory(null);
      }
    },
    onAllStoriesEnd: () => {
      setIsOpen(false);
      setSelectedStory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <FaPlus className="text-2xl" />
        </button>
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
      <div className="relative cursor-pointer" onClick={() => handleStoryClick(0)}>
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
          <img
            src={stories[0]?.originalData?.user?.profileImage || 'https://via.placeholder.com/80'}
            alt="Story"
            className="w-full h-full rounded-full border-4 border-gradient-to-r from-purple-600 to-pink-600 object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-1">
            <div className="bg-white rounded-full p-1">
              <FaPlus className="text-purple-600 text-xs" />
            </div>
          </div>
        </div>
        {stories.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {stories.length}
          </div>
        )}
      </div>

      {isOpen && selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="w-full h-full flex items-center justify-center">
            <Stories
              stories={stories}
              currentIndex={currentStoryIndex}
              onStoryEnd={storyConfig.onStoryEnd}
              onAllStoriesEnd={storyConfig.onAllStoriesEnd}
              defaultInterval={storyConfig.defaultInterval}
              loop={storyConfig.loop}
            />
          </div>
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
