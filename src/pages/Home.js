import NavbarComponent from "../components/Navbar"; 
import FooterComponent from "../components/Footer";
import React, { useState, useEffect, useCallback, useRef } from "react";
import CustomCard from "./Card";

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const loadingRef = useRef(null);

  const fetchPosts = useCallback(async (query, pageNumber) => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5029/api';
      const url = query 
        ? `${apiBaseUrl}/Experiences/search?query=${query}&page=${pageNumber}&pageSize=8`
        : `${apiBaseUrl}/Experiences?page=${pageNumber}&pageSize=8`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      console.log("Home.js - Fetched posts data:", data);
      console.log("Home.js - First post user data:", data[0]?.user);
      
      if (pageNumber === 1) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      // Don't show error to user, just log it
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch experiences, using empty array');
      }
    }
  }, []);

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
    if (page === 1) {
      fetchPosts(searchQuery, page);
    } else {
      fetchPosts(searchQuery, page);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center mb-12 animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              Discover Amazing
              <br />
              <span className="text-6xl md:text-8xl">Experiences</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Share your adventures, explore new places, and connect with fellow travelers around the world
            </p>
          </div>
          
          {/* Search Input */}
          <div className="w-full max-w-4xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative glass p-2 rounded-2xl">
                <input
                  type="text"
                  placeholder="🔍 Search experiences, places, or people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern w-full text-lg py-4 pl-6 pr-16 border-0 bg-transparent placeholder-gray-500 focus:placeholder-gray-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="container mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Experiences</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover incredible stories and adventures shared by our community
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {posts.map((post, index) => (
            <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
              <CustomCard
                id={post.id}
                imageUrls={post.imageUrls?.length > 0 ? post.imageUrls[0]?.url : ""}
                date={post.date}
                title={post.title}
                description={post.description}
                location={post.location}
                rating={post.rating}
                user={post.user}
              />
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div ref={loadingRef} className="text-center py-8">
          {loading && <div className="loader">Loading...</div>}
          {!hasMore && posts.length > 0 && (
            <p className="text-gray-600">No more experiences to load</p>
          )}
          {posts.length === 0 && !loading && (
            <div className="glass p-12 rounded-3xl max-w-md mx-auto">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No experiences found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to share an experience!"}
              </p>
              {!searchQuery && (
                <button className="btn-primary">
                  Share Your First Experience
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Home;