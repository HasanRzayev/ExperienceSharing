import React, { useState } from 'react';
import { FaTimes, FaCheck, FaTextHeight, FaSmile, FaMapMarkerAlt, FaClock, FaHashtag, FaTrash } from 'react-icons/fa';

const StatusEditor = ({ mediaUrl, mediaType, onSave, onClose }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState('normal');
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const fonts = [
    { name: 'Bold', style: 'bold' },
    { name: 'Medium', style: 'normal' },
    { name: 'Thin', style: '100' },
    { name: 'Serif', style: 'normal', fontFamily: 'serif' }
  ];

  const stickers = ['📍', '😊', '❤️', '🔥', '🎉', '✨', '⭐', '💯', '👍', '👏', '🎈', '💎', '🌟', '💰', '🏆'];

  const locationSuggestions = [
    'Baku, Azerbaijan',
    'Istanbul, Turkey',
    'Paris, France',
    'London, UK',
    'New York, USA',
    'Tokyo, Japan',
    'Dubai, UAE',
    'Moscow, Russia'
  ];

  const addLocation = (location) => {
    const newElement = {
      id: Date.now(),
      type: 'location',
      content: `📍 ${location}`,
      x: window.innerWidth / 2 - 80,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 24,
      fontStyle: selectedFont
    };
    setElements([...elements, newElement]);
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
      fontSize: 24,
      fontStyle: selectedFont
    };
    setElements([...elements, newElement]);
  };

  const addSticker = (sticker) => {
    const newElement = {
      id: Date.now(),
      type: 'sticker',
      content: sticker,
      x: window.innerWidth / 2 - 30,
      y: window.innerHeight / 2 - 30,
      fontSize: 60
    };
    setElements([...elements, newElement]);
    setShowStickers(false);
  };

  const handleMouseDown = (id, e) => {
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

  const updateElementFont = (id, fontStyle) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, fontStyle } : el
    ));
  };

  const getFontStyle = (fontStyle) => {
    if (typeof fontStyle === 'string') {
      if (fontStyle === 'bold') return { fontWeight: 'bold' };
      if (fontStyle === '100') return { fontWeight: '100' };
      return { fontWeight: 'normal' };
    }
    return {};
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => setSelectedElement(null)}
    >
      {/* Media Display */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
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
              textShadow: element.type === 'sticker' ? '' : '2px 2px 6px rgba(0,0,0,0.9)',
              padding: '8px',
              outline: selectedElement?.id === element.id ? '3px solid #8B5CF6' : 'none',
              borderRadius: selectedElement?.id === element.id ? '8px' : '0px'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(element.id, e);
            }}
          >
            {element.type === 'sticker' ? element.content : element.content}
          </div>
        ))}
      </div>

      {/* Top bar with delete button */}
      {selectedElement && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-50">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
            >
              <FaTimes className="text-xl" />
            </button>
            
            <div className="flex gap-4">
              {/* Font selector for text elements */}
              {selectedElement.type !== 'sticker' && (
                <select
                  value={selectedFont}
                  onChange={(e) => {
                    setSelectedFont(e.target.value);
                    updateElementFont(selectedElement.id, e.target.value);
                  }}
                  className="bg-black/30 text-white rounded-lg px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {fonts.map(font => (
                    <option key={font.name} value={font.style}>{font.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement();
                }}
                className="text-white bg-red-500/30 hover:bg-red-500/50 rounded-full p-3"
              >
                <FaTrash className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar without selection */}
      {!selectedElement && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-50">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
            >
              <FaTimes className="text-xl" />
            </button>
            
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700"
            >
              <FaCheck className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Location Input Modal */}
      {showLocationInput && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-80">
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
            <div className="max-h-48 overflow-y-auto">
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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-80">
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

      {/* Stickers at bottom */}
      {showStickers && (
        <div className="absolute bottom-32 left-0 right-0 bg-black/90 rounded-t-2xl p-4 z-50">
          <div className="grid grid-cols-5 gap-4 max-h-60 overflow-y-auto">
            {stickers.map((sticker, idx) => (
              <button
                key={idx}
                onClick={() => addSticker(sticker)}
                className="text-5xl hover:scale-125 transition-transform p-2"
              >
                {sticker}
              </button>
            ))}
          </div>
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
              setShowStickers(!showStickers);
              setSelectedTool('emoji');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaSmile className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Emoji</span>
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex justify-center gap-3 mt-4">
          {colors.map(color => (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(color);
              }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === color ? 'border-white scale-125' : 'border-gray-500'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusEditor;
