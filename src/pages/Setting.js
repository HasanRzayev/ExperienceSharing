"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaMobile, FaDesktop, FaTablet, FaQrcode, FaUnlink, FaShieldAlt } from "react-icons/fa";
import QRCodeGenerator from "../components/QRCodeGenerator";
import QRCodeScanner from "../components/QRCodeScanner";
import deviceLinkService from "../services/DeviceLinkService";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // New state for tabs
  const [linkedDevices, setLinkedDevices] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    userName: "",
    profileImage: "",
  });

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === 'devices') {
      fetchLinkedDevices();
    }

    // Initialize SignalR connection
    deviceLinkService.initialize();

    // Set up SignalR event handlers
    const handleDeviceLinkConfirmed = (data) => {
      console.log('Device link confirmed:', data);
      alert('Device linked successfully!');
      fetchLinkedDevices(); // Refresh devices list
    };

    const handleDeviceLinkError = (error) => {
      console.error('Device link error:', error);
      alert('Device link failed: ' + error);
    };

    const handleSessionExpired = () => {
      console.log('Session expired');
      alert('QR code session has expired. Please generate a new one.');
      setShowQRCode(false);
    };

    deviceLinkService.on('deviceLinkConfirmed', handleDeviceLinkConfirmed);
    deviceLinkService.on('deviceLinkError', handleDeviceLinkError);
    deviceLinkService.on('sessionExpired', handleSessionExpired);

    // Cleanup on unmount
    return () => {
      deviceLinkService.off('deviceLinkConfirmed', handleDeviceLinkConfirmed);
      deviceLinkService.off('deviceLinkError', handleDeviceLinkError);
      deviceLinkService.off('sessionExpired', handleSessionExpired);
    };
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/Auth/GetProfile`, {
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
  
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/users/update`, formData, {
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

    setSelectedFile(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Cloudinary upload preset

    try {
      const response = await axios.post(`${process.env.REACT_APP_CLOUDINARY_ENDPOINT}image/upload`, formData);
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

  // Device management functions
  const fetchLinkedDevices = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/Device/linked-devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinkedDevices(response.data.devices || []);
    } catch (error) {
      console.error("Error fetching linked devices:", error);
    }
  };

  const generateQRCode = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const deviceInfo = {
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Device',
        deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        deviceInfo: navigator.userAgent
      };

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/Device/generate-qr`, deviceInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQrCodeData(response.data);
      setShowQRCode(true);

      // Join SignalR session
      if (deviceLinkService.isConnected) {
        await deviceLinkService.joinSession(response.data.sessionId);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code");
    }
  };

  const unlinkDevice = async (deviceId) => {
    if (!window.confirm("Are you sure you want to unlink this device?")) return;

    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/Device/unlink/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchLinkedDevices();
      alert("Device unlinked successfully");
    } catch (error) {
      console.error("Error unlinking device:", error);
      alert("Failed to unlink device");
    }
  };

  const toggleDeviceTrust = async (deviceId, isTrusted) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/Device/trust/${deviceId}`, 
        { isTrusted: !isTrusted }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchLinkedDevices();
    } catch (error) {
      console.error("Error updating device trust:", error);
      alert("Failed to update device trust");
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <FaMobile className="w-5 h-5" />;
      case 'desktop':
        return <FaDesktop className="w-5 h-5" />;
      case 'tablet':
        return <FaTablet className="w-5 h-5" />;
      default:
        return <FaDesktop className="w-5 h-5" />;
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

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'devices'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaQrcode className="inline w-4 h-4 mr-2" />
              Linked Devices
            </button>
          </div>
        </div>

        <div className="card-modern p-8">
          {activeTab === 'profile' && user && (
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

          {activeTab === 'devices' && (
            <div className="space-y-6">
              {/* Generate QR Code Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Link New Device</h3>
                  <p className="text-gray-600 mb-6">
                    Generate a QR code to link a new device to your account
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={generateQRCode}
                      className="btn-primary px-8 py-3 text-lg"
                    >
                      <FaQrcode className="w-5 h-5 mr-2" />
                      Generate QR Code
                    </button>
                    <button
                      onClick={() => setShowQRScanner(true)}
                      className="btn-secondary px-8 py-3 text-lg"
                    >
                      <FaQrcode className="w-5 h-5 mr-2" />
                      Scan QR Code
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code Modal */}
              {showQRCode && qrCodeData && (
                <QRCodeGenerator
                  qrData={qrCodeData}
                  onClose={() => setShowQRCode(false)}
                />
              )}

              {/* QR Scanner Modal */}
              {showQRScanner && (
                <QRCodeScanner
                  onClose={() => setShowQRScanner(false)}
                  onDeviceLinked={(deviceData) => {
                    console.log('Device linked:', deviceData);
                    fetchLinkedDevices(); // Refresh the devices list
                  }}
                />
              )}

              {/* Linked Devices List */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Linked Devices</h3>
                {linkedDevices.length === 0 ? (
                  <div className="text-center py-12">
                    <FaQrcode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No devices linked</h4>
                    <p className="text-gray-500">Generate a QR code to link your first device</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {linkedDevices.map((device) => (
                      <div key={device.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                              {getDeviceIcon(device.deviceType)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{device.deviceName}</h4>
                              <p className="text-sm text-gray-500">{device.deviceType}</p>
                              <p className="text-xs text-gray-400">
                                Last seen: {new Date(device.lastSeenAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleDeviceTrust(device.deviceId, device.isTrusted)}
                              className={`p-2 rounded-lg transition-colors ${
                                device.isTrusted
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={device.isTrusted ? 'Trusted device' : 'Mark as trusted'}
                            >
                              <FaShieldAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => unlinkDevice(device.deviceId)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Unlink device"
                            >
                              <FaUnlink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
