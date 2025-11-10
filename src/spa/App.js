import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import React, { useState, useEffect, createContext, useContext, lazy, Suspense } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load all components for better performance
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const TravelGuide = lazy(() => import("./pages/TravelGuide"));
const NavbarComponent = lazy(() => import("./components/Navbar"));
const FooterComponent = lazy(() => import("./components/Footer"));
const CardAbout = lazy(() => import('./pages/CardAbout'));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const QRLogin = lazy(() => import("./pages/QRLogin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProfilePage = lazy(() => import("./pages/Profil"));
const NewExperience = lazy(() => import("./pages/NewExperience"));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const Notification = lazy(() => import('./pages/Notification'));
const ChatPage = lazy(() => import('./pages/ChatPageV2'));
const Settings = lazy(() => import('./pages/Setting'));
const FollowersPage = lazy(() => import('./pages/Follow'));
const FollowingPage = lazy(() => import('./pages/Following'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminExperiences = lazy(() => import('./pages/admin/AdminExperiences'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTags = lazy(() => import('./pages/admin/AdminTags'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminLikes = lazy(() => import('./pages/admin/AdminLikes'));
const AdminFollows = lazy(() => import('./pages/admin/AdminFollows'));
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));

// Footer Pages
const AboutUs = lazy(() => import('./pages/footer/AboutUs'));
const HowItWorks = lazy(() => import('./pages/footer/HowItWorks'));
const Featured = lazy(() => import('./pages/footer/Featured'));
const TravelTips = lazy(() => import('./pages/footer/TravelTips'));
const CommunityGuidelines = lazy(() => import('./pages/footer/CommunityGuidelines'));
const HelpCenter = lazy(() => import('./pages/footer/HelpCenter'));
const ContactUs = lazy(() => import('./pages/footer/ContactUs'));
const ReportIssue = lazy(() => import('./pages/footer/ReportIssue'));
const FAQ = lazy(() => import('./pages/footer/FAQ'));
const SafetyTips = lazy(() => import('./pages/footer/SafetyTips'));
const PrivacyPolicy = lazy(() => import('./pages/footer/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/footer/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/footer/CookiePolicy'));
const ContentPolicy = lazy(() => import('./pages/footer/ContentPolicy'));
const DMCA = lazy(() => import('./pages/footer/DMCA'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

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
    const userDataCookie = Cookies.get("userData");
    setIsLoggedIn(!!token);
    
    // If userData exists in cookie (for admin), use it directly
    if (userDataCookie) {
      try {
        const parsedUserData = JSON.parse(userDataCookie);
        setUserData(parsedUserData);
        console.log('Loaded userData from cookie:', parsedUserData);
      } catch (error) {
        console.error('Error parsing userData cookie:', error);
        // If parsing fails, fetch from API
        if (token) {
          fetchUserData();
        }
      }
    } else if (token) {
      // If no userData cookie but token exists, fetch user data from API
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await fetch(`${apiBaseUrl}/Auth/GetProfile`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include' // CORS için gerekli
      });
      
      if (response.ok) {
        const data = await response.json();
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
    Cookies.remove("userData"); // Also remove userData cookie
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

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com";

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthContext.Provider value={authValue}>
          <Router>
          <Suspense fallback={<LoadingSpinner />}>
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
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/travel-guide" element={<TravelGuide />} />
                  <Route path="/about/:id" element={<CardAbout />} />
                  <Route path="/card/:id" element={<CardAbout />} />
                  <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
                  <Route path="/qr-login" element={<QRLogin />} />
                  <Route path="/signup" element={isLoggedIn ? <Navigate to="/" /> : <SignUp />} />
                  <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/" /> : <ForgotPassword />} />
                  <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/" /> : <ResetPassword />} />
                  <Route path="/chatpage" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ChatPage /></ProtectedRoute>} />
                  <Route path="/Profil" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProfilePage /></ProtectedRoute>} />
                  <Route path="/trip-planner" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TripPlanner /></ProtectedRoute>} />
                  <Route path="/trip/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TripDetail /></ProtectedRoute>} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/event/:id" element={<EventDetail />} />
                  <Route path="/collections" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TripPlanner /></ProtectedRoute>} />
                  <Route path="/Notification" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Notification /></ProtectedRoute>} />
                  <Route path="/Settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings /></ProtectedRoute>} />
                  <Route path="/Follow" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FollowersPage /></ProtectedRoute>} />
                  <Route path="/Following" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FollowingPage /></ProtectedRoute>} />
                  <Route path="/profile/:userId" element={<UserProfilePage />} />
                  <Route path="/NewExperience" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NewExperience /></ProtectedRoute>} />
                  <Route path="/edit-experience/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NewExperience /></ProtectedRoute>} />
                  
                  {/* Footer Pages */}
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/featured" element={<Featured />} />
                  <Route path="/travel-tips" element={<TravelTips />} />
                  <Route path="/guidelines" element={<CommunityGuidelines />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/report" element={<ReportIssue />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/safety" element={<SafetyTips />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/content-policy" element={<ContentPolicy />} />
                  <Route path="/dmca" element={<DMCA />} />
                </Routes>
                <FooterComponent />
              </>
            } />
          </Routes>
        </Suspense>
        </Router>
      </AuthContext.Provider>
    </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ isLoggedIn, userData, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }
  
  // Check email since DB has no role column
  if (!userData || userData.email !== 'admin@wanderly.com') {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
}
