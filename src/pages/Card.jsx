import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import AddToTripButton from '../components/AddToTripButton';
import SaveButton from '../components/SaveButton';
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

const CustomCard = ({ imageUrls, date, title, description, location, rating, user, id, isOwner, onDelete, onEdit, videoUrl, videoThumbnail }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const { userData: currentUserData } = useAuth();

  const fallbackImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  const resolvedImageUrl = (() => {
    if (!imageUrls) return null;
    if (typeof imageUrls === 'string') return imageUrls;
    if (Array.isArray(imageUrls)) {
      const first = imageUrls[0];
      if (!first) return null;
      if (typeof first === 'string') return first;
      return first?.url || first?.Url || null;
    }
    if (typeof imageUrls === 'object') {
      return imageUrls?.url || imageUrls?.Url || null;
    }
    return null;
  })();

  const hasVideo = Boolean(videoUrl);
  const hasRealImage = Boolean(resolvedImageUrl);
  const imageSrc = resolvedImageUrl || fallbackImage;

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

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(id);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div 
      className="card-modern relative cursor-pointer group transition-smooth hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Container */}
      <div className="relative h-64 overflow-hidden rounded-t-2xl">
        {hasVideo && hasRealImage ? (
          <div className="flex h-full">
            <div className="w-1/2 h-full relative overflow-hidden">
              <video
                className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-80' : 'opacity-100'}`}
                src={videoUrl}
                poster={videoThumbnail}
                controls={false}
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div className="w-1/2 h-full overflow-hidden">
              <img 
                className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-80' : 'opacity-100'}`} 
                src={imageSrc} 
                alt={title}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        ) : hasVideo ? (
          <div className="relative w-full h-full">
            <video
              className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-80' : 'opacity-100'}`}
              src={videoUrl}
              poster={videoThumbnail}
              controls={false}
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        ) : (
          <img 
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-80' : 'opacity-100'}`} 
            src={imageSrc} 
            alt={title}
            loading="lazy"
            decoding="async"
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Options Menu (3 dots) */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsMenu(!showOptionsMenu);
            }}
            className="bg-white dark:bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title="More options"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
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

      {/* Dropdown Menu - Outside of overflow container */}
      {showOptionsMenu && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsMenu(false);
            }}
          />
          <div className="absolute top-16 right-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]">
                {/* Add to Trip */}
                <AddToTripButton 
                  experienceId={id} 
                  onClose={() => setShowOptionsMenu(false)}
                  renderAsMenuItem={true}
                />

                {/* Save/Bookmark */}
                <SaveButton 
                  experienceId={id}
                  renderAsMenuItem={true}
                />

                {/* Like */}
                <LikeButton 
                  experienceId={id}
                  onClose={() => setShowOptionsMenu(false)}
                  renderAsMenuItem={true}
                />

                {/* Edit & Delete (owner only) */}
                {isOwner && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(false);
                        handleEdit();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">Edit</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="font-medium">Delete</span>
                    </button>
                  </>
                )}
          </div>
        </>
      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Experience?</h3>
              <p className="text-gray-600">
                Are you sure you want to delete this experience? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(CustomCard);
