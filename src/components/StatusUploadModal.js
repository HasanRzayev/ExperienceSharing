import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaTimes, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';

const StatusUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Instagram-style filters
  const filters = [
    { name: 'None', class: '', css: '' },
    { name: 'Clarendon', class: 'clarendon', css: 'brightness(1.1) contrast(1.2) saturate(1.35)' },
    { name: 'Gingham', class: 'gingham', css: 'sepia(0.2) saturate(0.9) brightness(1.05)' },
    { name: 'Juno', class: 'juno', css: 'sepia(0.35) hue-rotate(5deg) saturate(1.3)' },
    { name: 'Lark', class: 'lark', css: 'contrast(0.9) saturate(1.1) brightness(1.05)' },
    { name: 'Ludwig', class: 'ludwig', css: 'contrast(1.05) saturate(1.1) brightness(1.1) sepia(0.1)' },
    { name: 'Slumber', class: 'slumber', css: 'sepia(0.22) saturate(0.85) brightness(0.9)' },
    { name: 'Crema', class: 'crema', css: 'sepia(0.5) saturate(1.2)' },
    { name: 'Vintage', class: 'vintage', css: 'sepia(0.5) saturate(1.2) contrast(1.1)' },
    { name: 'Dramatic', class: 'dramatic', css: 'contrast(1.2) brightness(0.85) saturate(1.3)' },
    { name: 'Monochrome', class: 'monochrome', css: 'grayscale(1)' },
    { name: 'Sierra', class: 'sierra', css: 'sepia(0.25) saturate(1.15) contrast(0.85)' },
    { name: 'Amaro', class: 'amaro', css: 'sepia(0.35) saturate(1.5) contrast(1.05)' },
    { name: 'Perpetua', class: 'perpetua', css: 'sepia(0.3) saturate(1.1) contrast(1.1)' },
    { name: 'Mayfair', class: 'mayfair', css: 'contrast(1.05) saturate(1.3) brightness(1.1)' },
    { name: 'Rise', class: 'rise', css: 'sepia(0.25) saturate(1.35) brightness(1.15)' },
    { name: 'Hudson', class: 'hudson', css: 'hue-rotate(10deg) saturate(1.2) contrast(1.1)' },
    { name: 'Valencia', class: 'valencia', css: 'sepia(0.3) saturate(1.3) brightness(1.1)' },
    { name: 'X-Pro II', class: 'xpro2', css: 'sepia(0.4) contrast(1.2) saturate(1.1)' },
    { name: '1977', class: '1977', css: 'sepia(0.5) hue-rotate(15deg) saturate(1.2)' }
  ];

  // Real-world location search using Foursquare/Nominatim API simulation
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setLocationSuggestions([]);
      return;
    }

    // Simulated real-world locations (in production, use Foursquare or Nominatim API)
    const realLocations = [
      // Hotels
      { name: 'Grand Hotel Baku', type: 'Hotel', city: 'Baku', country: 'Azerbaijan' },
      { name: 'The Four Seasons Istanbul', type: 'Hotel', city: 'Istanbul', country: 'Turkey' },
      { name: 'Hotel Ritz Paris', type: 'Hotel', city: 'Paris', country: 'France' },
      
      // Restaurants
      { name: 'The Georgian Restaurant', type: 'Restaurant', city: 'Tbilisi', country: 'Georgia' },
      { name: 'Manger Istanbul', type: 'Restaurant', city: 'Istanbul', country: 'Turkey' },
      { name: 'Le Comptoir du Relais', type: 'Restaurant', city: 'Paris', country: 'France' },
      
      // Museums
      { name: 'Museum of Modern Art', type: 'Museum', city: 'New York', country: 'USA' },
      { name: 'Louvre Museum', type: 'Museum', city: 'Paris', country: 'France' },
      { name: 'Hermitage Museum', type: 'Museum', city: 'St. Petersburg', country: 'Russia' },
      
      // Landmarks
      { name: 'Eiffel Tower', type: 'Landmark', city: 'Paris', country: 'France' },
      { name: 'Blue Mosque', type: 'Landmark', city: 'Istanbul', country: 'Turkey' },
      { name: 'Times Square', type: 'Landmark', city: 'New York', country: 'USA' }
    ];

    // Filter locations based on query
    const filtered = realLocations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.city.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase()) ||
      loc.type.toLowerCase().includes(query.toLowerCase())
    );

    // Add current location
    const currentLocation = {
      name: 'Current Location',
      type: 'Here',
      city: 'Using GPS',
      country: ''
    };

    setLocationSuggestions([currentLocation, ...filtered]);
    setShowLocationSuggestions(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setVideo(null);
      setVideoPreview(null);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setShowFilters(true);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setImage(null);
      setImagePreview(null);
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
      setShowFilters(true);
    }
  };

  const handleRemoveMedia = () => {
    setImage(null);
    setVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    setShowFilters(false);
    setSelectedFilter('none');
    document.getElementById('status-image').value = '';
    document.getElementById('status-video').value = '';
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationQuery(location.name);
    setShowLocationSuggestions(false);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!text.trim() && !image && !video) {
      alert('Please add text, image, or video to your status');
      return;
    }

    setUploading(true);
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      
      if (text.trim()) formData.append('Text', text.trim());
      if (image) formData.append('Image', image);
      if (video) formData.append('Video', video);
      if (selectedLocation) {
        formData.append('Location', JSON.stringify(selectedLocation));
      }

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.post(`${apiBaseUrl}/Status`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Status uploaded successfully!');
      onUpload();
      handleClose();
    } catch (error) {
      console.error('Error uploading status:', error);
      alert('Failed to upload status. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setText('');
    setImage(null);
    setVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    setShowFilters(false);
    setSelectedFilter('none');
    setLocationQuery('');
    setSelectedLocation(null);
    setShowLocationSuggestions(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedFilterData = filters.find(f => f.class === selectedFilter);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Create Status</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Media Preview with Filters */}
          {(imagePreview || videoPreview) && (
            <div className="mb-6 relative">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg"
                    style={{ 
                      filter: selectedFilterData?.css || 'none' 
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              {videoPreview && (
                <div className="relative">
                  <video
                    src={videoPreview}
                    className="w-full rounded-lg"
                    controls
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Filter Selector */}
              {showFilters && imagePreview && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Filters</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {filters.map(filter => (
                      <button
                        key={filter.class}
                        onClick={() => setSelectedFilter(filter.class)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                          selectedFilter === filter.class
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Text Input */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? (Optional)"
              className="w-full p-4 border-2 border-gray-300 rounded-lg mb-4 resize-none focus:border-purple-500 focus:outline-none"
              rows={4}
              maxLength={200}
              disabled={uploading}
            />

            {/* Location Input with Real-world Suggestions */}
            <div className="relative mb-4">
              <div className="flex items-center border-2 border-gray-300 rounded-lg focus-within:border-purple-500">
                <FaMapMarkerAlt className="text-gray-400 ml-3" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    searchLocations(e.target.value);
                  }}
                  onFocus={() => searchLocations(locationQuery)}
                  placeholder="Add location (Optional) - e.g., Grand Hotel Baku, Louvre Museum..."
                  className="w-full p-3 focus:outline-none"
                  disabled={uploading}
                />
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {locationSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start gap-2"
                    >
                      <FaMapMarkerAlt className="text-purple-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">{loc.name}</div>
                        <div className="text-sm text-gray-600">{loc.type}</div>
                        <div className="text-xs text-gray-500">
                          {loc.city}{loc.country ? `, ${loc.country}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Character Count for Text */}
            <div className="text-right text-sm text-gray-500 mb-4">
              {text.length}/200
            </div>

            {/* Upload Buttons */}
            {!imagePreview && !videoPreview && (
              <div className="flex gap-4 mb-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    id="status-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 text-center transition-colors">
                    <FaCamera className="text-2xl text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-600 font-medium">📷 Add Photo</span>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input
                    id="status-video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 text-center transition-colors">
                    <FaCamera className="text-2xl text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-600 font-medium">🎥 Add Video</span>
                  </div>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all"
                disabled={uploading || (!text.trim() && !image && !video)}
              >
                {uploading ? 'Uploading...' : 'Share Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StatusUploadModal;
