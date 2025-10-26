import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTextHeight, FaSmile, FaMapMarkerAlt, FaClock, FaHashtag, FaTrash, FaPalette } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const StatusEditor = ({ mediaUrl, mediaType, onSave, onClose }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState('bold');
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [filters, setFilters] = useState([]);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ];

  const fonts = [
    { name: 'Bold', style: 'bold' },
    { name: 'Medium', style: 'normal' },
    { name: 'Thin', style: '100' }
  ];

  const locationSuggestions = [
    'Oslo',
    'Tokyo',
    'Paris',
    'New York',
    'Lagos',
    'Jakarta',
    'Cairo',
    'Abu Dhabi',
    'Melbourne',
    'Rio de Janeiro',
    'Bombay'
  ];

  const filters = [
    { name: 'Original', class: '' },
    { name: 'Vintage', class: 'grayscale' },
    { name: 'Bright', class: 'brightness-150 contrast-125' },
    { name: 'Dark', class: 'brightness-75' },
    { name: 'Sepia', class: 'sepia' }
  ];

  const addLocation = (location) => {
    const newElement = {
      id: Date.now(),
      type: 'location',
      content: `📍 ${location}`,
      x: window.innerWidth / 2 - 80,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 32,
      fontStyle: selectedFont
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setShowLocationInput(false);
    setLocationSearch('');
  };

  const addTag = (tag) => {
    const hashtag = tag.startsWith('#') ? tag : `#${tag}`;
    const newElement = {
      id: Date.now(),
      type: 'hashtag',
      content: hashtag,
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 28,
      fontStyle: selectedFont
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setShowTagInput(false);
    setTagSearch('');
  };

  const addTime = () => {
    const newElement = {
      id: Date.now(),
      type: 'time',
      content: new Date().toLocaleTimeString(),
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 28,
      fontStyle: selectedFont
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const addSticker = (emoji) => {
    const newElement = {
      id: Date.now(),
      type: 'sticker',
      content: emoji,
      x: window.innerWidth / 2 - 40,
      y: window.innerHeight / 2 - 40,
      fontSize: 60
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setShowStickers(false);
    setShowEmojiPicker(false);
  };

  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === id);
    if (element) {
      setSelectedElement(element);
      setDragging(id);
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setElements(elements.map(el => 
        el.id === dragging 
          ? { ...el, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const deleteElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    onSave({
      elements,
      originalMedia: mediaUrl
    });
  };

  const updateElementFont = (fontStyle) => {
    if (selectedElement) {
      setElements(elements.map(el => 
        el.id === selectedElement.id ? { ...el, fontStyle } : el
      ));
      setSelectedElement({ ...selectedElement, fontStyle });
    }
  };

  const updateElementColor = (color) => {
    if (selectedElement && selectedElement.type !== 'sticker') {
      setElements(elements.map(el => 
        el.id === selectedElement.id ? { ...el, color } : el
      ));
      setSelectedElement({ ...selectedElement, color });
    }
  };

  const getFontStyle = (fontStyle) => {
    if (fontStyle === 'bold') return { fontWeight: 'bold' };
    if (fontStyle === '100') return { fontWeight: '100' };
    return { fontWeight: 'normal' };
  };

  // Auto-select newly added elements
  useEffect(() => {
    if (elements.length > 0) {
      setSelectedElement(elements[elements.length - 1]);
    }
  }, [elements.length]);

  return (
    <div 
      className="fixed inset-0 bg-black z-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => {
        if (e.target.classList.contains('media-wrapper')) {
          setSelectedElement(null);
        }
      }}
    >
      {/* Media Display with filters */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden media-wrapper">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt="Status"
            className="max-w-full max-h-full object-contain"
            draggable="false"
          />
        ) : (
          <video
            src={mediaUrl}
            className="max-w-full max-h-full object-contain"
            controls
            draggable="false"
          />
        )}

        {/* Floating Elements */}
        {elements.map(element => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.x}px`,
              top: `${element.y}px`,
              color: element.color || '#FFFFFF',
              fontSize: `${element.fontSize}px`,
              ...getFontStyle(element.fontStyle),
              cursor: 'move',
              userSelect: 'none',
              pointerEvents: 'all',
              textShadow: element.type === 'sticker' ? '' : '3px 3px 8px rgba(0,0,0,1)',
              padding: '8px',
              outline: selectedElement?.id === element.id ? '4px solid #8B5CF6' : 'none',
              borderRadius: selectedElement?.id === element.id ? '8px' : '0px',
              backgroundColor: selectedElement?.id === element.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
            }}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            {element.type === 'sticker' ? element.content : element.content}
          </div>
        ))}
      </div>

      {/* Trash button in center */}
      {selectedElement && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteElement();
            }}
            className="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-red-600 transition-all hover:scale-110"
          >
            <FaTrash className="text-2xl" />
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-50">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
          >
            <FaTimes className="text-xl" />
          </button>
          
          {!selectedElement && (
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700"
            >
              <FaCheck className="text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* Font and Color selector when element selected */}
      {selectedElement && selectedElement.type !== 'sticker' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-xl p-4 z-50 flex gap-4 items-center">
          {/* Font selector */}
          <div className="flex gap-2 border-r border-gray-600 pr-4">
            {fonts.map(font => (
              <button
                key={font.name}
                onClick={(e) => {
                  e.stopPropagation();
                  updateElementFont(font.style);
                  setSelectedFont(font.style);
                }}
                className={`px-3 py-1 rounded-lg text-white text-sm ${
                  selectedElement.fontStyle === font.style ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {font.name}
              </button>
            ))}
          </div>

          {/* Color picker */}
          <div className="flex gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  updateElementColor(color);
                  setSelectedColor(color);
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedElement.color === color ? 'border-white scale-125' : 'border-gray-500'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Location Input Modal */}
      {showLocationInput && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowLocationInput(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-80 max-h-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4">Add Location</h3>
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Search location..."
              className="w-full p-3 rounded-lg bg-gray-800 text-white mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && locationSearch.trim()) {
                  addLocation(locationSearch.trim());
                }
              }}
            />
            
            {/* Suggestions */}
            <div className="max-h-64 overflow-y-auto">
              {locationSuggestions.filter(loc => 
                loc.toLowerCase().includes(locationSearch.toLowerCase())
              ).map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => addLocation(loc)}
                  className="w-full text-left p-3 hover:bg-gray-800 rounded-lg text-white"
                >
                  📍 {loc}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={() => setShowLocationInput(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => locationSearch.trim() && addLocation(locationSearch.trim())}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Input Modal */}
      {showTagInput && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowTagInput(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4">Add Tag</h3>
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="#trending"
              className="w-full p-3 rounded-lg bg-gray-800 text-white mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && tagSearch.trim()) {
                  addTag(tagSearch.trim());
                }
              }}
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowTagInput(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => tagSearch.trim() && addTag(tagSearch.trim())}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-32 left-0 right-0 bg-black/90 rounded-t-2xl p-4 z-50" onClick={(e) => e.stopPropagation()}>
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              addSticker(emojiData.emoji);
            }}
            width="100%"
            height={400}
          />
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 z-50">
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setShowLocationInput(true)}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaMapMarkerAlt className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Location</span>
          </button>

          <button
            onClick={addTime}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaClock className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Time</span>
          </button>

          <button
            onClick={() => setShowTagInput(true)}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaHashtag className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Tag</span>
          </button>

          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaSmile className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Emoji</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusEditor;
