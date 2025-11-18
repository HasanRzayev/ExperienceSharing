import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getApiBaseUrl } from '../utils/env';

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
      const apiBaseUrl = getApiBaseUrl();
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
      const apiBaseUrl = getApiBaseUrl();
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
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
          onClick={() => {
            setShowModal(false);
            if (onClose) onClose();
          }}
        />
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add to Trip</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : trips.length > 0 ? (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => handleAddToTrip(trip.id)}
                      className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600 rounded-xl transition-colors border-2 border-transparent hover:border-purple-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          ✈️
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white">{trip.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{trip.destination}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {trip.tripExperiences?.length || 0} experiences
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✈️</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No trips yet</p>
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
          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
        >
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="bg-white dark:bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 z-10"
        title="Add to Trip"
      >
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {renderModal()}
    </>
  );
};

export default AddToTripButton;

