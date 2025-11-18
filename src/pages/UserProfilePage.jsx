import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import FollowButton from '../components/FollowButton';
import CustomCard from './Card';
import { getApiBaseUrl } from '../utils/env';

const UserProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [userExperiences, setUserExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const token = Cookies.get('token');
  const navigate = useNavigate();
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID is missing');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching user profile for userId: ${userId}`);
        const response = await axios.get(`${apiBaseUrl}/Auth/GetUserProfile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("UserProfilePage - Full response data:", response.data);
        
        if (response.data) {
          setUserData(response.data);
          // Backend-dən gələn məlumatları normalize et
          const experiences = response.data.userExperiences || response.data.UserExperiences || [];
          setUserExperiences(experiences);
        } else {
          setError('User data not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load user profile');
        if (error.response?.status === 404) {
          setError('User not found');
        } else if (error.response?.status === 401) {
          setError('Authentication required');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [token, userId, apiBaseUrl]);

  const handleMessageClick = () => {
    navigate('/chatpage', {
      state: { targetUserId: userId },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data available</p>
        </div>
      </div>
    );
  }

  // Normalize field names (handle both camelCase and PascalCase)
  const firstName = userData.firstName || userData.FirstName || 'User';
  const lastName = userData.lastName || userData.LastName || '';
  const email = userData.email || userData.Email || '';
  const country = userData.country || userData.Country || 'Unknown';
  const profileImage = userData.profileImage || userData.ProfileImage || 'https://via.placeholder.com/150';

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-8">
      <div className="bg-white w-full max-w-4xl shadow-md rounded-lg overflow-hidden">
        <div className="relative bg-gray-300 h-48">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 border-4 border-white rounded-full overflow-hidden">
              <img src={profileImage || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">{firstName} {lastName}</h2>
            <p className="text-gray-600">{country}</p>
            <p className="text-gray-500">{email}</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Settings</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600" onClick={handleMessageClick}>MESSAGE</button>
            <FollowButton userId={userId} />
          </div>
        </div>
   {/* Statistikalar */}
<div className="mt-6 flex justify-around border-t pt-4 text-center text-gray-600 dark:text-gray-300">
  <div>
    <span className="block text-lg font-semibold">{userExperiences.length}</span>
    Experiences
  </div>
  <div>
    <span className="block text-lg font-semibold">0</span>
    Followers
  </div>
  <div>
    <span className="block text-lg font-semibold">0</span>
    Following
  </div>
</div>

      </div>

    {/* Paylaşımlar */}
<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {userExperiences.length > 0 ? (
    [...userExperiences]
      .sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = new Date(a.date || a.Date || 0).getTime();
        const dateB = new Date(b.date || b.Date || 0).getTime();
        return dateB - dateA;
      })
      .map((post, index) => {
      // Normalize post data (handle both camelCase and PascalCase)
      const postId = post.id || post.Id || post.userId || `temp-${index}`;
      const imageUrls = post.imageUrls || post.ImageUrls || [];
      const imageUrl = imageUrls.length > 0 
        ? (imageUrls[0]?.url || imageUrls[0]?.Url || imageUrls[0])
        : "";
      
      return (
        <CustomCard
          key={`${postId}-${index}`}
          id={postId}
          imageUrls={imageUrl}
          date={post.date || post.Date}
          title={post.title || post.Title || 'Untitled'}
          description={post.description || post.Description || ''}
          location={post.location || post.Location || ''}
          rating={post.rating || post.Rating || 0}
          user={{
            id: userData.id || userData.Id,
            firstName: firstName,
            lastName: lastName,
            userName: userData.userName || userData.UserName || '',
            profileImage: profileImage
          }}
          videoUrl={post.videoUrl || post.VideoUrl}
          videoThumbnail={post.videoThumbnail || post.VideoThumbnail}
        />
      );
    })
  ) : (
    <div className="col-span-full text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <p className="text-gray-500 dark:text-gray-400 text-lg">No experiences yet</p>
    </div>
  )}
</div>

    </div>
  );
};

export default UserProfilePage;
