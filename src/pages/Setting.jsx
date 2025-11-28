"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl, getCloudinaryBaseEndpoint } from "../utils/env";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    userName: "",
    profileImage: "",
  });

  const apiBaseUrl = getApiBaseUrl();
  const cloudinaryBaseEndpoint = getCloudinaryBaseEndpoint();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${apiBaseUrl}/Auth/GetProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        country: response.data.country || "",
        userName: response.data.userName || "",
        profileImage: response.data.profileImage || "/default-avatar.png",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");
  
      await axios.put(`${apiBaseUrl}/users/update`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setEditMode(false);
      await fetchUserProfile(); // Profil məlumatlarını yenidən yükləyirik
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", "ml_default"); // Cloudinary upload preset

    try {
      if (!cloudinaryBaseEndpoint) {
        throw new Error("Cloudinary endpoint is not configured");
      }
      const response = await axios.post(`${cloudinaryBaseEndpoint}image/upload`, uploadFormData);
      const imageUrl = response.data.secure_url;

      setFormData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      console.log("Uploaded image URL:", imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Account Settings</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your profile information and account preferences
          </p>
        </div>

        <div className="card-modern p-8">
          {user && (
            <>
              {/* Profile Image Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img
                    src={formData.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-2xl object-cover"
                  />
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                </div>
                <p className="text-sm text-gray-500">Click the camera icon to update your profile picture</p>
              </div>

              {editMode ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input-modern w-full"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input-modern w-full"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="input-modern w-full"
                      placeholder="Enter your country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="input-modern w-full"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button 
                      onClick={() => setEditMode(false)} 
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdate} 
                      disabled={loading} 
                      className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-lg font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                        <p className="text-lg font-semibold text-gray-800">{user.country || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                        <p className="text-lg font-semibold text-gray-800">{user.userName || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={() => setEditMode(true)} 
                      className="btn-secondary px-8 py-3 text-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
