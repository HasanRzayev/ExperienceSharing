import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Cookies from "js-cookie";
import { FaUsers, FaHeart, FaComment, FaShare, FaPaperPlane, FaSmile, FaMapMarkerAlt, FaCheck, FaWhatsapp, FaInstagram, FaTiktok, FaCopy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LikeButton from "../components/LikeButton";
import AddToTripButton from "../components/AddToTripButton";
import EmojiPicker from 'emoji-picker-react';
import axios from "axios";

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(null);
  const navigate = useNavigate();
  
  // Comment states
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Options menu state (3 dots)
  const [showOptionsMenu, setShowOptionsMenu] = useState({});
  
  const apiBaseUrl = useMemo(() => 
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5029/api',
    []
  );

  const fetchPosts = useCallback(async (pageNumber) => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      if (!token) {
        console.warn("No token found, user might not be logged in");
        setLoading(false);
        return;
      }

      const url = `${apiBaseUrl}/Experiences/following-feed?page=${pageNumber}&pageSize=10`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn("Unauthorized - redirecting to login");
        }
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      
      if (pageNumber === 1) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching following feed:", error);
      setLoading(false);
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch following feed');
      }
    }
  }, [apiBaseUrl]);

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleSubmitComment = async (postId, e) => {
    e?.preventDefault();
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${apiBaseUrl}/Experiences/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText.trim() })
      });

      if (response.ok) {
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
        setShowEmojiPicker(prev => ({ ...prev, [postId]: false }));
        // Refresh posts to get updated comment count
        fetchPosts(1);
        setPage(1);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = (post) => {
    setShowShareModal(post);
    setCopied(false);
  };

  const copyLink = (postId) => {
    const link = `${window.location.origin}/card/${postId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareUrl = () => {
    if (!showShareModal) return '';
    return `${window.location.origin}/card/${showShareModal.id}`;
  };

  const getShareText = () => {
    if (!showShareModal) return '';
    return `Check out this amazing experience: "${showShareModal.title}" by ${showShareModal.user?.firstName} ${showShareModal.user?.lastName}`;
  };

  const handleSocialShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
        break;
      case 'instagram':
        window.open(`https://www.instagram.com/`, '_blank');
        break;
      case 'tiktok':
        window.open(`https://www.tiktok.com/`, '_blank');
        break;
      case 'copy':
        copyLink(showShareModal.id);
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: showShareModal.title,
            text: text,
            url: url
          });
        }
        break;
      default:
        break;
    }
  };

  const fetchFollowers = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFollowers(response.data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setFollowers([]);
    }
  };

  const toggleFollower = (followerId) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId]
    );
  };

  const sendToFollowers = async () => {
    if (selectedFollowers.length === 0) return;
    
    setSending(true);
    try {
      const token = Cookies.get("token");
      const url = getShareUrl();
      const text = getShareText();
      
      for (const followerId of selectedFollowers) {
        await axios.post(`${apiBaseUrl}/Messages`, {
          receiverId: followerId,
          content: `${text}\n\n🔗 ${url}`,
          messageType: 'experience_share'
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      alert(`Experience shared with ${selectedFollowers.length} contact(s)!`);
      setShowFollowersModal(false);
      setSelectedFollowers([]);
      setShowShareModal(null);
    } catch (error) {
      console.error('Error sending to followers:', error);
      alert('Error sending messages. Please try again.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <FaUsers className="text-3xl text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Feed</h1>
          </div>
          <p className="text-gray-600">Latest posts from people you follow</p>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
              <article className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* User Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <img
                    src={post.user?.profileImage || "https://via.placeholder.com/40"}
                    alt={post.user?.userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 cursor-pointer hover:border-indigo-400 transition-colors"
                    onClick={() => navigate(`/profile/${post.user?.id}`)}
                  />
                  <div className="flex-1">
                    <h3 
                      className="font-bold text-gray-800 hover:text-indigo-600 cursor-pointer transition-colors"
                      onClick={() => navigate(`/profile/${post.user?.id}`)}
                    >
                      {post.user?.userName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaMapMarkerAlt className="text-xs" />
                      <span>{post.location}</span>
                      <span>•</span>
                      <span>{new Date(post.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  {post.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <span className="text-yellow-500 font-bold">★</span>
                      <span className="font-bold text-gray-700">{post.rating}</span>
                    </div>
                  )}
                </div>

                {/* Post Image */}
                {post.imageUrls?.length > 0 && (
                  <div 
                    className="relative h-96 bg-gray-100 group"
                  >
                    <img
                      src={post.imageUrls[0]?.url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => navigate(`/card/${post.id}`)}
                    />
                    
                    {/* 3 Dots Menu */}
                    <div className="absolute top-4 right-4 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOptionsMenu(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                        }}
                        className="bg-white dark:bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        title="More options"
                      >
                        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {showOptionsMenu[post.id] && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOptionsMenu(prev => ({ ...prev, [post.id]: false }));
                            }}
                          />
                          <div className="absolute top-12 right-0 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]">
                            {/* Add to Trip */}
                            <AddToTripButton 
                              experienceId={post.id} 
                              onClose={() => setShowOptionsMenu(prev => ({ ...prev, [post.id]: false }))}
                              renderAsMenuItem={true}
                            />

                            {/* Like */}
                            <LikeButton 
                              experienceId={post.id}
                              onClose={() => setShowOptionsMenu(prev => ({ ...prev, [post.id]: false }))}
                              renderAsMenuItem={true}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    {post.imageUrls.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        1/{post.imageUrls.length}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="p-4">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => navigate(`/card/${post.id}`)}
                  >
                    {post.title}
                  </h2>
                  <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                  
                  {/* Tags */}
                  {post.tagsName?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tagsName.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full font-medium hover:bg-indigo-100 transition-colors cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                      {post.tagsName.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                          +{post.tagsName.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    {/* Like Button */}
                    <div className="flex-1">
                      <LikeButton experienceId={post.id} initialLikes={post.likes} />
                    </div>

                    {/* Comment Button */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                        expandedComments[post.id]
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <FaComment />
                      <span>{post.commentsCount || 0}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-purple-50 hover:text-purple-600 transition-all"
                    >
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comment Section */}
                  {expandedComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Comment Input */}
                      <form onSubmit={(e) => handleSubmitComment(post.id, e)} className="mb-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="w-full pl-4 pr-24 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <FaSmile className="text-gray-500" />
                            </button>
                            <button
                              type="submit"
                              disabled={!commentTexts[post.id]?.trim() || submittingComment[post.id]}
                              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <FaPaperPlane />
                            </button>
                          </div>
                        </div>
                        
                        {/* Emoji Picker */}
                        {showEmojiPicker[post.id] && (
                          <div className="absolute z-50 mt-2">
                            <EmojiPicker
                              onEmojiClick={(emojiData) => {
                                setCommentTexts(prev => ({
                                  ...prev,
                                  [post.id]: (prev[post.id] || '') + emojiData.emoji
                                }));
                              }}
                            />
                          </div>
                        )}
                      </form>

                      {/* View All Comments Link */}
                      <button
                        onClick={() => navigate(`/card/${post.id}`)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm hover:underline"
                      >
                        View all {post.commentsCount || 0} comments
                      </button>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button 
                    onClick={() => navigate(`/card/${post.id}`)}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    View Details
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div ref={loadingRef} className="text-center py-8">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-gray-500 text-sm bg-white rounded-lg px-6 py-3 inline-block shadow-sm">
              ✨ All posts loaded
            </p>
          )}
          {posts.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Posts Yet</h3>
              <p className="text-gray-600 mb-6">
                People you follow haven't shared anything yet.<br/>
                Start following more people or explore new content!
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Explore Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Experience</h3>
              <p className="text-gray-600 dark:text-gray-300">{showShareModal.title}</p>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Send to Contacts */}
              <button
                onClick={() => {
                  setShowShareModal(showShareModal);
                  fetchFollowers();
                  setShowFollowersModal(true);
                }}
                className="flex flex-col items-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg col-span-2"
              >
                <FaUsers className="text-3xl mb-2" />
                <span className="font-semibold">Send to Contacts</span>
              </button>
              
              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <FaWhatsapp className="text-3xl mb-2" />
                <span className="font-semibold">WhatsApp</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleSocialShare('instagram')}
                className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <FaInstagram className="text-3xl mb-2" />
                <span className="font-semibold">Instagram</span>
              </button>

              {/* TikTok */}
              <button
                onClick={() => handleSocialShare('tiktok')}
                className="flex flex-col items-center p-4 bg-black hover:bg-gray-800 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <FaTiktok className="text-3xl mb-2" />
                <span className="font-semibold">TikTok</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleSocialShare('copy')}
                className="flex flex-col items-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {copied ? (
                  <FaCheck className="text-3xl mb-2" />
                ) : (
                  <FaCopy className="text-3xl mb-2" />
                )}
                <span className="font-semibold">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>

            {/* Native Share (if available) */}
            {navigator.share && (
              <button
                onClick={() => handleSocialShare('native')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg mb-4"
              >
                <FaShare className="inline mr-2" />
                Share via Device
              </button>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setShowShareModal(null)}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-2xl font-semibold transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send to Contacts</h3>
              <p className="text-gray-600 dark:text-gray-300">Select contacts to share this experience with</p>
            </div>

            {/* Followers List */}
            <div className="flex-1 overflow-y-auto mb-4">
              {followers.length > 0 ? (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedFollowers.includes(follower.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleFollower(follower.id)}
                    >
                      <img
                        src={follower.profileImage || 'https://via.placeholder.com/40'}
                        alt={follower.username}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {follower.username}
                        </p>
                        {follower.firstName && (
                          <p className="text-sm text-gray-500">
                            {follower.firstName} {follower.lastName}
                          </p>
                        )}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedFollowers.includes(follower.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedFollowers.includes(follower.id) && (
                          <FaCheck className="text-white text-sm" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No contacts found</p>
                  <p className="text-sm text-gray-400">Start following people or have people follow you to share experiences!</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFollowersModal(false);
                  setSelectedFollowers([]);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-2xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={sendToFollowers}
                disabled={selectedFollowers.length === 0 || sending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center"
              >
                {sending ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send ({selectedFollowers.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}

export default Home;
