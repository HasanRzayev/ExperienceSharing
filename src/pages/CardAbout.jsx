import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import LikeButton from "../components/LikeButton";
import FollowButton from "../components/FollowButton";
import { Carousel } from "flowbite-react";
import MapDisplay from "../components/MapDisplay";
import RatingComponent from "../components/RatingComponent";
import RatingsDisplay from "../components/RatingsDisplay";
import { FaMapMarkerAlt, FaCalendarAlt, FaShare, FaWhatsapp, FaInstagram, FaTiktok, FaCopy, FaCheck, FaUsers, FaPaperPlane, FaComment, FaHeart, FaSmile, FaReply, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EmojiPicker from 'emoji-picker-react';
import MentionInput from '../components/MentionInput';
import MentionText from '../components/MentionText';

const CardAbout = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [ratingRefreshKey, setRatingRefreshKey] = useState(0);
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const handleUserNameClick = () => {
    if (post.user?.id) {
      navigate(`/profile/${post.user.id}`);
    }
  };

  // Comments functions
  const fetchComments = async () => {
    if (!id) return;

    setLoadingComments(true);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await fetch(`${apiBaseUrl}/Experiences/${id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data || []);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleMention = (userId, username) => {
    setMentionedUserIds(prev => {
      if (prev.includes(userId)) return prev;
      return [...prev, userId];
    });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !token) return;

    setSubmittingComment(true);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      
      // Submit comment
      const response = await fetch(`${apiBaseUrl}/Experiences/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      });

      if (response.ok) {
        const commentData = await response.json();
        
        // TODO: Re-enable notification system when needed
        // Send notification to mentioned users
        /*
        if (mentionedUserIds.length > 0) {
          for (const mentionedId of mentionedUserIds) {
            try {
              const currentUserId = getCurrentUserId();
              await axios.post(`${apiBaseUrl}/Notification`, {
                UserId: mentionedId,
                Type: 'mention',
                Message: `mentioned you in a comment`,
                FromUserId: currentUserId,
                ExperienceId: parseInt(id),
                CommentId: commentData.id
              }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
              });
            } catch (error) {
              console.error('Error sending mention notification:', error);
              // Silently fail - don't block comment submission
            }
          }
        }
        */
        
        setNewComment('');
        setShowEmojiPicker(false);
        setMentionedUserIds([]);
        await fetchComments(); // Refresh comments
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim() || !token) return;

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await fetch(`${apiBaseUrl}/Experiences/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyText.trim(),
          parentCommentId: commentId
        })
      });

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleReaction = async (commentId, isLike) => {
    if (!token) return;

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await fetch(`${apiBaseUrl}/Experiences/comments/${commentId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isLike })
      });

      fetchComments();
    } catch (error) {
      console.error('Error reacting to comment:', error);
    }
  };

  // Komment silmə funksiyası
  const handleDeleteComment = async (commentId) => {
    if (!token) return;
    
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await fetch(`${apiBaseUrl}/Experiences/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchComments(); // Refresh comments after deletion
        alert('Comment deleted successfully!');
      } else {
        alert('Failed to delete comment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment. Please try again.');
    }
  };

  // Current user ID-ni əldə etmək
  const getCurrentUserId = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
             payload.userId || 
             payload.id || 
             payload.sub;
    } catch (error) {
      return null;
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewComment(prev => prev + emojiObject.emoji);
  };

  // Share funksionallığı
  const getShareUrl = () => {
    return `${window.location.origin}/about/${id}`;
  };

  const getShareText = () => {
    return `Check out this amazing experience: "${post?.title}" by ${post?.user?.firstName} ${post?.user?.lastName}`;
  };

  const handleShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
        break;
      case 'instagram':
        // Instagram Stories üçün
        window.open(`https://www.instagram.com/`, '_blank');
        break;
      case 'tiktok':
        // TikTok üçün
        window.open(`https://www.tiktok.com/`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: post?.title,
            text: text,
            url: url
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }
    }
    setShowShareModal(false);
  };

  // Messaging contacts fetch funksiyası
  const fetchFollowers = async () => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      
      // Əvvəlcə messaging-contacts endpoint-ini cəhd et
      try {
        const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFollowers(response.data || []);
        return;
      } catch (messagingError) {
        console.warn('Messaging-contacts endpoint not available, falling back to following + followers:', messagingError);
      }
      
      // Fallback: following və followers endpoint-lərini ayrı-ayrı çağır
      const [followingResponse, followersResponse] = await Promise.all([
        axios.get(`${apiBaseUrl}/Followers/following`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${apiBaseUrl}/Followers/followers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      
      const following = followingResponse.data || [];
      const followers = followersResponse.data || [];
      
      // Bütün kontakları birləşdir və dublikatları çıxar
      const allContacts = [...following, ...followers]
        .reduce((acc, contact) => {
          const existing = acc.find(c => c.id === contact.id);
          if (!existing) {
            acc.push({
              ...contact,
              RelationshipType: following.find(f => f.id === contact.id) && followers.find(f => f.id === contact.id)
                ? 'mutual'
                : following.find(f => f.id === contact.id)
                ? 'following'
                : 'follower'
            });
          }
          return acc;
        }, [])
        .sort((a, b) => {
          // mutual -> following -> follower sırası
          const order = { mutual: 0, following: 1, follower: 2 };
          return (order[a.RelationshipType] || 3) - (order[b.RelationshipType] || 3);
        });
      
      setFollowers(allContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setFollowers([]);
    }
  };

  // Follower seçimi
  const toggleFollower = (followerId) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId) 
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  // Takib etdiklərinə göndər
  const sendToFollowers = async () => {
    if (selectedFollowers.length === 0) return;
    
    setSending(true);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const url = getShareUrl();
      const text = getShareText();
      
      // Hər seçilmiş follower-ə mesaj göndər
      for (const followerId of selectedFollowers) {
        await axios.post(`${apiBaseUrl}/Messages`, {
          receiverId: followerId,
          content: `${text}\n\n🔗 ${url}`,
          messageType: 'experience_share'
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      alert(`Experience shared with ${selectedFollowers.length} follower(s)!`);
      setShowFollowersModal(false);
      setSelectedFollowers([]);
    } catch (error) {
      console.error('Error sending to followers:', error);
      alert('Error sending messages. Please try again.');
    } finally {
      setSending(false);
    }
  };
  useEffect(() => {
    console.log("CardAbout.js - useEffect called");
    console.log("CardAbout.js - Received ID:", id);
    console.log("CardAbout.js - ID type:", typeof id);
    
    const fetchPost = async () => {
      try {
        // Əgər ID userId-dirsə, fərqli endpoint istifadə et
        const isUserId = typeof id === 'string' && id.startsWith('temp-') || id === '35';
        console.log("CardAbout.js - Is userId?", isUserId);
        
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
        
        let response;
        if (isUserId) {
          console.log("CardAbout.js - Using userId endpoint");
          // Bu halda experience-ləri userId ilə axtarırıq
          response = await axios.get(
            `${apiBaseUrl}/Experiences/user/${id.replace('temp-', '')}`
          );
          setPost(response.data[0]); // İlk experience-i götürürük
        } else {
          console.log("CardAbout.js - Using normal endpoint");
          response = await axios.get(
            `${apiBaseUrl}/Experiences/${id}`
          );
          setPost(response.data);
        }
        console.log("CardAbout.js - Fetched data:", response.data);
      } catch (error) {
        console.error("CardAbout.js - Error fetching data:", error);
        console.error("CardAbout.js - Error response:", error.response?.data);
        setPost(null);
      }
    };
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
        const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (id) {
      fetchPost();
      fetchComments(); // Load comments when experience loads
      fetchUsers(); // Load users for mentions
    } else {
      console.error("CardAbout.js - No ID provided");
    }
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading experience...</p>
          <p className="text-gray-500 mt-2">Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }

  const videoSource = post.videoUrl || post.VideoUrl || null;
  const mediaImages = Array.isArray(post.imageUrls) ? post.imageUrls : [];
  const hasVideo = Boolean(videoSource);
  const hasImages = mediaImages.length > 0;
  const getImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.Url || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ana Kart */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Üst hissə: İstifadəçi məlumatları və düymələr */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* İstifadəçi məlumatları */}
        <div className="flex items-center gap-4">
                <div className="relative">
          <img
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
            src={post.user?.profileImage || "/default-avatar.png"}
            alt={post.user?.firstName}
          />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
    <p
                    className="text-xl font-bold text-white cursor-pointer hover:text-purple-200 transition-colors"
      onClick={handleUserNameClick}
    >
      {post.user?.firstName && post.user?.lastName ? `${post.user.firstName} ${post.user.lastName}` : post.user?.firstName || "Unknown User"}
    </p>
                  <p className="text-purple-100 text-sm">@{post.user?.userName || "user"}</p>
                </div>
        </div>

              {/* Like, Follow və Share düymələri */}
              <div className="flex items-center gap-3">
          <LikeButton experienceId={post.id} />
          <FollowButton userId={post.user?.id} />
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                  title="Share this experience"
                >
                  <FaShare className="text-lg" />
                </button>
              </div>
        </div>
      </div>

      {/* Media Bölümü */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
            {hasVideo && hasImages ? (
              <div className="md:grid md:grid-cols-2">
                <div className="flex items-center justify-center bg-black p-4">
                  <video
                    className="w-full h-full max-h-[28rem] object-contain rounded-xl"
                    src={videoSource}
                    poster={post.videoThumbnail || post.VideoThumbnail}
                    controls
                  />
                </div>
                <div className="h-full">
                  <Carousel className="h-64 sm:h-80 xl:h-96 2xl:h-[32rem] rounded-none">
                    {mediaImages.map((image, index) => (
                      <div key={index} className="flex items-center justify-center w-full h-full bg-gray-900">
                        <img
                          className="max-w-full max-h-full object-contain"
                          src={getImageSrc(image)}
                          alt={`Slide ${index}`}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              </div>
            ) : hasVideo ? (
              <div className="flex items-center justify-center w-full h-64 sm:h-80 xl:h-96 2xl:h-[32rem] bg-gray-900">
                <video
                  className="max-w-full max-h-full object-contain"
                  src={videoSource}
                  poster={post.videoThumbnail || post.VideoThumbnail}
                  controls
                />
              </div>
            ) : hasImages ? (
              <Carousel className="h-64 sm:h-80 xl:h-96 2xl:h-[32rem] rounded-none">
                {mediaImages.map((image, index) => (
                  <div key={index} className="flex items-center justify-center w-full h-full bg-gray-900">
                    <img
                      className="max-w-full max-h-full object-contain"
                      src={getImageSrc(image)}
                      alt={`Slide ${index}`}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="w-full h-64 sm:h-80 xl:h-96 2xl:h-[32rem] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No media available</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Başlıq */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {post.title}
        </h1>

            {/* Təsvir */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl shadow-inner mb-8">
              <p className="text-lg text-gray-800 leading-relaxed text-center">
          {post.description || "No description available."}
        </p>
            </div>

            {/* Tarix və məkan kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Tarix kartı */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <FaCalendarAlt className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Experience Date</h3>
                    <p className="text-blue-100">
            {post.date !== "0001-01-01T00:00:00"
              ? new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : "Not specified"}
          </p>
                  </div>
                </div>
              </div>

              {/* Məkan kartı */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <FaMapMarkerAlt className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Location</h3>
                    <p className="text-red-100">{post.location || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Ratings Section */}
            <div className="space-y-8">
              {post.latitude && post.longitude && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt /> Məkan
                  </h3>
                  <MapDisplay lat={post.latitude} lng={post.longitude} locationName={post.location} />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RatingComponent 
                  experienceId={post.id} 
                  onRatingSubmit={() => {
                    setRatingRefreshKey(prev => prev + 1);
                  }} 
                />
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <RatingsDisplay refreshTrigger={ratingRefreshKey} experienceId={post.id} />
                </div>
              </div>
            </div>

            {/* Tag-lər (əgər varsa) */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => {
                    // Tag-ı parse et - əgər JSON string-dirsə
                    let tagName = tag.tagName || tag.name || tag;
                    
                    // Əgər tag JSON string kimi görünürsə, parse et
                    if (typeof tagName === 'string' && (tagName.startsWith('[') || tagName.startsWith('"'))) {
                      try {
                        // Çoxlu JSON.stringify olunmuş tag-ı parse et
                        let parsed = tagName;
                        while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                          parsed = JSON.parse(parsed);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            parsed = parsed[0];
                          }
                        }
                        tagName = parsed;
                      } catch (e) {
                        // Parse xətası olarsa, original-ı saxla
                        console.error('Tag parse error:', e);
                      }
                    }
                    
                    // Əgər hələ də səhv formatdadırsa, göstərmə
                    if (typeof tagName !== 'string' || tagName.includes('\\') || tagName.includes('[')) {
                      return null;
                    }
                    
                    return (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                      >
                        #{tagName}
                      </span>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* Statistikalar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-400 to-green-500 p-4 rounded-xl text-white text-center">
                <div className="text-2xl font-bold">{post.likesCount || 0}</div>
                <div className="text-green-100">Likes</div>
              </div>
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white text-center">
                <div className="text-2xl font-bold">{post.commentsCount || 0}</div>
                <div className="text-blue-100">Comments</div>
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-4 rounded-xl text-white text-center">
                <div className="text-2xl font-bold">{post.imageUrls?.length || 0}</div>
                <div className="text-purple-100">Images</div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Experience</h3>
                <p className="text-gray-600 dark:text-gray-300">Share this amazing experience with others</p>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Send to Followers */}
                <button
                  onClick={() => {
                    setShowShareModal(false);
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
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <FaWhatsapp className="text-3xl mb-2" />
                  <span className="font-semibold">WhatsApp</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={() => handleShare('instagram')}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <FaInstagram className="text-3xl mb-2" />
                  <span className="font-semibold">Instagram</span>
                </button>

                {/* TikTok */}
                <button
                  onClick={() => handleShare('tiktok')}
                  className="flex flex-col items-center p-4 bg-black hover:bg-gray-800 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <FaTiktok className="text-3xl mb-2" />
                  <span className="font-semibold">TikTok</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => handleShare('copy')}
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
                  onClick={() => handleShare('native')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg mb-4"
                >
                  <FaShare className="inline mr-2" />
                  Share via Device
                </button>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => setShowShareModal(false)}
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
                        <div className="relative">
                          <img
                            src={follower.profileImage || "/default-avatar.png"}
                            alt={follower.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {selectedFollowers.includes(follower.id) && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <FaCheck className="text-white text-xs" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {follower.firstName || follower.Username}
                            </h4>
                            {follower.RelationshipType && (
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                follower.RelationshipType === 'mutual' 
                                  ? 'bg-green-100 text-green-800' 
                                  : follower.RelationshipType === 'following'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {follower.RelationshipType === 'mutual' ? '🤝 Mutual' :
                                 follower.RelationshipType === 'following' ? '👤 Following' :
                                 '👥 Follower'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{follower.Username}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedFollowers.includes(follower.id)
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300'
                        }`}></div>
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
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
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

        {/* Comments Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaComment className="text-2xl text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Comments</h2>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {comments.length}
            </span>
          </div>

          {/* Add Comment Form */}
          {token ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <MentionInput
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Share your thoughts about this experience..."
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                    onMention={handleMention}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {newComment.length}/500
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="self-start px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingComment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Post
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3">
                <FaHeart className="text-purple-600" />
                <p className="text-gray-700">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-purple-600 hover:text-purple-700 font-medium underline"
                  >
                    Sign in
                  </button>
                  {' '}to share your thoughts about this experience
                </p>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading comments...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => {
                const currentUserId = getCurrentUserId();
                const isPostOwner = post.user?.id && currentUserId && post.user.id.toString() === currentUserId.toString();
                const isCommentOwner = comment.userId && currentUserId && comment.userId.toString() === currentUserId.toString();
                const canDeleteComment = isPostOwner || isCommentOwner;

                return (
                  <div key={comment.id} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-4">
                      <img
                        src={comment.user?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
                        alt={comment.user?.userName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800">
                              {comment.user?.userName || 'Anonymous'}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {comment.createdAt && new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {canDeleteComment && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete comment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          <MentionText text={comment.content} users={allUsers} />
                        </p>
                        
                        {/* Reaction and Reply Buttons */}
                        {token && (
                          <div className="flex items-center gap-4 text-sm">
                            <button
                              onClick={() => handleReaction(comment.id, true)}
                              className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
                            >
                              <FaThumbsUp />
                              <span>{comment.likes || 0}</span>
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, false)}
                              className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <FaThumbsDown />
                              <span>{comment.dislikes || 0}</span>
                            </button>
                            <button
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <FaReply />
                              Reply
                            </button>
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === comment.id && token && (
                          <div className="mt-4 flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyText.trim()}
                              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Send
                            </button>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-6 border-l-2 border-purple-200 space-y-3">
                            {comment.replies.map((reply) => {
                              const isReplyOwner = reply.userId && currentUserId && reply.userId.toString() === currentUserId.toString();
                              const canDeleteReply = isPostOwner || isReplyOwner;

                              return (
                                <div key={reply.id} className="bg-white rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={reply.user?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
                                        alt={reply.user?.userName}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                      <span className="font-semibold text-sm">{reply.user?.userName}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    {canDeleteReply && (
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Delete reply"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-gray-700 text-sm">{reply.content}</p>
                                  {token && (
                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                      <button
                                        onClick={() => handleReaction(reply.id, true)}
                                        className="flex items-center gap-1 text-gray-600 hover:text-purple-600"
                                      >
                                        <FaThumbsUp />
                                        <span>{reply.likes || 0}</span>
                                      </button>
                                      <button
                                        onClick={() => handleReaction(reply.id, false)}
                                        className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                                      >
                                        <FaThumbsDown />
                                        <span>{reply.dislikes || 0}</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <FaComment className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No comments yet</h3>
                <p className="text-gray-500">
                  Be the first to share your thoughts about this experience!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardAbout;
