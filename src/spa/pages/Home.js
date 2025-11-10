import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Cookies from "js-cookie";
import {
  FaUsers,
  FaHeart,
  FaComment,
  FaShare,
  FaPaperPlane,
  FaSmile,
  FaMapMarkerAlt,
  FaCheck,
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaCopy,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LikeButton from "../components/LikeButton";
import AddToTripButton from "../components/AddToTripButton";
import SaveButton from "../components/SaveButton";
import AIRecommendations from "../components/AIRecommendations";
import StatusUploadModal from "../components/StatusUploadModal";
import StatusViewer from "../components/StatusViewer";
import MentionInput from "../components/MentionInput";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(null);
  const navigate = useNavigate();

  // Ensure posts is always an array - safety check
  useEffect(() => {
    if (!Array.isArray(posts)) {
      console.warn("Posts is not an array, resetting to empty array:", posts);
      setPosts([]);
    }
  }, [posts]);

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

  // Status states - ensure it's always an array
  const [statuses, setStatuses] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(null);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Ensure statuses is always an array - safety check
  useEffect(() => {
    if (!Array.isArray(statuses)) {
      console.warn(
        "Statuses is not an array, resetting to empty array:",
        statuses,
      );
      setStatuses([]);
    }
  }, [statuses]);

  const apiBaseUrl = useMemo(
    () =>
      process.env.REACT_APP_API_BASE_URL ||
      "https://experiencesharingbackend.runasp.net/api",
    [],
  );

  const fetchPosts = useCallback(
    async (pageNumber) => {
      try {
        setLoading(true);
        const token = Cookies.get("token");

        if (!token) {
          console.warn("No token found, user might not be logged in");
          setPosts([]);
          setLoading(false);
          return;
        }

        const url = `${apiBaseUrl}/Experiences/following-feed?page=${pageNumber}&pageSize=10`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.warn("Not logged in - redirecting to login");
          }
          setPosts([]);
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Ensure data is an array
        const postsData = Array.isArray(data) ? data : [];

        if (pageNumber === 1) {
          setPosts(postsData);
        } else {
          setPosts((prev) => {
            const prevPosts = Array.isArray(prev) ? prev : [];
            return [...prevPosts, ...postsData];
          });
        }

        setHasMore(postsData.length > 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching following feed:", error);
        setPosts([]);
        setLoading(false);
        if (error.name !== "AbortError") {
          console.warn("Failed to fetch following feed");
        }
      }
    },
    [apiBaseUrl],
  );

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleSubmitComment = async (postId, e) => {
    e?.preventDefault();
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `${apiBaseUrl}/Experiences/${postId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: commentText.trim() }),
        },
      );

      if (response.ok) {
        setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
        setShowEmojiPicker((prev) => ({ ...prev, [postId]: false }));
        // Refresh posts to get updated comment count
        fetchPosts(1);
        setPage(1);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
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
    if (!showShareModal) return "";
    return `${window.location.origin}/card/${showShareModal.id}`;
  };

  const getShareText = () => {
    if (!showShareModal) return "";
    return `Check out this amazing experience: "${showShareModal.title}" by ${showShareModal.user?.firstName} ${showShareModal.user?.lastName}`;
  };

  const handleSocialShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
          "_blank",
        );
        break;
      case "instagram":
        window.open(`https://www.instagram.com/`, "_blank");
        break;
      case "tiktok":
        window.open(`https://www.tiktok.com/`, "_blank");
        break;
      case "copy":
        copyLink(showShareModal.id);
        break;
      case "native":
        if (navigator.share) {
          navigator.share({
            title: showShareModal.title,
            text: text,
            url: url,
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
      const response = await axios.get(
        `${apiBaseUrl}/Followers/messaging-contacts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setFollowers(response.data || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowers([]);
    }
  };

  const toggleFollower = (followerId) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId],
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
        await axios.post(
          `${apiBaseUrl}/Messages`,
          {
            receiverId: followerId,
            content: `${text}\n\n🔗 ${url}`,
            messageType: "experience_share",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      alert(`Experience shared with ${selectedFollowers.length} contact(s)!`);
      setShowFollowersModal(false);
      setSelectedFollowers([]);
      setShowShareModal(null);
    } catch (error) {
      console.error("Error sending to followers:", error);
      alert("Error sending messages. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  const fetchStatuses = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        console.log("[Home] fetchStatuses: no token, skipping");
        setStatuses([]);
        return;
      }

      console.log(
        "[Home] fetchStatuses: requesting statuses from",
        `${apiBaseUrl}/Status`,
      );
      const response = await axios.get(`${apiBaseUrl}/Status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[Home] Status API Response:", {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        data: response.data,
      });

      // Ensure response.data is an array
      let statusesData = response.data;

      // Multiple checks to ensure we get an array
      if (!statusesData) {
        console.warn("Status response is null or undefined");
        setStatuses([]);
        return;
      }

      if (!Array.isArray(statusesData)) {
        console.warn("Status response is not an array:", statusesData);

        // Try different possible formats
        if (statusesData && typeof statusesData === "object") {
          if (Array.isArray(statusesData.data)) {
            statusesData = statusesData.data;
          } else if (Array.isArray(statusesData.statuses)) {
            statusesData = statusesData.statuses;
          } else if (Array.isArray(statusesData.items)) {
            statusesData = statusesData.items;
          } else {
            // If it's an object but not an array, set empty array
            console.error(
              "Status data is object but not array format:",
              statusesData,
            );
            setStatuses([]);
            return;
          }
        } else {
          // If it's not an object or array, set empty array
          console.error(
            "Status data is not a valid format:",
            typeof statusesData,
            statusesData,
          );
          setStatuses([]);
          return;
        }
      }

      // Additional safety check
      if (!Array.isArray(statusesData)) {
        console.error(
          "Status data is still not an array after parsing:",
          statusesData,
        );
        setStatuses([]);
        return;
      }

      // Group statuses by user and get the latest one for each user
      const statusMap = new Map();
      try {
        statusesData.forEach((status) => {
          if (status && status.userId) {
            const userId = status.userId;
            if (
              !statusMap.has(userId) ||
              new Date(status.createdAt) >
                new Date(statusMap.get(userId).createdAt)
            ) {
              statusMap.set(userId, status);
            }
          } else {
            console.warn("[Home] Invalid status entry:", status);
          }
        });
      } catch (forEachError) {
        console.error("Error processing statuses forEach:", forEachError);
        setStatuses([]);
        return;
      }

      // Convert back to array
      const uniqueStatuses = Array.from(statusMap.values());
      console.log("[Home] Unique statuses after grouping:", uniqueStatuses);

      // Final safety check before setting
      if (!Array.isArray(uniqueStatuses)) {
        console.error("uniqueStatuses is not an array:", uniqueStatuses);
        setStatuses([]);
        return;
      }

      setStatuses(uniqueStatuses);
    } catch (error) {
      console.error("[Home] Error fetching statuses:", error);
      console.error("[Home] Error response:", error.response?.data);
      console.error("[Home] Error status:", error.response?.status);
      // Set empty array on error to prevent crash
      setStatuses([]);
    }
  }, [apiBaseUrl]);

  const handleStatusUpload = () => {
    fetchStatuses();
  };

  const [selectedStatusUserId, setSelectedStatusUserId] = useState(null);
  const [userStatuses, setUserStatuses] = useState([]);

  // Ensure userStatuses is always an array - safety check
  useEffect(() => {
    if (!Array.isArray(userStatuses)) {
      console.warn(
        "userStatuses is not an array, resetting to empty array:",
        userStatuses,
      );
      setUserStatuses([]);
    }
  }, [userStatuses]);

  const handleYourStatusClick = () => {
    // Check if user is logged in
    const token = Cookies.get("token");
    if (!token) {
      // If not logged in, redirect to login page
      navigate("/login");
      return;
    }
    // Just open the status upload modal to create new status
    setShowStatusModal(true);
  };

  const handleStatusClick = async (userId) => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      // Fetch all statuses first
      const response = await axios.get(`${apiBaseUrl}/Status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure response.data is an array
      let statusesData = response.data;
      if (!Array.isArray(statusesData)) {
        console.warn(
          "handleStatusClick: response.data is not an array:",
          statusesData,
        );
        if (
          statusesData &&
          typeof statusesData === "object" &&
          Array.isArray(statusesData.data)
        ) {
          statusesData = statusesData.data;
        } else if (
          statusesData &&
          typeof statusesData === "object" &&
          Array.isArray(statusesData.statuses)
        ) {
          statusesData = statusesData.statuses;
        } else {
          console.error("handleStatusClick: Could not parse statuses data");
          return;
        }
      }

      // Filter statuses for the selected user
      const userStatusesList = Array.isArray(statusesData)
        ? statusesData.filter((status) => status && status.userId === userId)
        : [];

      if (userStatusesList && userStatusesList.length > 0) {
        setUserStatuses(userStatusesList);
        setSelectedStatusIndex(0); // Start with first status
        setSelectedStatusUserId(userId);
        setShowStatusViewer(true);
      } else {
        // No active statuses for this user
        console.warn("No statuses found for user:", userId);
      }
    } catch (error) {
      console.error("Error fetching user statuses:", error);
      setUserStatuses([]);
    }
  };

  const handleStatusDelete = async () => {
    // Fetch fresh statuses from server
    await fetchStatuses();

    // If viewing a specific user's statuses, refresh them
    if (selectedStatusUserId) {
      try {
        const token = Cookies.get("token");
        if (token) {
          const response = await axios.get(`${apiBaseUrl}/Status`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userStatusesList = Array.isArray(response.data)
            ? response.data.filter(
                (status) => status && status.userId === selectedStatusUserId,
              )
            : [];

          if (userStatusesList.length > 0) {
            setUserStatuses(userStatusesList);
          } else {
            // No more statuses, close viewer
            setShowStatusViewer(false);
            setUserStatuses([]);
          }
        }
      } catch (error) {
        console.error("Error refreshing user statuses:", error);
      }
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await axios.get(`${apiBaseUrl}/Auth/GetProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add id field from userExperiences
      const userData = response.data;
      if (userData.userExperiences && userData.userExperiences.length > 0) {
        userData.id = userData.userExperiences[0].userId;
      }

      setCurrentUser(userData);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchPosts(page);
    fetchStatuses();
    fetchCurrentUser();
  }, [page, fetchPosts, fetchStatuses, fetchCurrentUser]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="mx-auto max-w-2xl px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaUsers className="text-2xl text-indigo-600 sm:text-3xl" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-3xl">
                Feed
              </h1>
            </div>
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600 to-pink-600 px-3 py-2 text-sm text-white transition-all hover:from-orange-700 hover:to-pink-700 sm:gap-2 sm:px-4 sm:text-base"
            >
              <FaPlus />
              <span className="hidden sm:inline">Status</span>
            </button>
          </div>
          <p className="hidden text-sm text-gray-600 dark:text-gray-400 sm:block sm:text-base">
            Latest posts from people you follow
          </p>
        </div>

        {/* Status Feed - Instagram style circular profiles */}
        {Array.isArray(statuses) && statuses.length > 0 && (
          <div className="mb-4 overflow-x-auto rounded-xl bg-white p-3 shadow-md dark:bg-gray-800 dark:shadow-gray-900 sm:mb-8 sm:rounded-2xl sm:p-4">
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={handleYourStatusClick}
                className="flex min-w-[50px] flex-col items-center gap-2 sm:min-w-[60px]"
              >
                <div className="relative">
                  <div className="size-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 p-0.5 sm:size-16">
                    <div className="flex size-full items-center justify-center rounded-full bg-white p-0.5 dark:bg-gray-800">
                      <FaPlus className="size-6 text-gray-400 sm:size-8" />
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Your Status
                </span>
              </button>

              {statuses.map((status) => {
                if (!status || !status.userId) return null;

                const hasUnviewed = !status.isViewed;
                return (
                  <button
                    key={status.userId}
                    className="flex min-w-[50px] cursor-pointer flex-col items-center gap-2 transition-transform hover:scale-105 sm:min-w-[60px]"
                    onClick={() => handleStatusClick(status.userId)}
                  >
                    <div className="relative">
                      <div
                        className={`size-12 rounded-full sm:size-16 ${hasUnviewed ? "bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 p-0.5" : "bg-gray-200 p-0.5"}`}
                      >
                        <img
                          src={
                            status.user?.profileImage ||
                            "https://via.placeholder.com/60"
                          }
                          alt={status.user?.firstName}
                          className="size-full rounded-full object-cover"
                        />
                      </div>
                      {hasUnviewed && (
                        <div className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-red-500 sm:size-4"></div>
                      )}
                    </div>
                    <span className="max-w-[50px] truncate text-xs text-gray-600 dark:text-gray-400 sm:max-w-[60px]">
                      {status.user?.firstName || "User"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {Array.isArray(posts) &&
            posts.length > 0 &&
            posts.map((post, index) => (
              <div
                key={post.id || index}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900 dark:hover:shadow-gray-800 sm:rounded-2xl">
                  {/* User Header */}
                  <div className="flex items-center gap-2 border-b border-gray-100 p-3 dark:border-gray-700 sm:gap-3 sm:p-4">
                    <img
                      src={
                        post.user?.profileImage ||
                        "https://via.placeholder.com/40"
                      }
                      alt={post.user?.userName}
                      className="size-10 cursor-pointer rounded-full border-2 border-indigo-100 object-cover transition-colors hover:border-indigo-400 sm:size-12"
                      onClick={() => navigate(`/profile/${post.user?.id}`)}
                    />
                    <div className="min-w-0 flex-1">
                      <h3
                        className="cursor-pointer truncate text-sm font-bold text-gray-800 transition-colors hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 sm:text-base"
                        onClick={() => navigate(`/profile/${post.user?.id}`)}
                      >
                        {post.user?.userName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:gap-2 sm:text-sm">
                        <FaMapMarkerAlt className="text-xs" />
                        <span className="truncate">{post.location}</span>
                        <span>•</span>
                        <span className="hidden sm:inline">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    {post.rating && (
                      <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 sm:px-3">
                        <span className="text-xs font-bold text-yellow-500 sm:text-sm">
                          ★
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 sm:text-sm">
                          {post.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.imageUrls?.length > 0 && (
                    <div className="group relative h-64 bg-gray-100 sm:h-80 md:h-96">
                      <img
                        src={post.imageUrls[0]?.url}
                        alt={post.title}
                        className="size-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
                        onClick={() => navigate(`/card/${post.id}`)}
                      />

                      {/* 3 Dots Menu */}
                      <div className="absolute right-4 top-4 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptionsMenu((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }));
                          }}
                          className="rounded-full bg-white bg-opacity-90 p-2.5 shadow-lg transition-all duration-200 hover:bg-opacity-100 hover:shadow-xl dark:bg-gray-800"
                          title="More options"
                        >
                          <svg
                            className="size-5 text-gray-700 dark:text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
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
                                setShowOptionsMenu((prev) => ({
                                  ...prev,
                                  [post.id]: false,
                                }));
                              }}
                            />
                            <div className="absolute right-0 top-12 z-40 min-w-[200px] rounded-xl border border-gray-200 bg-white py-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                              {/* Add to Trip */}
                              <AddToTripButton
                                experienceId={post.id}
                                onClose={() =>
                                  setShowOptionsMenu((prev) => ({
                                    ...prev,
                                    [post.id]: false,
                                  }))
                                }
                                renderAsMenuItem={true}
                              />

                              {/* Save/Bookmark */}
                              <SaveButton
                                experienceId={post.id}
                                renderAsMenuItem={true}
                              />

                              {/* Like */}
                              <LikeButton
                                experienceId={post.id}
                                onClose={() =>
                                  setShowOptionsMenu((prev) => ({
                                    ...prev,
                                    [post.id]: false,
                                  }))
                                }
                                renderAsMenuItem={true}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {post.imageUrls.length > 1 && (
                        <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white">
                          1/{post.imageUrls.length}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-3 sm:p-4">
                    <h2
                      className="mb-2 line-clamp-2 cursor-pointer text-lg font-bold text-gray-900 transition-colors hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 sm:text-2xl"
                      onClick={() => navigate(`/card/${post.id}`)}
                    >
                      {post.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
                      {post.description}
                    </p>

                    {/* Tags */}
                    {post.tagsName?.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {post.tagsName.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="cursor-pointer rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 sm:px-3 sm:text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tagsName.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:px-3 sm:text-sm">
                            +{post.tagsName.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 border-t border-gray-100 pt-4 sm:gap-4">
                      {/* Like Button */}
                      <div className="flex-1">
                        <LikeButton
                          experienceId={post.id}
                          initialLikes={post.likes}
                        />
                      </div>

                      {/* Comment Button */}
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1 rounded-lg p-2 text-xs font-semibold transition-all sm:gap-2 sm:px-4 sm:text-base ${
                          expandedComments[post.id]
                            ? "bg-blue-100 text-orange-600"
                            : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-orange-600"
                        }`}
                      >
                        <FaComment className="text-sm sm:text-base" />
                        <span>{post.commentsCount || 0}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-1 rounded-lg bg-gray-100 p-2 text-xs font-semibold text-gray-600 transition-all hover:bg-orange-50 hover:text-orange-600 sm:gap-2 sm:px-4 sm:text-base"
                      >
                        <FaShare className="text-sm sm:text-base" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {/* Comment Section */}
                    {expandedComments[post.id] && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        {/* Comment Input with @Mention */}
                        <form
                          onSubmit={(e) => handleSubmitComment(post.id, e)}
                          className="mb-4"
                        >
                          <MentionInput
                            value={commentTexts[post.id] || ""}
                            onChange={(value) =>
                              setCommentTexts((prev) => ({
                                ...prev,
                                [post.id]: value,
                              }))
                            }
                            placeholder="Write a comment... (@mention users)"
                            onSubmit={(e) => handleSubmitComment(post.id, e)}
                            className="mb-2"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={
                                !commentTexts[post.id]?.trim() ||
                                submittingComment[post.id]
                              }
                              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {submittingComment[post.id]
                                ? "Posting..."
                                : "Post Comment"}
                            </button>
                          </div>
                        </form>

                        {/* View All Comments Link */}
                        <button
                          onClick={() => navigate(`/card/${post.id}`)}
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          View all {post.commentsCount || 0} comments
                        </button>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => navigate(`/card/${post.id}`)}
                      className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-orange-600 py-3 font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:from-indigo-700 hover:to-orange-700 hover:shadow-lg"
                    >
                      View Details
                    </button>
                  </div>
                </article>
              </div>
            ))}
        </div>

        {/* Loading Indicator */}
        <div ref={loadingRef} className="py-8 text-center">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="size-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
          )}
          {!hasMore && Array.isArray(posts) && posts.length > 0 && (
            <p className="inline-block rounded-lg bg-white px-6 py-3 text-sm text-gray-500 shadow-sm">
              ✨ All posts loaded
            </p>
          )}
          {(!Array.isArray(posts) || posts.length === 0) && !loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-lg">
              <FaUsers className="mx-auto mb-4 text-6xl text-gray-300" />
              <h3 className="mb-2 text-2xl font-bold text-gray-800">
                No Posts Yet
              </h3>
              <p className="mb-6 text-gray-600">
                People you follow haven't shared anything yet.
                <br />
                Start following more people or explore new content!
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-orange-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-orange-700"
              >
                Explore Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Share Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {showShareModal.title}
              </p>
            </div>

            {/* Share Options */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {/* Send to Contacts */}
              <button
                onClick={() => {
                  setShowShareModal(showShareModal);
                  fetchFollowers();
                  setShowFollowersModal(true);
                }}
                className="col-span-2 flex flex-col items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-orange-500 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-indigo-600 hover:to-orange-600"
              >
                <FaUsers className="mb-2 text-3xl" />
                <span className="font-semibold">Send to Contacts</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare("whatsapp")}
                className="flex flex-col items-center rounded-2xl bg-green-500 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-green-600"
              >
                <FaWhatsapp className="mb-2 text-3xl" />
                <span className="font-semibold">WhatsApp</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleSocialShare("instagram")}
                className="flex flex-col items-center rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-pink-600"
              >
                <FaInstagram className="mb-2 text-3xl" />
                <span className="font-semibold">Instagram</span>
              </button>

              {/* TikTok */}
              <button
                onClick={() => handleSocialShare("tiktok")}
                className="flex flex-col items-center rounded-2xl bg-black p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-800"
              >
                <FaTiktok className="mb-2 text-3xl" />
                <span className="font-semibold">TikTok</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleSocialShare("copy")}
                className="flex flex-col items-center rounded-2xl bg-blue-500 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-orange-600"
              >
                {copied ? (
                  <FaCheck className="mb-2 text-3xl" />
                ) : (
                  <FaCopy className="mb-2 text-3xl" />
                )}
                <span className="font-semibold">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>

            {/* Native Share (if available) */}
            {navigator.share && (
              <button
                onClick={() => handleSocialShare("native")}
                className="mb-4 w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-orange-700 hover:to-orange-700"
              >
                <FaShare className="mr-2 inline" />
                Share via Device
              </button>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setShowShareModal(null)}
              className="w-full rounded-2xl bg-gray-200 py-3 font-semibold text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="mx-4 flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Send to Contacts
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select contacts to share this experience with
              </p>
            </div>

            {/* Followers List */}
            <div className="mb-4 flex-1 overflow-y-auto">
              {followers.length > 0 ? (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className={`flex cursor-pointer items-center rounded-xl border-2 p-3 transition-all ${
                        selectedFollowers.includes(follower.id)
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleFollower(follower.id)}
                    >
                      <img
                        src={
                          follower.profileImage ||
                          "https://via.placeholder.com/40"
                        }
                        alt={follower.username}
                        className="mr-3 size-12 rounded-full object-cover"
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
                      <div
                        className={`flex size-6 items-center justify-center rounded-full border-2 transition-all ${
                          selectedFollowers.includes(follower.id)
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedFollowers.includes(follower.id) && (
                          <FaCheck className="text-sm text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FaUsers className="mx-auto mb-4 text-4xl text-gray-400" />
                  <p className="text-gray-500">No contacts found</p>
                  <p className="text-sm text-gray-400">
                    Start following people or have people follow you to share
                    experiences!
                  </p>
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
                className="flex-1 rounded-2xl bg-gray-200 py-3 font-semibold text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={sendToFollowers}
                disabled={selectedFollowers.length === 0 || sending}
                className="flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-600 py-3 font-semibold text-white transition-all duration-200 hover:from-orange-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
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

      {/* Status Upload Modal */}
      <StatusUploadModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpload={handleStatusUpload}
      />

      {/* Status Viewer */}
      {showStatusViewer &&
        Array.isArray(userStatuses) &&
        userStatuses.length > 0 && (
          <StatusViewer
            isOpen={showStatusViewer}
            onClose={() => {
              setShowStatusViewer(false);
              setUserStatuses([]);
              fetchStatuses();
            }}
            statuses={userStatuses}
            currentUser={currentUser}
            onStatusDelete={handleStatusDelete}
            initialIndex={selectedStatusIndex}
          />
        )}
    </main>
  );
}

export default Home;
