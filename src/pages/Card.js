import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import Cookies from 'js-cookie';
import { useAuth } from '../App';

// JWT token-dan user ID-ni çıxarmaq üçün funksiya
const getUserIdFromToken = () => {
  try {
    const token = Cookies.get("token");
    if (!token) return null;
    
    // JWT token-ı decode etmək
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // User ID-ni tapmaq üçün müxtəlif sahələri yoxla
    const userId = payload.userId || 
                   payload.id || 
                   payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                   payload.sub;
    
    return userId;
  } catch (error) {
    return null;
  }
};

const CustomCard = ({ imageUrls, date, title, description, location, rating, user, id }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { userData: currentUserData } = useAuth();

  const handleAboutClick = () => {
    if (!id) {
      return;
    }
    
    navigate(`/about/${id}`);
  };

  const handleUserNameClick = () => {
    // Əgər current user data yoxdursa, login-ə yönləndir
    if (!currentUserData) {
      navigate("/login");
      return;
    }
    
    // Əgər user data yoxdursa, UserProfilePage-ə yönləndir
    if (!user || !user.id) {
      navigate(`/profile/${user?.id}`);
      return;
    }
    
    // User ID-lərini müqayisə et
    const currentUserId = currentUserData.id || currentUserData.userId || getUserIdFromToken();
    const cardUserId = user.id;
    
    // Əgər user özünün card-ına tıklayırsa, Profil.js aç
    if (currentUserId && cardUserId && currentUserId.toString() === cardUserId.toString()) {
      navigate("/Profil");
    } else {
      navigate(`/profile/${cardUserId}`);
    }
  };

  return (
    <div 
      className="card-modern relative overflow-hidden cursor-pointer group transition-smooth hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden rounded-t-2xl">
        <img 
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-80' : 'opacity-100'}`} 
          src={imageUrls || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
          alt={title}
          loading="lazy"
          decoding="async"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Like Button */}
        <div className="absolute top-4 right-4 z-10">
          <LikeButton experienceId={id} />
        </div>
        
        {/* Location Badge */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="glass px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center ml-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
              alt={user?.userName || "User"}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
              loading="lazy"
              decoding="async"
            />
            <div>
              <p className="text-sm font-medium text-gray-800 cursor-pointer hover:text-purple-600 transition-colors" onClick={handleUserNameClick}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.userName || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500">
                {date && typeof date === 'string' 
                  ? new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : date || 'No date'
                }
              </p>
            </div>
          </div>
          
          <button
            className="btn-primary px-6 py-2 text-sm font-medium"
            onClick={handleAboutClick}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(CustomCard);
