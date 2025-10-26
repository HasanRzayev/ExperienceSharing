import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaTimes, FaAngleLeft, FaAngleRight, FaTrash, FaEye } from 'react-icons/fa';
import swal from 'sweetalert';

const StatusViewer = ({ isOpen, onClose, statuses, currentUser, onStatusDelete, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewCount, setViewCount] = useState(0);
  const [isViewing, setIsViewing] = useState(false);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentStatus = statuses[currentIndex];

  useEffect(() => {
    if (!isOpen || !currentStatus) return;

    setIsViewing(true);
    // Mark as viewed
    axios.post(`${process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api'}/Status/${currentStatus.id}/view`, {}, {
      headers: { Authorization: `Bearer ${Cookies.get('token')}` }
    }).then(() => {
      // Fetch viewers count
      axios.get(`${process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api'}/Status/${currentStatus.id}/viewers`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      }).then(res => setViewCount(res.data.length))
      .catch(err => console.error('Error fetching viewers:', err));
    });

    return () => setIsViewing(false);
  }, [isOpen, currentStatus?.id, currentIndex]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDelete = async () => {
    const result = await swal({
      title: "Are you sure?",
      text: "You won't be able to recover this status!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (!result) return;

    try {
      const token = Cookies.get('token');
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api'}/Status/${currentStatus.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      swal("Deleted!", "Status deleted successfully!", "success");
      onStatusDelete();
      
      // Go to next status or close
      if (statuses.length > 1) {
        if (currentIndex === statuses.length - 1) {
          setCurrentIndex(currentIndex - 1);
        }
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting status:', error);
      swal("Error!", "Failed to delete status.", "error");
    }
  };

  if (!isOpen || !currentStatus) return null;

  const isOwnStatus = currentUser && currentStatus.user?.id === currentUser.id;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white bg-black/30 hover:bg-black/50 rounded-full p-3 transition-all"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 text-white bg-black/30 hover:bg-black/50 rounded-full p-4 transition-all z-50"
          >
            <FaAngleLeft className="text-2xl" />
          </button>
        )}

        {/* Next Button */}
        {currentIndex < statuses.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 text-white bg-black/30 hover:bg-black/50 rounded-full p-4 transition-all z-50"
          >
            <FaAngleRight className="text-2xl" />
          </button>
        )}

        {/* Status Content */}
        <div className="w-full h-full flex items-center justify-center relative">
          {/* User Info at Top */}
          <div className="absolute top-4 left-4 right-4 z-40">
            <div className="flex items-center gap-3">
              <img
                src={currentStatus.user?.profileImage || "https://via.placeholder.com/40"}
                alt={currentStatus.user?.firstName}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="flex-1">
                <h3 className="text-white font-bold">{currentStatus.user?.firstName} {currentStatus.user?.lastName}</h3>
                <p className="text-white/80 text-sm">@{currentStatus.user?.userName}</p>
              </div>
              {isOwnStatus && (
                <button
                  onClick={handleDelete}
                  className="text-white hover:text-red-400 p-2 rounded-full hover:bg-black/30 transition-all"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>

          {/* Media Content */}
          {currentStatus.videoUrl ? (
            <video
              src={currentStatus.videoUrl}
              poster={currentStatus.thumbnailUrl}
              controls
              autoPlay
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          ) : currentStatus.imageUrl ? (
            <img
              src={currentStatus.imageUrl}
              alt="Status"
              className="max-w-full max-h-full object-contain"
            />
          ) : null}

          {/* Text Content */}
          {currentStatus.text && (
            <div className="absolute bottom-20 left-0 right-0 px-8 z-40">
              <p className="text-white text-lg bg-black/30 rounded-lg p-4 backdrop-blur">
                {currentStatus.text}
              </p>
            </div>
          )}

          {/* Viewer Info at Bottom */}
          <div className="absolute bottom-4 left-4 right-4 z-40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <FaEye />
              <span>{viewCount} views</span>
            </div>
            
            {/* Progress Dots */}
            <div className="flex gap-1">
              {statuses.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-1'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusViewer;

