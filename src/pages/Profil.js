import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import CustomCard from "./Card";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const token = Cookies.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/Auth/GetProfile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserData(response.data);
        } catch (error) {
          console.error("Kullanıcı verileri alınırken bir hata oluştu!", error);
        }
      }
    };

    const fetchFollowData = async () => {
      if (token) {
        try {
          const followingRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/followers/following`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const followersRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/followers/followers`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setFollowingCount(followingRes.data.length);
          setFollowersCount(followersRes.data.length);
        } catch (error) {
          console.error("Takip verileri alınırken bir hata oluştu!", error);
        }
      }
    };

    fetchUserData();
    fetchFollowData();
  }, [token]);

  if (!userData) {
    return <div className="text-center py-10 text-gray-600">Yükleniyor...</div>;
  }

  const { firstName, lastName, email, country, profileImage, userExperiences } =
    userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Profile Header */}
        <div className="card-modern overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-64 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">Welcome to Your Profile</h1>
                <p className="text-xl opacity-90">Share your amazing experiences with the world</p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-6 right-6 w-16 h-16 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 bg-white opacity-10 rounded-full"></div>
          </div>

          {/* Profile Info */}
          <div className="p-8 -mt-20 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <img
                  className="w-40 h-40 object-cover rounded-full border-8 border-white shadow-2xl"
                  src={profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                  alt="Profile"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {firstName} {lastName}
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {country}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    {email}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => navigate("/settings")} 
                    className="btn-primary px-6 py-3"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>

                  <button 
                    onClick={() => navigate("/chatpage")} 
                    className="btn-secondary px-6 py-3"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex justify-center md:justify-start space-x-12 border-t pt-8">
              <div onClick={() => navigate("/Follow")} className="cursor-pointer text-center group">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {followersCount}
                </div>
                <div className="text-gray-600 font-medium">Followers</div>
              </div>
              <div onClick={() => navigate("/Following")} className="cursor-pointer text-center group">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {followingCount}
                </div>
                <div className="text-gray-600 font-medium">Following</div>
              </div>
              <div className="cursor-pointer text-center group">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {userExperiences.length}
                </div>
                <div className="text-gray-600 font-medium">Experiences</div>
              </div>
            </div>
          </div>
        </div>

        {/* Experiences Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">My Experiences</h3>
            <button 
              onClick={() => navigate("/NewExperience")}
              className="btn-primary px-6 py-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Share New Experience
            </button>
          </div>

          {userExperiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userExperiences.map((post, index) => {
                console.log("Profil.js - Post data:", post);
                console.log("Profil.js - Post ID:", post.id);
                console.log("Profil.js - Post userId:", post.userId);
                console.log("Profil.js - Post user:", post.user);
                console.log("Profil.js - User firstName:", post.user?.firstName);
                console.log("Profil.js - User lastName:", post.user?.lastName);
                console.log("Profil.js - User userName:", post.user?.userName);
                console.log("Profil.js - All post keys:", Object.keys(post));
                
                // Müvəqqəti həll: userId istifadə et
                const cardId = post.id || post.userId || `temp-${index}`;
                console.log("Profil.js - Using cardId:", cardId);
                
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
            <div className="text-center py-20">
              <div className="glass p-12 rounded-3xl max-w-md mx-auto">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No experiences yet</h3>
                <p className="text-gray-600 mb-6">
                  Start sharing your amazing adventures with the world!
                </p>
                <button 
                  onClick={() => navigate("/NewExperience")}
                  className="btn-primary"
                >
                  Share Your First Experience
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
