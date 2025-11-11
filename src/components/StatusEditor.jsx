import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCheck, FaTextHeight, FaSmile, FaMapMarkerAlt, FaClock, FaHashtag, FaTrash, FaDownload, FaShare, FaBars, FaUndo, FaRedo } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const StatusEditor = ({ mediaUrl, mediaType, onSave, onClose }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedFont, setSelectedFont] = useState('bold');
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [drawPaths, setDrawPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('original');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ];

  const fonts = [
    { name: 'Bold', style: 'bold', size: 32 },
    { name: 'Medium', style: 'normal', size: 28 },
    { name: 'Thin', style: '100', size: 24 },
    { name: 'Serif', style: 'normal', size: 30, family: 'serif' }
  ];

  const locationSuggestions = [
    'Oslo', 'Tokyo', 'Paris', 'New York', 'Lagos', 
    'Jakarta', 'Cairo', 'Abu Dhabi', 'Melbourne', 'Rio de Janeiro', 'Bombay'
  ];

  const filters = [
    { name: 'Original', class: '' },
    { name: 'Vintage', class: 'grayscale' },
    { name: 'Bright', class: 'brightness-150 contrast-125' },
    { name: 'Dark', class: 'brightness-75' },
    { name: 'Warm', class: 'sepia brightness-110' },
    { name: 'Cool', class: 'hue-rotate-180' }
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
      fontStyle: selectedFont,
      rotation: 0,
      scale: 1
    };
    addToHistory();
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
      fontStyle: selectedFont,
      rotation: 0,
      scale: 1
    };
    addToHistory();
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
      fontStyle: selectedFont,
      rotation: 0,
      scale: 1
    };
    addToHistory();
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
      fontSize: 60,
      rotation: 0,
      scale: 1
    };
    addToHistory();
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setShowStickers(false);
    setShowEmojiPicker(false);
  };

  const addToHistory = () => {
    const newHistory = [...history.slice(0, historyIndex + 1), { elements, drawPaths }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements || []);
      setDrawPaths(prevState.drawPaths || []);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements || []);
      setDrawPaths(nextState.drawPaths || []);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const startDrawing = (e) => {
    if (!showDrawer) return;
    setDrawing(true);
    const point = {
      x: e.clientX,
      y: e.clientY,
      color: selectedColor,
      size: brushSize
    };
    setCurrentPath([point]);
  };

  const draw = (e) => {
    if (!drawing || !showDrawer) return;
    const point = {
      x: e.clientX,
      y: e.clientY,
      color: selectedColor,
      size: brushSize
    };
    setCurrentPath([...currentPath, point]);
  };

  const endDrawing = () => {
    if (drawing && currentPath.length > 0) {
      addToHistory();
      setDrawPaths([...drawPaths, { id: Date.now(), path: currentPath }]);
      setCurrentPath([]);
    }
    setDrawing(false);
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
    draw(e);
  };

  const handleMouseUp = () => {
    setDragging(null);
    endDrawing();
  };

  const deleteElement = () => {
    if (selectedElement) {
      addToHistory();
      setElements(elements.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    onSave({
      elements,
      drawPaths,
      originalMedia: mediaUrl,
      filter: activeFilter
    });
  };

  const updateElement = (updates) => {
    if (selectedElement) {
      addToHistory();
      setElements(elements.map(el => 
        el.id === selectedElement.id ? { ...el, ...updates } : el
      ));
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const getFontStyle = (font) => {
    if (font === 'bold') return { fontWeight: 'bold' };
    if (font === '100') return { fontWeight: '100' };
    return { fontWeight: 'normal' };
  };

  useEffect(() => {
    if (elements.length > 0 && !selectedElement) {
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
        if (e.target.classList.contains('editor-media-wrapper')) {
          setSelectedElement(null);
        }
      }}
      onMouseDown={startDrawing}
    >
      {/* Media Display with filters */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden editor-media-wrapper">
        <div className="relative">
          {mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt="Status"
              className={`max-w-full max-h-full object-contain ${activeFilter !== 'original' ? filters.find(f => f.name === activeFilter)?.class : ''}`}
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

          {/* Draw paths */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {drawPaths.map((pathData, idx) => (
              <g key={idx}>
                {pathData.path.map((point, i) => {
                  if (i === 0) return null;
                  const prevPoint = pathData.path[i - 1];
                  return (
                    <line
                      key={i}
                      x1={prevPoint.x}
                      y1={prevPoint.y}
                      x2={point.x}
                      y2={point.y}
                      stroke={point.color}
                      strokeWidth={point.size}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            ))}
            {currentPath.map((point, i) => {
              if (i === 0) return null;
              const prevPoint = currentPath[i - 1];
              return (
                <line
                  key={i}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke={point.color}
                  strokeWidth={point.size}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Floating Elements */}
          {elements.map(element => (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                color: element.color || '#FFFFFF',
                fontSize: `${element.fontSize * (element.scale || 1)}px`,
                ...getFontStyle(element.fontStyle),
                cursor: 'move',
                userSelect: 'none',
                pointerEvents: 'all',
                textShadow: element.type === 'sticker' ? '' : '3px 3px 8px rgba(0,0,0,1)',
                padding: '8px',
                outline: selectedElement?.id === element.id ? '4px solid #8B5CF6' : 'none',
                borderRadius: selectedElement?.id === element.id ? '8px' : '0px',
                backgroundColor: selectedElement?.id === element.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                transform: `rotate(${element.rotation || 0}deg) scale(${element.scale || 1})`
              }}
              onMouseDown={(e) => handleMouseDown(element.id, e)}
            >
              {element.type === 'sticker' ? element.content : element.content}
            </div>
          ))}
        </div>
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
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-2 sm:p-4 z-50">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-white bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3"
          >
            <FaTimes className="text-lg sm:text-xl" />
          </button>
          
          <div className="flex gap-1 sm:gap-3">
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="text-white bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 text-sm sm:text-base"
            >
              ✏️
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="text-white bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 disabled:opacity-50 hidden sm:block"
            >
              <FaUndo />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="text-white bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 disabled:opacity-50 hidden sm:block"
            >
              <FaRedo />
            </button>
          </div>

          {!selectedElement && (
            <>
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="text-white bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 hidden sm:block"
              >
                <FaBars className="text-lg sm:text-xl" />
              </button>
              
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-3 sm:px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700"
              >
                <FaShare className="text-lg sm:text-xl" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Font, Color, and Size selector when element selected */}
      {selectedElement && selectedElement.type !== 'sticker' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/90 rounded-xl p-4 z-50 flex flex-col gap-4">
          {/* Font selector */}
          <div className="flex gap-2 justify-center">
            {fonts.map(font => (
              <button
                key={font.name}
                onClick={(e) => {
                  e.stopPropagation();
                  updateElement({ fontStyle: font.style, fontSize: font.size });
                  setSelectedFont(font.style);
                }}
                className={`px-3 py-2 rounded-lg text-white text-xs ${
                  selectedElement.fontStyle === font.style ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {font.name}
              </button>
            ))}
          </div>

          {/* Color picker */}
          <div className="flex gap-2 justify-center">
            {colors.map(color => (
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  updateElement({ color });
                  setSelectedColor(color);
                }}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedElement.color === color ? 'border-white scale-125' : 'border-gray-500'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Size slider */}
          <div className="flex items-center gap-4">
            <span className="text-white text-xs">Size</span>
            <input
              type="range"
              min="20"
              max="80"
              value={selectedElement.fontSize || 32}
              onChange={(e) => {
                updateElement({ fontSize: parseInt(e.target.value) });
              }}
              className="flex-1"
            />
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
            />
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
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowTagInput(false)}
                className="px-4 py-2 text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => tagSearch.trim() && addTag(tagSearch.trim())}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
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
            onEmojiClick={(emojiData) => addSticker(emojiData.emoji)}
            width="100%"
            height={350}
          />
        </div>
      )}

      {/* Filter Swiper */}
      <div className="absolute bottom-24 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 z-50">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeFilter === filter.name ? 'bg-purple-600 text-white' : 'bg-black/30 text-white hover:bg-black/50'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Drawing toolbar */}
      {showDrawer && (
        <div className="absolute bottom-48 left-0 right-0 bg-black/90 rounded-t-2xl p-4 z-50">
          <div className="flex items-center gap-4">
            <span className="text-white text-sm">Brush Size</span>
            <input
              type="range"
              min="3"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-white scale-125' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 sm:p-6 z-50">
        <div className="flex justify-center gap-3 sm:gap-6">
          <button
            onClick={() => setShowLocationInput(true)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white hover:text-purple-400"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaMapMarkerAlt className="text-lg sm:text-2xl" />
            </div>
            <span className="text-xs font-medium hidden sm:inline">Location</span>
          </button>

          <button
            onClick={addTime}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white hover:text-purple-400"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaClock className="text-lg sm:text-2xl" />
            </div>
            <span className="text-xs font-medium hidden sm:inline">Time</span>
          </button>

          <button
            onClick={() => setShowTagInput(true)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white hover:text-purple-400"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaHashtag className="text-lg sm:text-2xl" />
            </div>
            <span className="text-xs font-medium hidden sm:inline">Tag</span>
          </button>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white hover:text-purple-400"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaSmile className="text-lg sm:text-2xl" />
            </div>
            <span className="text-xs font-medium hidden sm:inline">Emoji</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusEditor;
