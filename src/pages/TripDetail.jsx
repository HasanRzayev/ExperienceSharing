import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTrip, setEditTrip] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    currency: 'USD',
    status: 'Planning'
  });
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTrip();
  }, [id, token, navigate]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.get(`${apiBaseUrl}/Trip/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      alert('Trip not found');
      navigate('/trip-planner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.delete(`${apiBaseUrl}/Trip/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Trip deleted successfully');
      navigate('/trip-planner');
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
    }
  };

  const handleRemoveExperience = async (tripExperienceId) => {
    if (!window.confirm('Remove this experience from trip?')) {
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.delete(`${apiBaseUrl}/Trip/${id}/experiences/${tripExperienceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrip(); // Refresh trip data
    } catch (error) {
      console.error('Error removing experience:', error);
      alert('Failed to remove experience');
    }
  };

  const handleEditClick = () => {
    if (trip) {
      setEditTrip({
        title: trip.title || '',
        description: trip.description || '',
        destination: trip.destination || '',
        startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
        endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
        budget: trip.budget || 0,
        currency: trip.currency || 'USD',
        status: trip.status || 'Planning'
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      
      // Format dates to ISO string
      const tripData = {
        ...editTrip,
        startDate: new Date(editTrip.startDate).toISOString(),
        endDate: new Date(editTrip.endDate).toISOString()
      };
      
      await axios.put(`${apiBaseUrl}/Trip/${id}`, tripData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setShowEditModal(false);
      fetchTrip(); // Refresh trip data
      alert('Trip updated successfully!');
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip: ' + (error.response?.data?.message || 'Please check all fields'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Planning: 'bg-yellow-100 text-yellow-800',
      Ongoing: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || badges.Planning;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/trip-planner')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Trips
        </button>

        {/* Trip Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-br from-purple-400 to-blue-500 relative">
            {trip.coverImage && (
              <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(trip.status)}`}>
                {trip.status}
              </span>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">{trip.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">{trip.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Destination</p>
                  <p className="font-semibold">{trip.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Duration</p>
                  <p className="font-semibold">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {trip.budget > 0 && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Budget</p>
                    <p className="font-semibold">{trip.currency} {trip.budget.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleEditClick}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Edit Trip
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-semibold transition-colors"
              >
                Delete Trip
              </button>
            </div>
          </div>
        </div>

        {/* Experiences in Trip */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Experiences in This Trip ({trip.tripExperiences?.length || 0})
          </h2>

          {trip.tripExperiences && trip.tripExperiences.length > 0 ? (
            <div className="space-y-4">
              {trip.tripExperiences.map((te, index) => (
                <div
                  key={te.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  {te.experience?.imageUrls?.[0]?.url && (
                    <img
                      src={te.experience.imageUrls[0].url}
                      alt={te.experience.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/about/${te.experience?.id}`)}
                  >
                    <h3 className="font-bold text-gray-800 dark:text-white">{te.experience?.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{te.experience?.location}</p>
                    {te.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">📝 {te.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExperience(te.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from trip"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No experiences added yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding experiences to your trip!
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Browse Experiences
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Trip Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Trip</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateTrip} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTrip.title}
                  onChange={(e) => setEditTrip({ ...editTrip, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Summer Europe Trip 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editTrip.description}
                  onChange={(e) => setEditTrip({ ...editTrip, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your trip..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  value={editTrip.destination}
                  onChange={(e) => setEditTrip({ ...editTrip, destination: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Paris, France"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editTrip.startDate}
                    onChange={(e) => setEditTrip({ ...editTrip, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editTrip.endDate}
                    onChange={(e) => setEditTrip({ ...editTrip, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={editTrip.budget}
                    onChange={(e) => setEditTrip({ ...editTrip, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={editTrip.currency}
                    onChange={(e) => setEditTrip({ ...editTrip, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AZN">AZN (₼)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editTrip.status}
                  onChange={(e) => setEditTrip({ ...editTrip, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Planning">Planning</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Update Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetail;

