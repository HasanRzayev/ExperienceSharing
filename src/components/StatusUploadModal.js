import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaTimes, FaMapMarkerAlt, FaCamera, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  // Cache for location data
  const [locationCache, setLocationCache] = useState({
    countries: [],
    states: [],
    cities: []
  });

  // Load location data once with fallback
  React.useEffect(() => {
    const loadLocationData = async () => {
      try {
        // Try multiple sources for location data
        const sources = [
          {
            countries: 'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json',
            cities: 'https://raw.githubusercontent.com/datasets/world-cities/master/data/world-cities.csv'
          },
          {
            // Fallback to simple predefined data
            countries: null,
            cities: null
          }
        ];

        // Predefined location data for reliable search
        const predefinedCountries = [
          { id: 1, name: 'Azerbaijan' }, { id: 2, name: 'Turkey' }, { id: 3, name: 'United States' },
          { id: 4, name: 'United Kingdom' }, { id: 5, name: 'France' }, { id: 6, name: 'Germany' },
          { id: 7, name: 'Italy' }, { id: 8, name: 'Spain' }, { id: 9, name: 'Russia' },
          { id: 10, name: 'Japan' }, { id: 11, name: 'China' }, { id: 12, name: 'India' },
          { id: 13, name: 'Brazil' }, { id: 14, name: 'Canada' }, { id: 15, name: 'Australia' }
        ];

        // Common worldwide cities with country mapping
        const predefinedCities = [
          { name: 'Baku', country: 'Azerbaijan' }, { name: 'Ganja', country: 'Azerbaijan' },
          { name: 'Istanbul', country: 'Turkey' }, { name: 'Ankara', country: 'Turkey' },
          { name: 'Tbilisi', country: 'Georgia' }, { name: 'Yerevan', country: 'Armenia' },
          { name: 'London', country: 'United Kingdom' }, { name: 'Manchester', country: 'United Kingdom' },
          { name: 'Paris', country: 'France' }, { name: 'Lyon', country: 'France' },
          { name: 'Berlin', country: 'Germany' }, { name: 'Munich', country: 'Germany' },
          { name: 'Rome', country: 'Italy' }, { name: 'Milan', country: 'Italy' },
          { name: 'Madrid', country: 'Spain' }, { name: 'Barcelona', country: 'Spain' },
          { name: 'New York', country: 'United States' }, { name: 'Los Angeles', country: 'United States' },
          { name: 'Chicago', country: 'United States' }, { name: 'Miami', country: 'United States' },
          { name: 'Tokyo', country: 'Japan' }, { name: 'Osaka', country: 'Japan' },
          { name: 'Seoul', country: 'South Korea' }, { name: 'Bangkok', country: 'Thailand' },
          { name: 'Dubai', country: 'UAE' }, { name: 'Abu Dhabi', country: 'UAE' },
          { name: 'Moscow', country: 'Russia' }, { name: 'St. Petersburg', country: 'Russia' }
        ];

        setLocationCache({ 
          countries: predefinedCountries, 
          states: [], 
          cities: predefinedCities 
        });
      } catch (error) {
        console.error('Error loading location data:', error);
      }
    };

    loadLocationData();
  }, []);

  // Location search using predefined data
  const searchLocations = (query) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const suggestions = [];

    // Search countries
    const matchingCountries = locationCache.countries
      .filter(country => country.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .map(country => ({
        name: country.name,
        type: 'Country',
        city: '',
        country: country.name,
        icon: '🌍',
        fullAddress: country.name
      }));

    // Search cities
    const matchingCities = locationCache.cities
      .filter(city => city.name.toLowerCase().includes(lowerQuery))
      .slice(0, 10)
      .map(city => ({
        name: city.name,
        type: 'City',
        city: city.name,
        country: city.country || '',
        icon: '🏙️',
        fullAddress: `${city.name}, ${city.country || ''}`
      }));

    suggestions.push(...matchingCountries, ...matchingCities);
    setLocationSuggestions(suggestions.slice(0, 18)); // Max 18 results
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
    setLocationQuery(location.fullAddress || location.name);
    setShowLocationSuggestions(false);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Require image or video (not just text)
    if (!image && !video) {
      alert('Please add an image or video to your status');
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
            {/* Text Input with Emoji Picker */}
            <div className="relative mb-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind? (Optional)"
                className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg resize-none focus:border-purple-500 focus:outline-none"
                rows={4}
                maxLength={200}
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute bottom-4 right-4 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <FaSmile className="text-2xl" />
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="relative mb-4">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setText(prev => prev + emojiData.emoji);
                    // Don't close emoji picker
                  }}
                  width="100%"
                  height={350}
                  searchDisabled={false}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}

            {/* Location Input with Real-world Suggestions */}
            <div className="relative mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Add Location
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-xl focus-within:border-purple-500 bg-gradient-to-r from-white to-purple-50/30 transition-all">
                <FaMapMarkerAlt className="text-purple-600 ml-4 text-lg" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    searchLocations(e.target.value);
                  }}
                  onFocus={() => searchLocations(locationQuery)}
                  placeholder="Search any country, state, or city..."
                  className="w-full p-4 focus:outline-none bg-transparent"
                  disabled={uploading}
                />
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border-2 border-purple-200 rounded-xl shadow-xl mt-1 max-h-80 overflow-y-auto">
                  {locationSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3 transition-all duration-200 group"
                    >
                      <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {loc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {loc.name}
                        </div>
                        {loc.city && (
                          <div className="text-sm text-gray-600 truncate mt-0.5">
                            {loc.city}{loc.country ? `, ${loc.country}` : ''}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {loc.type}
                          </span>
                          {loc.country && loc.type !== 'Country' && (
                            <span className="text-xs text-gray-500">📍 {loc.country}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
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
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || (!image && !video)}
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
