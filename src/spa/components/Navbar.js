import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { useTheme } from "../contexts/ThemeContext";

const NavbarComponent = () => {
  const { isLoggedIn, userData, handleLogout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log("Click outside detected, closing dropdown");
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        console.log("Escape pressed, closing dropdown");
        setIsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isOpen || isMobileMenuOpen) {
      // Use setTimeout to avoid immediate closing
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }, 200);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isMobileMenuOpen]);

  // Listen for authentication state changes
  useEffect(() => {
    const handleAuthStateChange = () => {
      setIsOpen(false);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    return () => window.removeEventListener('authStateChanged', handleAuthStateChange);
  }, []);

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

  const handleMenuClick = (path) => {
    setIsOpen(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleAvatarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Avatar clicked, toggling dropdown:", !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <nav className="glass shadow-soft sticky top-0 z-50 border-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="group flex shrink-0 cursor-pointer items-center space-x-3" onClick={() => navigate("/")}>
          <div className="relative size-12 overflow-hidden rounded-lg sm:size-14">
            <img
              src="https://res.cloudinary.com/dgwscraqf/image/upload/v1760353071/Gemini_Generated_Image_33kp1f33kp1f33kp_t9qw8a.png"
              className="transition-smooth size-full object-cover group-hover:scale-110"
              style={{ objectPosition: 'center', transform: 'scale(2)' }}
              alt="Wanderly Logo"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-600 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-20"></div>
          </div>
              <span className="gradient-text text-xl font-bold sm:text-2xl">
            Wanderly
          </span>
        </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button
                onClick={() => navigate("/")}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                Feed
              </button>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore
              </button>
              <button
                onClick={() => navigate("/travel-guide")}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                AI Guide
              </button>
              <button
                onClick={() => navigate("/trip-planner")}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Trips
              </button>
              <button
                onClick={() => navigate("/events")}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Events
              </button>
              <button
                onClick={() => navigate("/trip-planner")}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Trip Planner
              </button>
              <button
                onClick={() => navigate("/NewExperience")}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                Share
              </button>
              <button
                onClick={() => navigate("/ChatPage")}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
              >
                Messages
              </button>
            </div>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4 md:ml-6">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  // Sun icon for light mode
                  <svg className="size-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  // Moon icon for dark mode
                  <svg className="size-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleAvatarClick}
                    className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    <img
                      src={userData?.profileImage || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                alt="User settings"
                      className="size-8 cursor-pointer rounded-full object-cover transition-all hover:ring-2 hover:ring-orange-500"
              />
            </button>
            
            {isOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="rounded-t-xl border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{userData?.fullName || "User"}</p>
                  <p className="truncate text-xs text-gray-600">{userData?.email || "email@example.com"}</p>
                </div>
                
                      <div className="py-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                            console.log("Profile clicked");
                            handleMenuClick("/Profil");
                          }}
                          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <svg className="mr-3 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                  Profile
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                            console.log("Notification clicked");
                            handleMenuClick("/Notification");
                          }}
                          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <svg className="mr-3 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5 7h14M5 11h14M5 15h10" />
                          </svg>
                          Notifications
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                            console.log("Settings clicked");
                            handleMenuClick("/Settings");
                          }}
                          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <svg className="mr-3 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                  Settings
                </button>
                      </div>
                
                      <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                            console.log("Sign out clicked");
                      setIsOpen(false);
                            handleLogoutClick();
                          }}
                          className="flex w-full items-center px-4 py-3 text-sm text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <svg className="mr-3 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
                <div className="flex items-center space-x-3">
                  <button
              onClick={() => navigate("/login")} 
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              Login
                  </button>
                  <button
              onClick={() => navigate("/signup")}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
            >
              Sign up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-700 hover:bg-gray-100 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <svg className="size-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <button
              onClick={() => handleMenuClick("/")}
              className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-orange-600"
        >
          Feed
            </button>
            <button
              onClick={() => handleMenuClick("/explore")}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-purple-600"
        >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore
            </button>
            <button
              onClick={() => handleMenuClick("/travel-guide")}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-purple-600"
        >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              AI Guide
            </button>
            <button
              onClick={() => handleMenuClick("/trip-planner")}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-purple-600"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Trips
            </button>
            <button
              onClick={() => handleMenuClick("/events")}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-purple-600"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Events
            </button>
            <button
              onClick={() => handleMenuClick("/trip-planner")}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-purple-600"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Collections
            </button>
            <button
              onClick={() => handleMenuClick("/NewExperience")}
              className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-orange-600"
        >
          Share
            </button>
            <button
              onClick={() => handleMenuClick("/ChatPage")}
              className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-orange-600"
        >
          Messages
            </button>

            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-purple-600"
            >
              {isDark ? (
                <>
                  <svg className="size-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark Mode
                </>
              )}
            </button>
            
            {isLoggedIn ? (
              <>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">{userData?.fullName || "User"}</p>
                    <p className="text-xs text-gray-600">{userData?.email || "email@example.com"}</p>
                  </div>
                  <button
                    onClick={() => handleMenuClick("/Profil")}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-orange-600"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleMenuClick("/Notification")}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-orange-600"
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => handleMenuClick("/Settings")}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-orange-600"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogoutClick();
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:text-red-700"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                <button
                  onClick={() => handleMenuClick("/login")}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  Login
                </button>
                <button
                  onClick={() => handleMenuClick("/signup")}
                  className="w-full rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarComponent;
