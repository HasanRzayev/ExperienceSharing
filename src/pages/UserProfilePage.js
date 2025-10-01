import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate ekleyin
import axios from 'axios';
import Cookies from 'js-cookie';
import FollowButton from '../components/FollowButton';
import CustomCard from './Card';

const UserProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const { userId } = useParams(); // Kullanıcı ID'sini URL'den alın
  const token = Cookies.get('token');
  const navigate = useNavigate(); // useNavigate ekleyin

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(`http://localhost:5029/api/Auth/GetUserProfile/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(response.data);
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

  const { firstName, lastName, email, country, profileImage, userExperiences } = userData;

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
    userExperiences.map((post, index) => (
      <CustomCard
        key={`${post.id}-${index}`}
        imageUrls={post.imageUrls?.length > 0 ? post.imageUrls[0]?.url : ""}
        Date={post.date}
        title={post.title}
        description={post.description}
        location={post.location}
        rating={post.rating}
        user={post.user}
      />
    ))
  ) : (
    <p className="text-gray-500 dark:text-gray-400 text-center">Loading...</p>
  )}
</div>

    </div>
  );
};

export default UserProfilePage;
