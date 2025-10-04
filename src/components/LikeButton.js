import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import '../CSS/LikeButton.css';

const LikeButton = ({ experienceId }) => {
  const [liked, setLiked] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!token || !experienceId) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/Likes/${experienceId}/status`,
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
        `${process.env.REACT_APP_API_BASE_URL}/Likes/${experienceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      Swal.fire(
        liked ? 'Unliked!' : 'Liked!',
        liked ? 'You have successfully unliked this experience.' : 'You have successfully liked this experience.',
        'success'
      );
    } catch (error) {
      console.error('Error liking/unliking experience:', error);
    }
  };

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
