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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-pulse delay-2000"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block relative">
              <img
                className="w-28 h-28 rounded-full border-4 border-white shadow-2xl mx-auto mb-6"
                src={profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                alt="Profile"
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {firstName} {lastName}
            </h1>
            
            {userData.bio && (
              <p className="text-lg text-white text-opacity-90 max-w-xl mx-auto mb-6 leading-relaxed">
                {userData.bio}
              </p>
            )}
            
            {/* Quick Info */}
            <div className="flex flex-wrap justify-center gap-4 text-white text-opacity-80 mb-6">
              {country && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {country}
                </div>
              )}
              {userData.website && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <a href={userData.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Website
                  </a>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleMessageClick}
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
              <FollowButton userId={userId} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="cursor-pointer group">
              <div className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                0
              </div>
              <div className="text-gray-600 font-medium">Followers</div>
            </div>
            <div className="cursor-pointer group">
              <div className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                0
              </div>
              <div className="text-gray-600 font-medium">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Experiences Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Experiences</h2>
            <p className="text-gray-600 mt-1">Shared experiences by {firstName}</p>
          </div>
          
          <div className="p-6">
            {userExperiences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userExperiences.map((post, index) => {
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
                    <div key={`${cardId}-${index}`} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                      <CustomCard
                        id={cardId}
                        imageUrls={post.imageUrls?.length > 0 ? post.imageUrls[0]?.url : ""}
                        date={post.date}
                        title={post.title}
                        description={post.description}
                        location={post.location}
                        rating={post.rating}
                        user={userData}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl max-w-md mx-auto border border-blue-100">
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No experiences yet</h3>
                  <p className="text-gray-600">
                    {firstName} hasn't shared any experiences yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
