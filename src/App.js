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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Auth/GetProfile`, {
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
      </Router>
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
