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
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl p-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="mb-1 text-3xl font-bold text-gray-800 dark:text-gray-100">Explore</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalCount > 0 ? `${totalCount} experiences found` : 'Discover new experiences'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users, titles, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
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
                      ? `bg-gradient-to-r ${filter.color} scale-105 text-white shadow-lg` 
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
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className="animate-fadeInUp group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
              style={{animationDelay: `${index * 0.03}s`}}
              onClick={() => window.location.href = `/card/${post.id}`}
            >
              {/* Post Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {post.imageUrls?.length > 0 ? (
                  <>
                    <img
                      src={post.imageUrls[0]?.url}
                      alt={post.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* 3 Dots Menu */}
                    <div className="absolute right-4 top-4 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOptionsMenu(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                        }}
                        className="rounded-full bg-white bg-opacity-90 p-2.5 shadow-lg transition-all duration-200 hover:bg-opacity-100 hover:shadow-xl dark:bg-gray-800"
                        title="More options"
                      >
                        <svg className="size-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
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
                          <div className="absolute right-0 top-12 z-40 min-w-[200px] rounded-xl border border-gray-200 bg-white py-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute inset-x-4 bottom-4 text-white">
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
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-6xl text-gray-400">🌍</span>
                  </div>
                )}
              </div>

              {/* Post Info */}
              <div className="p-4">
                {/* User Info */}
                <div className="mb-3 flex items-center gap-2">
                  <img
                    src={post.user?.profileImage || "https://via.placeholder.com/32"}
                    alt={post.user?.userName}
                    className="size-8 rounded-full border-2 border-indigo-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-800">
                      {post.user?.userName}
                    </h3>
                  </div>
                  {post.rating && (
                    <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1">
                      <FaStar className="text-xs text-yellow-500" />
                      <span className="text-xs font-semibold text-gray-700">{post.rating}</span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800">
                  {post.title}
                </h2>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                  {post.description}
                </p>

                {/* Location */}
                <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span className="truncate">{post.location}</span>
                </div>

                {/* Tags */}
                {post.tagsName?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {post.tagsName.slice(0, 2).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tagsName.length > 2 && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        +{post.tagsName.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
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
        <div ref={loadingRef} className="py-12 text-center">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="size-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div className="inline-block rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
              ✨ All posts loaded
            </div>
          )}
          {posts.length === 0 && !loading && (
            <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-2xl font-bold text-gray-800">
                {searchQuery ? "No Results Found" : "No Posts Yet"}
              </h3>
              <p className="mb-6 text-gray-600">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "Be the first to share an experience!"}
              </p>
              {!searchQuery && (
                <a 
                  href="/new-experience" 
                  className="inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
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
        className="fixed bottom-20 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-2xl text-white shadow-lg transition-transform duration-300 hover:scale-110 md:hidden"
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

