import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import CustomCard from "./Card";
import { useNavigate } from "react-router-dom";
import AnalyticsTab from "../components/AnalyticsTab";
import { getApiBaseUrl } from "../utils/env";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('my-experiences'); // New state for tab management
  const [likedExperiences, setLikedExperiences] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/Auth/GetProfile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Profil.jsx - User data response:", response.data);
          setUserData(response.data);
        } catch (error) {
          console.error("Kullanıcı verileri alınırken bir hata oluştu!", error);
          console.error("Error response:", error.response?.data);
        }
      }
    };

    const fetchFollowData = async () => {
      if (token) {
        try {
          const followingRes = await axios.get(
            `${apiBaseUrl}/followers/following`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const followersRes = await axios.get(
            `${apiBaseUrl}/followers/followers`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setFollowingCount(followingRes.data?.length || 0);
          setFollowersCount(followersRes.data?.length || 0);
        } catch (error) {
          console.error("Takip verileri alınırken bir hata oluştu!", error);
        }
      }
    };

    fetchUserData();
    fetchFollowData();
  }, [token, refreshKey, apiBaseUrl]);

  // Function to fetch liked experiences
  const fetchLikedExperiences = async () => {
    // Try to get user ID from different possible fields
    let userId = userData?.id || userData?.userId || userData?.Id || userData?.UserId;
    
    // If still no userId, try to get it from userExperiences array
    if (!userId && userData?.userExperiences && userData.userExperiences.length > 0) {
      userId = userData.userExperiences[0]?.userId || userData.userExperiences[0]?.user?.id;
      console.log("🔍 Found userId from userExperiences:", userId);
    }
    
    if (!token || !userId) {
      console.log("❌ Cannot fetch liked experiences - missing token or userData");
      console.log("Token:", !!token);
      console.log("UserData:", userData);
      console.log("UserId found:", userId);
      console.log("UserData keys:", Object.keys(userData || {}));
      console.log("UserExperiences:", userData?.userExperiences);
      return;
    }
    
    console.log("🔄 Fetching liked experiences for user:", userId);
    setLoadingLiked(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/Like/user/${userId}/liked-experiences?page=1&pageSize=50`;
      console.log("📡 API URL:", url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("✅ Liked experiences response:", response.data);
      console.log("📊 Experiences:", response.data.experiences);
      console.log("📈 Total count:", response.data.totalCount);
      
      setLikedExperiences(response.data.experiences || []);
    } catch (error) {
      console.error("❌ Error fetching liked experiences:", error);
      console.error("❌ Error response:", error.response?.data);
      setLikedExperiences([]);
    } finally {
      setLoadingLiked(false);
    }
  };

  // Delete Experience funksiyası
  const handleDeleteExperience = async (experienceId) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      await axios.delete(`${apiBaseUrl}/Experiences/${experienceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Səhifəni yenilə
      setRefreshKey(prev => prev + 1);
      alert('Experience deleted successfully!');
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience. Please try again.');
    }
  };

  // Edit Experience funksiyası - NewExperience səhifəsinə yönləndir
  const handleEditExperience = (experienceId) => {
    navigate(`/edit-experience/${experienceId}`);
  };

  // Fetch liked experiences when tab changes to liked
  useEffect(() => {
    let userId = userData?.id || userData?.userId || userData?.Id || userData?.UserId;
    
    // If still no userId, try to get it from userExperiences array
    if (!userId && userData?.userExperiences && userData.userExperiences.length > 0) {
      userId = userData.userExperiences[0]?.userId || userData.userExperiences[0]?.user?.id;
    }
    
    if (activeTab === 'liked-experiences' && userId) {
      fetchLikedExperiences();
    }
  }, [activeTab, userData]);

  if (!userData) {
    return <div className="text-center py-10 text-gray-600">Yükleniyor...</div>;
  }

  console.log("🔍 Profile Page - userData:", userData);
  console.log("🔍 Profile Page - userData.id:", userData?.id);
  console.log("🔍 Profile Page - userData.userId:", userData?.userId);
  console.log("🔍 Profile Page - userData keys:", Object.keys(userData || {}));
  console.log("🔍 Profile Page - token:", !!token);
  console.log("🔍 Profile Page - activeTab:", activeTab);

  // Normalize field names (handle both camelCase and PascalCase)
  const firstName = userData.firstName || userData.FirstName || 'User';
  const lastName = userData.lastName || userData.LastName || '';
  const email = userData.email || userData.Email || '';
  const country = userData.country || userData.Country || 'Unknown';
  const profileImage = userData.profileImage || userData.ProfileImage || 'https://via.placeholder.com/150';
  const userExperiences = userData.userExperiences || userData.UserExperiences || [];

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
              <div 
                onClick={() => setActiveTab('liked-experiences')} 
                className="cursor-pointer text-center group"
              >
                <div className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {likedExperiences.length}
                </div>
                <div className="text-gray-600 font-medium">Liked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('my-experiences')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'my-experiences'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Experiences
              </button>
              <button
                onClick={() => {
                  console.log("🔄 Switching to liked-experiences tab");
                  setActiveTab('liked-experiences');
                }}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'liked-experiences'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Liked Experiences
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </button>
            </div>
            
            {activeTab === 'my-experiences' && (
              <button 
                onClick={() => navigate("/NewExperience")}
                className="btn-primary px-6 py-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Share New Experience
              </button>
            )}
            
            {activeTab === 'liked-experiences' && (
              <button 
                onClick={() => {
                  console.log("🧪 Manual test - Fetching liked experiences");
                  fetchLikedExperiences();
                }}
                className="btn-secondary px-6 py-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'my-experiences' && (
            <>
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
                    
                    // Backend-dən Id böyük hərflə gəlir
                    const cardId = post.id || post.Id || post.userId || `temp-${index}`;
                    console.log("Profil.js - Using cardId:", cardId);
                    console.log("Profil.js - post.id:", post.id);
                    console.log("Profil.js - post.Id:", post.Id);
                    
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
                          isOwner={true}
                          onDelete={handleDeleteExperience}
                          onEdit={handleEditExperience}
                          videoUrl={post.videoUrl}
                          videoThumbnail={post.videoThumbnail}
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
            </>
          )}

          {activeTab === 'liked-experiences' && (
            <>
              {loadingLiked ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading your liked experiences...</p>
                </div>
              ) : likedExperiences.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedExperiences.map((experience, index) => {
                    const cardId = experience.id || `liked-${index}`;
                    
                    return (
                      <div key={`${cardId}-${index}`} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                        <CustomCard
                          id={cardId}
                          imageUrls={experience.images?.length > 0 ? experience.images[0]?.imageUrl : ""}
                          date={experience.date}
                          title={experience.title}
                          description={experience.description}
                          location={experience.location}
                          rating={experience.rating}
                          user={{
                            id: experience.user?.id,
                            firstName: experience.user?.firstName,
                            lastName: experience.user?.lastName,
                            userName: experience.user?.userName,
                            profileImage: experience.user?.profileImage
                          }}
                          likesCount={experience.likesCount}
                          commentsCount={experience.commentsCount}
                          videoUrl={experience.videoUrl}
                          videoThumbnail={experience.videoThumbnail}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="glass p-12 rounded-3xl max-w-md mx-auto">
                    <div className="text-6xl mb-4">💖</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No liked experiences yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start exploring and liking amazing experiences from other users!
                    </p>
                    <button 
                      onClick={() => navigate("/")}
                      className="btn-primary"
                    >
                      Explore Experiences
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
