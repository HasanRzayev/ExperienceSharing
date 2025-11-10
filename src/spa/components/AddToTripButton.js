import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const AddToTripButton = ({ experienceId, onClose, renderAsMenuItem = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const token = Cookies.get('token');

  const fetchTrips = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.get(`${apiBaseUrl}/Trip/my-trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTrip = async (tripId) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.post(
        `${apiBaseUrl}/Trip/${tripId}/experiences/${experienceId}`,
        { orderIndex: 0, notes: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Experience added to trip!');
      setShowModal(false);
    } catch (error) {
      console.error('Error adding to trip:', error);
      if (error.response?.status === 409) {
        alert('⚠️ Experience already in this trip');
      } else {
        alert('❌ Failed to add to trip');
      }
    }
  };

  const openModal = () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    console.log('Opening Add to Trip modal...', 'Current showModal:', showModal);
    setShowModal(true);
    console.log('setShowModal(true) called');
    fetchTrips();
    // NOTE: We DON'T call onClose() here because it would unmount this component
    // The modal click handler should close the parent menu instead
  };

  // Render modal using Portal (renders outside component tree)
  const renderModal = () => {
    console.log('renderModal called, showModal:', showModal);
    if (!showModal) {
      console.log('Modal not showing - showModal is false');
      return null;
    }
    
    console.log('Rendering modal with Portal...');
    const modalJSX = (
      <>
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-50"
          onClick={() => {
            setShowModal(false);
            if (onClose) onClose();
          }}
        />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add to Trip</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                </div>
              ) : trips.length > 0 ? (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => handleAddToTrip(trip.id)}
                      className="w-full rounded-xl border-2 border-transparent bg-gray-50 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 font-bold text-white">
                          ✈️
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white">{trip.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{trip.destination}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            {trip.tripExperiences?.length || 0} experiences
                          </p>
                        </div>
                        <svg className="size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-3 text-5xl">✈️</div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">No trips yet</p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      window.location.href = '/trip-planner';
                    }}
                    className="btn-primary text-sm"
                  >
                    Create Your First Trip
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
    
    return ReactDOM.createPortal(modalJSX, document.body);
  };

  // Render as menu item
  if (renderAsMenuItem) {
    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openModal();
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="size-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Add to Trip</span>
        </button>
        {renderModal()}
      </>
    );
  }

  // Render as floating button
  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openModal();
        }}
        className="z-10 rounded-full border-2 border-purple-200 bg-white bg-opacity-90 p-2.5 shadow-lg transition-all duration-200 hover:border-purple-400 hover:bg-opacity-100 hover:shadow-xl dark:border-purple-700 dark:bg-gray-800 dark:hover:border-purple-500"
        title="Add to Trip"
      >
        <svg className="size-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {renderModal()}
    </>
  );
};

export default AddToTripButton;

