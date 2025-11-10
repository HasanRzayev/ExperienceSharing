import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const LikeButton = ({ experienceId, onClose, renderAsMenuItem = false }) => {
  const [liked, setLiked] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!token || !experienceId) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/Like/${experienceId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(response.data.isLiked);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    checkLikedStatus();
  }, [token, experienceId]);

  const handleLike = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/Like/${experienceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      
      if (onClose) onClose();
      
      // Dynamic import of Swal to reduce initial bundle size
      const { default: Swal } = await import('sweetalert2');
      Swal.fire({
        title: liked ? 'Bəyənmə geri alındı!' : 'Bəyənildi!',
        text: liked ? 'Bu təcrübəni artıq bəyənmirsiniz.' : 'Bu təcrübəni bəyəndiniz!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-lg font-bold',
          htmlContainer: 'text-sm'
        }
      });
    } catch (error) {
      console.error('Error liking/unliking experience:', error);
    }
  };

  // Render as menu item
  if (renderAsMenuItem) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
      >
        <svg className="w-5 h-5 text-red-500" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="font-medium">{liked ? 'Unlike' : 'Like'}</span>
      </button>
    );
  }

  // Render as animated heart button
  return (
    <div className="like-container" onClick={handleLike}>
      <svg
        id="heart-svg"
        viewBox="467 392 58 57"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          id="Group"
          fill="none"
          fillRule="evenodd"
          transform="translate(467 392)"
        >
          <path
            id="heart"
            d="M29.143 5.975c7.242-6.654 19.633-6.287 26.84 0 8.527 7.68 8.527 20.085 0 27.766L29.143 57.327 2.845 33.74c-8.528-7.681-8.528-20.086 0-27.766 7.207-6.287 19.598-6.654 26.84 0"
            className={`heart ${liked ? 'is-active' : ''}`}
          />
          <circle
            id="main-circ"
            className="main-circ"
            fill="#E2264D"
            opacity={liked ? 1 : 0}
            cx="29.5"
            cy="29.5"
            r="1.5"
          />
        </g>
      </svg>
    </div>
  );
};

export default LikeButton;
