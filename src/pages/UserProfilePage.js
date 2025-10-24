import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate ekleyin
import axios from 'axios';
import Cookies from 'js-cookie';
import FollowButton from '../components/FollowButton';
import CustomCard from './Card';

const UserProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [userExperiences, setUserExperiences] = useState([]);
  const { userId } = useParams(); // Kullanıcı ID'sini URL'den alın
  const token = Cookies.get('token');
  const navigate = useNavigate(); // useNavigate ekleyin

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/Auth/GetUserProfile/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("UserProfilePage - Full response data:", response.data);
          setUserData(response.data);
          setUserExperiences(response.data.userExperiences || []);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
  
    fetchUserData();
  }, [token, userId]);

  const handleMessageClick = () => {
    navigate(`/messages/${userId}`); // userId'yi URL'ye dahil edin
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const { firstName, lastName, email, country, profileImage, userExperiences: userExperiencesFromData } = userData;

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
            
            {/* Bio Section */}
            {userData.bio && (
              <div className="mt-3 mb-4">
                <p className="text-gray-700 text-base leading-relaxed max-w-lg mx-auto">
                  {userData.bio}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {country && (
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {country}
                </div>
              )}
              {userData.website && (
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Website
                  </a>
                </div>
              )}
              {userData.phoneNumber && (
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {userData.phoneNumber}
                </div>
              )}
              {userData.gender && (
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {userData.gender}
                </div>
              )}
              {userData.birthDate && (
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(userData.birthDate).toLocaleDateString()}
                </div>
              )}
              <p className="text-gray-500">{email}</p>
            </div>
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
    userExperiences.map((post, index) => {
      console.log("UserProfilePage.js - Post data:", post);
      console.log("UserProfilePage.js - Post ID:", post.id);
      console.log("UserProfilePage.js - Post userId:", post.userId);
      console.log("UserProfilePage.js - Post user:", post.user);
      console.log("UserProfilePage.js - User firstName:", post.user?.firstName);
      console.log("UserProfilePage.js - User lastName:", post.user?.lastName);
      console.log("UserProfilePage.js - User userName:", post.user?.userName);
      console.log("UserProfilePage.js - All post keys:", Object.keys(post));
      
      // Müvəqqəti həll: userId istifadə et
      const cardId = post.id || post.userId || `temp-${index}`;
      console.log("UserProfilePage.js - Using cardId:", cardId);
      
      return (
        <CustomCard
          key={`${cardId}-${index}`}
          id={cardId}
          imageUrls={post.imageUrls?.length > 0 ? post.imageUrls[0]?.url : ""}
          date={post.date}
          title={post.title}
          description={post.description}
          location={post.location}
          rating={post.rating}
          user={userData}
        />
      );
    })
  ) : (
    <p className="text-gray-500 dark:text-gray-400 text-center">Loading...</p>
  )}
</div>

    </div>
  );
};

export default UserProfilePage;
