import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaMapMarkerAlt, FaCamera, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const StatusUploadModal = ({ isOpen, onClose, onUpload }) => {
  const navigate = useNavigate();
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
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

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

  // Cache for location data from JSON files
  const [locationCache, setLocationCache] = useState({
    countries: [],
    states: [],
    cities: [],
    hotels: []
  });

  // Load location data from local JSON files
  React.useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [countriesRes, citiesRes] = await Promise.all([
          fetch('/countries.json'),
          fetch('/cities.json')
        ]);
        
        const [countries, cities] = await Promise.all([
          countriesRes.json(),
          citiesRes.json()
        ]);

        // Hotels data - try to fetch, but don't fail if it doesn't work
        let hotels = [];
        try {
          const hotelsRes = await fetch('/hotels.json');
          const hotelsData = await hotelsRes.json();
          hotels = Array.isArray(hotelsData) ? hotelsData : hotelsData.hotels || [];
        } catch (err) {
          console.warn('Could not load hotels data');
          hotels = [];
        }

        setLocationCache({ countries, states: [], cities, hotels });
      } catch (error) {
        console.error('Error loading location data:', error);
      }
    };

    loadLocationData();
  }, []);

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen) {
      const token = Cookies.get('token');
      if (!token) {
        // If not logged in, close modal and redirect to login
        onClose();
        navigate('/login');
      }
    }
  }, [isOpen, navigate, onClose]);

  // Location search using JSON files
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
      .slice(0, 8)
      .map(city => {
        const countryName = locationCache.countries.find(c => c.iso2 === city.country)?.name || city.country;
        return {
          name: city.name,
          type: 'City',
          city: city.name,
          country: countryName,
          icon: '🏙️',
          fullAddress: `${city.name}, ${countryName}`
        };
      });

    // Search hotels
    const matchingHotels = locationCache.hotels
      .filter(hotel => 
        hotel.hotel_name.toLowerCase().includes(lowerQuery) ||
        hotel.city.toLowerCase().includes(lowerQuery) ||
        hotel.country.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(hotel => ({
        name: hotel.hotel_name,
        type: 'Hotel',
        city: hotel.city,
        country: hotel.country,
        icon: '🏨',
        fullAddress: `${hotel.hotel_name}, ${hotel.city}, ${hotel.country}`
      }));

    suggestions.push(...matchingCountries, ...matchingCities, ...matchingHotels);
    setLocationSuggestions(suggestions.slice(0, 20)); // Max 20 results
    setShowLocationSuggestions(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('[StatusUploadModal] handleImageChange file:', file);
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
    console.log('[StatusUploadModal] handleVideoChange file:', file);
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
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
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
    console.log('[StatusUploadModal] submit payload (before validation):', {
      text,
      hasImage: !!image,
      hasVideo: !!video,
      image,
      video,
      selectedFilter,
      selectedLocation
    });
    
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
      // Add filter information
      if (selectedFilter !== 'none' && selectedFilterData) {
        formData.append('Filter', selectedFilterData.css);
      }

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      console.log('[StatusUploadModal] POST /Status to', `${apiBaseUrl}/Status`, 'with entries:', Array.from(formData.entries()));
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
      console.error('[StatusUploadModal] Error uploading status:', error);
      console.error('[StatusUploadModal] Error response:', error.response?.data);
      console.error('[StatusUploadModal] Error status:', error.response?.status);
      alert('Failed to upload status. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    console.log('[StatusUploadModal] closing modal');
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
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  const selectedFilterData = filters.find(f => f.class === selectedFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Create Status</h2>
            <button
              onClick={handleClose}
              className="text-2xl text-gray-500 hover:text-gray-700"
            >
            <FaTimes />
            </button>
          </div>

        <div className="p-6">
          {/* Media Preview with Filters */}
            {(imagePreview || videoPreview) && (
            <div className="relative mb-6">
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
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
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
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}

              {/* Filter Selector */}
              {showFilters && imagePreview && (
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Filters</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {filters.map(filter => (
                      <button
                        key={filter.class}
                        onClick={() => setSelectedFilter(filter.class)}
                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
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
                className="w-full resize-none rounded-lg border-2 border-gray-300 p-4 pr-12 focus:border-purple-500 focus:outline-none"
                rows={4}
                maxLength={200}
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute bottom-4 right-4 text-gray-400 transition-colors hover:text-purple-600"
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

            {/* Location Input - Instagram Style */}
            <div className="relative mb-4">
              <div className="flex items-center border-b border-gray-300 pb-2">
                <FaMapMarkerAlt className="mr-3 text-lg text-gray-400" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    searchLocations(e.target.value);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  placeholder="Add a location"
                  className="w-full bg-transparent text-base focus:outline-none"
                  disabled={uploading}
                />
              </div>

              {/* Location Suggestions Dropdown - Instagram Style */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg">
                  {locationSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLocationSelect(loc)}
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                    >
                      <FaMapMarkerAlt className="shrink-0 text-xl text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {loc.name}
                        </div>
                        {(loc.city || loc.country) && (
                          <div className="truncate text-sm text-gray-500">
                            {loc.city && loc.country ? `${loc.city}, ${loc.country}` : loc.country || loc.city}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Character Count for Text */}
            <div className="mb-4 text-right text-sm text-gray-500">
              {text.length}/200
            </div>

            {/* Upload Buttons */}
            {!imagePreview && !videoPreview && (
            <div className="mb-4 flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  id="status-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                  ref={imageInputRef}
                />
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-purple-500">
                    <FaCamera className="mx-auto mb-2 text-2xl text-gray-400" />
                    <span className="font-medium text-gray-600">📷 Add Photo</span>
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
                  ref={videoInputRef}
                />
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-purple-500">
                    <FaCamera className="mx-auto mb-2 text-2xl text-gray-400" />
                    <span className="font-medium text-gray-600">🎥 Add Video</span>
                </div>
              </label>
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
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
