import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import CustomCard from "./Card";
import Cookies from "js-cookie";
import { FaUsers, FaHeart, FaComment } from "react-icons/fa";

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(null);
  
  // Memoize API base URL
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <FaUsers className="text-3xl text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Axın</h1>
          </div>
          <p className="text-gray-600">İzlədiyiniz insanların son paylaşımları</p>
        </div>

        {/* Posts Feed - 1 Column */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                {/* User Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <img
                    src={post.user?.profileImage || "https://via.placeholder.com/40"}
                    alt={post.user?.userName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{post.user?.userName}</h3>
                    <p className="text-sm text-gray-500">{post.location}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(post.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Post Image */}
                {post.imageUrls?.length > 0 && (
                  <img
                    src={post.imageUrls[0]?.url}
                    alt={post.title}
                    className="w-full h-96 object-cover"
                  />
                )}

                {/* Post Content */}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-3 line-clamp-3">{post.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-gray-500 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <FaHeart className="text-red-500" />
                      <span>{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaComment className="text-blue-500" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                    {post.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{post.rating}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tagsName?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tagsName.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Button */}
                  <button 
                    onClick={() => window.location.href = `/card/${post.id}`}
                    className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                  >
                    Ətraflı Bax
                  </button>
                </div>
              </div>
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
            <p className="text-gray-500 text-sm">Bütün postlar yükləndi</p>
          )}
          {posts.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Heç bir post yoxdur</h3>
              <p className="text-gray-600 mb-6">
                İzlədiyiniz insanların hələ paylaşımı yoxdur.<br/>
                Yeni insanları izləməyə başlayın!
              </p>
              <a 
                href="/explore" 
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
              >
                Kəşf Et
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Home;