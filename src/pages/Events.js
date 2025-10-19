import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, going, interested
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5029/api';
      const response = await axios.get(`${apiBaseUrl}/Event/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5029/api';
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎫 Events & Meetups
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Discover and join travel events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
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
                  <button
                    onClick={() => handleRSVP(event.id, 'Going')}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleRSVP(event.id, 'Interested')}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Interested
                  </button>
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
    </div>
  );
};

export default Events;

