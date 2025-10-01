import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import NavbarComponent from "./components/Navbar";
import FooterComponent from "./components/Footer";
import CardAbout from './pages/CardAbout';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import ProfilePage from "./pages/Profil";
import NewExperience from "./pages/NewExperience";
import UserProfilePage from './pages/UserProfilePage';
import Notification from './pages/Notification';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Setting';
import FollowersPage from './pages/Follow';
import FollowingPage  from './pages/Following';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token); // Token varsa, isLoggedIn true olsun
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
  };

  return (
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
  );
}

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
