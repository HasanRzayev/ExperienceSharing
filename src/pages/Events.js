import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Store all events
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, going, interested, my
  const [showAllEvents, setShowAllEvents] = useState(false); // Toggle for debugging
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    maxAttendees: 0,
    price: 0,
    currency: 'USD'
  });
  const token = Cookies.get('token');
  const navigate = useNavigate();
  
  // Get minimum date (now + 1 hour)
  const getMinDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  useEffect(() => {
    fetchEvents();
  }, [showAllEvents]);

  useEffect(() => {
    applyFilter();
  }, [filter, allEvents]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const endpoint = showAllEvents ? 'all' : 'upcoming';
      const url = `${apiBaseUrl}/Event/${endpoint}`;
      
      console.log('Fetching events from:', url);
      
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log('Events response:', response.data);
      console.log('Events count:', response.data.totalCount);
      
      // Backend-dən gələn data structure-u yoxlayaq
      const eventsData = response.data.events || response.data || [];
      console.log('Events data:', eventsData);
      console.log('Events array length:', eventsData.length);
      
      const eventsArray = Array.isArray(eventsData) ? eventsData : [];
      setAllEvents(eventsArray);
      setEvents(eventsArray);
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      // Don't show error to user, just show empty state
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    const userId = getUserIdFromToken();
    
    if (filter === 'all') {
      setEvents(allEvents);
    } else if (filter === 'going') {
      const filtered = allEvents.filter(event => 
        event.attendees?.some(a => a.userId === parseInt(userId) && a.status === 'Going')
      );
      setEvents(filtered);
    } else if (filter === 'interested') {
      const filtered = allEvents.filter(event => 
        event.attendees?.some(a => a.userId === parseInt(userId) && a.status === 'Interested')
      );
      setEvents(filtered);
    } else if (filter === 'my') {
      const filtered = allEvents.filter(event => 
        event.createdByUserId === parseInt(userId)
      );
      setEvents(filtered);
    }
  };

  const getUserIdFromToken = () => {
    try {
      const token = Cookies.get("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub;
    } catch (error) {
      return null;
    }
  };

  const getMyRSVP = (event) => {
    const userId = getUserIdFromToken();
    if (!userId || !event.attendees) return null;
    const myAttendance = event.attendees.find(a => a.userId === parseInt(userId));
    return myAttendance?.status || null;
  };

  const handleRSVP = async (eventId, status, e) => {
    if (e) e.stopPropagation();
    
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.post(
        `${apiBaseUrl}/Event/${eventId}/rsvp`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const eventData = {
        ...newEvent,
        eventDate: new Date(newEvent.eventDate).toISOString()
      };

      console.log('Creating event:', eventData);
      
      const response = await axios.post(`${apiBaseUrl}/Event`, eventData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Event created:', response.data);

      // Close modal and reset form
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        eventDate: '',
        maxAttendees: 0,
        price: 0,
        currency: 'USD'
      });
      
      // Refresh events list
      await fetchEvents();
      
      alert('✅ Event yaradıldı! İndi events list-də görünməlidir.');
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error details:', error.response?.data);
      alert('❌ Event yaradıla bilmədi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                🎫 Events & Meetups
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Discover and join travel events</p>
            </div>
            {token && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Event
              </button>
            )}
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              All Events
            </button>
            
            {token && (
              <>
                <button
                  onClick={() => setFilter('going')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    filter === 'going' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  <span>✓</span> Going
                </button>
                <button
                  onClick={() => setFilter('interested')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    filter === 'interested' 
                      ? 'bg-yellow-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  <span>?</span> Interested
                </button>
                <button
                  onClick={() => setFilter('my')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    filter === 'my' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  <span>👑</span> My Events
                </button>
              </>
            )}
            
            {/* Debug toggle */}
            <button
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="ml-auto px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {showAllEvents ? 'All Time' : 'Upcoming Only'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-500 relative">
                {event.coverImage && (
                  <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                )}
                {event.price > 0 ? (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {event.currency} {event.price}
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    FREE
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.eventDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {event.attendees?.length || 0} attending
                  </div>
                </div>

                <div className="flex gap-2">
                  {token ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event.id, 'Going', e);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          getMyRSVP(event) === 'Going'
                            ? 'bg-green-500 text-white shadow-lg scale-105'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {getMyRSVP(event) === 'Going' ? '✓ Going' : 'Going'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event.id, 'Interested', e);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          getMyRSVP(event) === 'Interested'
                            ? 'bg-yellow-500 text-white shadow-lg scale-105'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {getMyRSVP(event) === 'Interested' ? '✓ Interested' : 'Interested'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/login');
                      }}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                    >
                      Login to RSVP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 max-w-md mx-auto shadow-lg">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No events yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Check back later for upcoming events!</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Event</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Baku Food Tour Meetup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Baku, Azerbaijan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      min={getMinDate()}
                      value={newEvent.eventDate}
                      onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Event must be at least 1 hour from now
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Attendees (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (0 = FREE)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newEvent.currency}
                        onChange={(e) => setNewEvent({ ...newEvent, currency: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="USD">USD</option>
                        <option value="AZN">AZN</option>
                        <option value="EUR">EUR</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Events;

