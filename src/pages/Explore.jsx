import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaSearch, FaFire, FaClock, FaStar, FaHeart, FaComment, FaMapMarkerAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import AddToTripButton from "../components/AddToTripButton";
import LikeButton from "../components/LikeButton";
import SaveButton from "../components/SaveButton";

function Explore() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("newest");
  const [totalCount, setTotalCount] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState({});
  const loadingRef = useRef(null);
  
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  const fetchPosts = useCallback(async (pageNumber, filter, search) => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      let url = `${apiBaseUrl}/Experiences/explore?page=${pageNumber}&pageSize=12&sortBy=${filter}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      if (pageNumber === 1) {
        setPosts(data.experiences || []);
      } else {
        setPosts(prev => [...prev, ...(data.experiences || [])]);
      }
      
      setTotalCount(data.totalCount || 0);
      setHasMore((data.experiences || []).length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching explore posts:", error);
      setLoading(false);
      setHasMore(false);
    }
  }, [apiBaseUrl]);

  // Infinite scroll observer
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

  // Fetch posts when page, filter, or search changes
  useEffect(() => {
    fetchPosts(page, activeFilter, searchQuery);
  }, [page, activeFilter, searchQuery, fetchPosts]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [activeFilter, searchQuery]);

  const filters = [
    { id: "newest", label: "Newest", icon: FaClock, color: "from-blue-500 to-cyan-500" },
    { id: "popular", label: "Most Popular", icon: FaFire, color: "from-orange-500 to-red-500" },
    { id: "toprated", label: "Top Rated", icon: FaStar, color: "from-yellow-500 to-amber-500" }
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">Explore</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {totalCount > 0 ? `${totalCount} experiences found` : 'Discover new experiences'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users, titles, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${filter.color} text-white shadow-lg scale-105` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className={isActive ? "animate-bounce" : ""} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Posts Grid - Instagram Style */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className="group animate-fadeInUp bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              style={{animationDelay: `${index * 0.03}s`}}
              onClick={() => window.location.href = `/card/${post.id}`}
            >
              {/* Post Image */}
              <div className="relative overflow-hidden aspect-square bg-gray-100">
                {post.imageUrls?.length > 0 ? (
                  <>
                    <img
                      src={post.imageUrls[0]?.url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                            {/* Save/Bookmark */}
                            <SaveButton
                              experienceId={post.id}
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
                    
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <FaHeart />
                            <span>{post.likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaComment />
                            <span>{post.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-6xl text-gray-400">🌍</span>
                  </div>
                )}
              </div>

              {/* Post Info */}
              <div className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={post.user?.profileImage || "https://via.placeholder.com/32"}
                    alt={post.user?.userName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {post.user?.userName}
                    </h3>
                  </div>
                  {post.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <FaStar className="text-yellow-500 text-xs" />
                      <span className="text-xs font-semibold text-gray-700">{post.rating}</span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span className="truncate">{post.location}</span>
                </div>

                {/* Tags */}
                {post.tagsName?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tagsName.slice(0, 2).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tagsName.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{post.tagsName.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1">
                      <FaHeart className="text-red-400" />
                      <span>{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaComment className="text-blue-400" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(post.date).toLocaleDateString('az-AZ', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div ref={loadingRef} className="text-center py-12">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div className="text-gray-500 text-sm bg-white rounded-lg p-4 inline-block shadow-sm">
              ✨ All posts loaded
            </div>
          )}
          {posts.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchQuery ? "No Results Found" : "No Posts Yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "Be the first to share an experience!"}
              </p>
              {!searchQuery && (
                <a 
                  href="/new-experience" 
                  className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                >
                  Share Your Experience
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <a
        href="/new-experience"
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform duration-300 z-30"
      >
        +
      </a>

      <style jsx>{`
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
          opacity: 0;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}

export default Explore;

