import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar, Navbar, Button } from "flowbite-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const NavbarComponent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get("token"));
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!Cookies.get("token"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5029/api/Auth/GetProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User Data:", response.data);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    Cookies.remove("token"); // Tokeni sil
    setIsAuthenticated(false); // UI dərhal yenilənsin
    window.dispatchEvent(new Event("storage")); // Digər səhifələrə də dəyişiklik siqnalı göndər
    navigate("/login"); // Login səhifəsinə yönləndir
  };

  return (
    <Navbar fluid rounded className="glass shadow-soft border-0">
      <Navbar.Brand href="/" className="group">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src="https://altcoinsbox.com/wp-content/uploads/2023/04/link-logo.png"
              className="mr-3 h-8 sm:h-10 transition-smooth group-hover:scale-110"
              alt="ExperienceShare Logo"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
          </div>
          <span className="self-center whitespace-nowrap text-2xl font-bold gradient-text">
            ExperienceShare
          </span>
        </div>
      </Navbar.Brand>

            <div className="flex md:order-2">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="flex items-center focus:outline-none"
            >
              <Avatar
                alt="User settings"
                img={userData?.profileImage || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                rounded
                className="cursor-pointer"
              />
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold">{userData?.fullName || "User"}</p>
                  <p className="text-xs text-gray-600 truncate">{userData?.email || "email@example.com"}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    navigate("/Profil");
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Profile
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    navigate("/Notification");
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Notification
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    navigate("/Settings");
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Settings
                </button>
                
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="order-2 flex items-center space-x-3">
            <Button 
              onClick={() => navigate("/login")} 
              className="btn-primary transition-smooth hover:shadow-lg"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate("/signup")}
              className="btn-secondary transition-smooth hover:shadow-lg"
            >
              Sign up
            </Button>
          </div>
        )}
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        <Navbar.Link 
          href="/" 
          active
          className="transition-smooth hover:text-purple-600 font-medium"
        >
          Home
        </Navbar.Link>
        <Navbar.Link 
          href="#" 
          className="transition-smooth hover:text-purple-600 font-medium"
        >
          About
        </Navbar.Link>
        <Navbar.Link 
          href="#" 
          onClick={() => navigate("/NewExperience")}
          className="transition-smooth hover:text-purple-600 font-medium"
        >
          Share Experience
        </Navbar.Link>
        <Navbar.Link 
          href="#" 
          onClick={() => navigate("/ChatPage")}
          className="transition-smooth hover:text-purple-600 font-medium"
        >
          Chat
        </Navbar.Link>
        <Navbar.Link 
          href="#" 
          className="transition-smooth hover:text-purple-600 font-medium"
        >
          Contact
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavbarComponent;
