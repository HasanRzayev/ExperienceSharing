import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import NavbarComponent from "./components/Navbar";
import FooterComponent from "./components/Footer";
import CardAbout from './pages/CardAbout';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cookies from "js-cookie";
import React, { useState, useEffect, createContext, useContext } from "react";
import ProfilePage from "./pages/Profil";
import NewExperience from "./pages/NewExperience";
import UserProfilePage from './pages/UserProfilePage';
import Notification from './pages/Notification';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Setting';
import FollowersPage from './pages/Follow';
import FollowingPage  from './pages/Following';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminExperiences from './pages/admin/AdminExperiences';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTags from './pages/admin/AdminTags';
import AdminComments from './pages/admin/AdminComments';
import AdminLikes from './pages/admin/AdminLikes';
import AdminFollows from './pages/admin/AdminFollows';

// Authentication Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
    
    // If token exists, fetch user data
    if (token) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5029/api';
      const response = await fetch(`${apiBaseUrl}/Auth/GetProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("App.js - Backend response data:", data);
        console.log("App.js - Backend response data keys:", Object.keys(data));
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogin = (userData = null) => {
    setIsLoggedIn(true);
    if (userData) {
      setUserData(userData);
    } else {
      fetchUserData();
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    setUserData(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: false, userData: null } 
    }));
  };

  const authValue = {
    isLoggedIn,
    userData,
    handleLogin,
    handleLogout,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <Routes>
          {/* Admin Routes - No Navbar/Footer */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminRoute isLoggedIn={isLoggedIn} userData={userData}>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/experiences" element={<AdminExperiences />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/tags" element={<AdminTags />} />
                <Route path="/comments" element={<AdminComments />} />
                <Route path="/likes" element={<AdminLikes />} />
                <Route path="/follows" element={<AdminFollows />} />
              </Routes>
            </AdminRoute>
          } />
          
          {/* Regular Routes - With Navbar/Footer */}
          <Route path="/*" element={
            <>
              <NavbarComponent />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about/:id" element={<CardAbout />} />
                <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
                <Route path="/chatpage" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ChatPage /></ProtectedRoute>} />
                <Route path="/signup" element={isLoggedIn ? <Navigate to="/" /> : <SignUp />} />
                <Route path="/Profil" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProfilePage /></ProtectedRoute>} />
                <Route path="/Notification" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Notification /></ProtectedRoute>} />
                <Route path="/Settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings /></ProtectedRoute>} />
                <Route path="/Follow" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FollowersPage /></ProtectedRoute>} />
                <Route path="/Following" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FollowingPage /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/NewExperience" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NewExperience /></ProtectedRoute>} />
              </Routes>
              <FooterComponent />
            </>
          } />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ isLoggedIn, userData, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }
  
  if (!userData || (userData.role !== 'admin' && userData.email !== 'admin@admin')) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
}
