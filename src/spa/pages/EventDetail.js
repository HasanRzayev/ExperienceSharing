import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaClock, FaDollarSign, FaEdit, FaTrash } from 'react-icons/fa';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRSVP, setMyRSVP] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.get(`${apiBaseUrl}/Event/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setEvent(response.data);
      
      // Check my RSVP status
      if (token) {
        checkMyRSVP(response.data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkMyRSVP = (eventData) => {
    const userIdFromToken = getUserIdFromToken();
    if (!userIdFromToken || !eventData.attendees) return;
    
    const myAttendance = eventData.attendees.find(
      a => a.userId === parseInt(userIdFromToken)
    );
    setMyRSVP(myAttendance?.status || null);
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

  const handleRSVP = async (status) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.post(
        `${apiBaseUrl}/Event/${id}/rsvp`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyRSVP(status);
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.delete(`${apiBaseUrl}/Event/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const isOrganizer = () => {
    const userIdFromToken = getUserIdFromToken();
    return event && userIdFromToken && event.createdByUserId === parseInt(userIdFromToken);
  };

  const goingAttendees = event?.attendees?.filter(a => a.status === 'Going') || [];
  const interestedAttendees = event?.attendees?.filter(a => a.status === 'Interested') || [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </button>

        {/* Event Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800">
          <div className="relative h-96 bg-gradient-to-br from-purple-400 to-blue-500">
            {event.coverImage ? (
              <img src={event.coverImage} alt={event.title} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-9xl">🎫</span>
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute right-4 top-4">
              {event.price > 0 ? (
                <div className="rounded-full bg-green-500 px-4 py-2 text-lg font-bold text-white shadow-lg">
                  {event.currency} {event.price}
                </div>
              ) : (
                <div className="rounded-full bg-blue-500 px-4 py-2 text-lg font-bold text-white shadow-lg">
                  FREE
                </div>
              )}
            </div>

            {/* Organizer Badge */}
            {isOrganizer() && (
              <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                👑 Organizer
              </div>
            )}
          </div>

          <div className="p-8">
            <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">{event.title}</h1>
            <p className="mb-6 whitespace-pre-wrap text-lg text-gray-600 dark:text-gray-400">{event.description}</p>

            {/* Event Info Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <FaCalendarAlt className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Date & Time</p>
                  <p className="font-semibold">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(event.eventDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Location</p>
                  <p className="font-semibold">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.address}</p>
                  )}
                </div>
              </div>

              <div 
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowAttendeesModal(true)}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <FaUsers className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Attendees</p>
                  <p className="font-semibold">{goingAttendees.length} going, {interestedAttendees.length} interested</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Click to see who's attending</p>
                </div>
              </div>

              {event.maxAttendees > 0 && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <FaUsers className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Capacity</p>
                    <p className="font-semibold">
                      {goingAttendees.length} / {event.maxAttendees} spots
                    </p>
                    {goingAttendees.length >= event.maxAttendees && (
                      <p className="text-xs text-red-600">Event is full!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Organizer Info */}
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 md:col-span-2">
                <img
                  src={event.createdBy?.profileImage || "https://via.placeholder.com/48"}
                  alt={event.createdBy?.userName}
                  className="size-12 rounded-full border-2 border-purple-200 object-cover"
                />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Organized by</p>
                  <p 
                    className="cursor-pointer font-semibold hover:text-purple-600 dark:hover:text-purple-400"
                    onClick={() => navigate(`/profile/${event.createdByUserId}`)}
                  >
                    {event.createdBy?.userName || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* RSVP Buttons */}
            <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              {token ? (
                <>
                  <button
                    onClick={() => handleRSVP('Going')}
                    disabled={event.maxAttendees > 0 && goingAttendees.length >= event.maxAttendees && myRSVP !== 'Going'}
                    className={`flex-1 rounded-xl px-6 py-4 text-lg font-bold transition-all ${
                      myRSVP === 'Going'
                        ? 'scale-105 bg-green-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-gray-300'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {myRSVP === 'Going' ? '✓ Going' : 'Going'}
                  </button>
                  <button
                    onClick={() => handleRSVP('Interested')}
                    className={`flex-1 rounded-xl px-6 py-4 text-lg font-bold transition-all ${
                      myRSVP === 'Interested'
                        ? 'scale-105 bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-yellow-500 hover:text-white dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {myRSVP === 'Interested' ? '✓ Interested' : 'Interested'}
                  </button>
                  
                  {/* Organizer Actions */}
                  {isOrganizer() && (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="rounded-xl border-2 border-blue-500 px-6 py-4 font-bold text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900"
                        title="Edit Event"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="rounded-xl border-2 border-red-500 px-6 py-4 font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900"
                        title="Delete Event"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 rounded-xl bg-purple-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-purple-700"
                >
                  Login to RSVP
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowAttendeesModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Event Attendees</h2>
                  <button
                    onClick={() => setShowAttendeesModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* Going */}
                {goingAttendees.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                      <span className="flex size-8 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                        ✓
                      </span>
                      Going ({goingAttendees.length})
                    </h3>
                    <div className="space-y-2">
                      {goingAttendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                          onClick={() => navigate(`/profile/${attendee.userId}`)}
                        >
                          <img
                            src={attendee.user?.profileImage || "https://via.placeholder.com/40"}
                            alt={attendee.user?.userName}
                            className="size-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {attendee.user?.userName || 'Unknown'}
                              {attendee.userId === event.createdByUserId && (
                                <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                  Organizer
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              RSVP'd {new Date(attendee.rsvpDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interested */}
                {interestedAttendees.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                      <span className="flex size-8 items-center justify-center rounded-full bg-yellow-500 text-sm text-white">
                        ?
                      </span>
                      Interested ({interestedAttendees.length})
                    </h3>
                    <div className="space-y-2">
                      {interestedAttendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                          onClick={() => navigate(`/profile/${attendee.userId}`)}
                        >
                          <img
                            src={attendee.user?.profileImage || "https://via.placeholder.com/40"}
                            alt={attendee.user?.userName}
                            className="size-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {attendee.user?.userName || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              RSVP'd {new Date(attendee.rsvpDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {goingAttendees.length === 0 && interestedAttendees.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="mb-4 text-6xl">👥</div>
                    <p className="text-gray-600 dark:text-gray-400">No attendees yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Be the first to RSVP!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetail;

