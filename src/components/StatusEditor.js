import React, { useState } from 'react';
import { FaTimes, FaCheck, FaTextHeight, FaSmile, FaMapMarkerAlt, FaClock, FaHashtag, FaTrash } from 'react-icons/fa';

const StatusEditor = ({ mediaUrl, mediaType, onSave, onClose }) => {
  const [elements, setElements] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showStickerMenu, setShowStickerMenu] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [tempText, setTempText] = useState('');

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const stickers = ['📍', '😊', '❤️', '🔥', '🎉', '✨', '⭐', '💯', '👍', '👏'];

  const addSticker = (sticker) => {
    const newElement = {
      id: Date.now(),
      type: 'sticker',
      content: sticker,
      x: window.innerWidth / 2 - 30,
      y: window.innerHeight / 2 - 30,
      fontSize: 50
    };
    setElements([...elements, newElement]);
    setShowStickerMenu(false);
  };

  const addLocation = () => {
    const newElement = {
      id: Date.now(),
      type: 'location',
      content: '📍 Location',
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 24
    };
    setElements([...elements, newElement]);
    setShowStickerMenu(false);
  };

  const addTime = () => {
    const newElement = {
      id: Date.now(),
      type: 'time',
      content: new Date().toLocaleTimeString(),
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 24
    };
    setElements([...elements, newElement]);
    setShowStickerMenu(false);
  };

  const addHashtag = () => {
    const newElement = {
      id: Date.now(),
      type: 'hashtag',
      content: '#trending',
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: 24
    };
    setElements([...elements, newElement]);
    setShowStickerMenu(false);
  };

  const handleAddText = () => {
    setShowTextInput(true);
    setTempText('');
  };

  const confirmText = () => {
    if (tempText.trim()) {
      const newElement = {
        id: Date.now(),
        type: 'text',
        content: tempText.trim(),
        x: window.innerWidth / 2 - tempText.length * 7,
        y: window.innerHeight / 2 - 15,
        color: selectedColor,
        fontSize: 32
      };
      setElements([...elements, newElement]);
    }
    setShowTextInput(false);
    setTempText('');
  };

  const handleMouseDown = (id, e) => {
    const element = elements.find(el => el.id === id);
    if (element) {
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

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const handleSave = () => {
    onSave({
      elements,
      originalMedia: mediaUrl
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
              fontWeight: 'bold',
              cursor: 'move',
              userSelect: 'none',
              pointerEvents: 'all',
              textShadow: element.type === 'sticker' ? '' : '2px 2px 4px rgba(0,0,0,0.8)',
              padding: '5px'
            }}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            {element.type === 'sticker' ? element.content : element.content}
            
            {/* Delete button on hover */}
            <button
              onClick={() => deleteElement(element.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {/* Top bar */}
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

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-80">
            <h3 className="text-white font-bold mb-4">Add Text</h3>
            <input
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              placeholder="Type your text..."
              className="w-full p-3 rounded-lg bg-gray-800 text-white mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  confirmText();
                }
              }}
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowTextInput(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmText}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticker Menu */}
      {showStickerMenu && (
        <div className="absolute bottom-24 left-0 right-0 bg-black/80 rounded-t-2xl p-4 z-50">
          <div className="grid grid-cols-5 gap-4 max-h-60 overflow-y-auto">
            {stickers.map((sticker, idx) => (
              <button
                key={idx}
                onClick={() => addSticker(sticker)}
                className="text-4xl hover:scale-110 transition-transform"
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
            onClick={handleAddText}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaTextHeight className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Text</span>
          </button>
          
          <button
            onClick={() => {
              setShowStickerMenu(!showStickerMenu);
              setSelectedTool('emoji');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaSmile className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Stickers</span>
          </button>

          <button
            onClick={() => {
              addLocation();
              setSelectedTool('location');
            }}
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
            onClick={addHashtag}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50">
              <FaHashtag className="text-2xl" />
            </div>
            <span className="text-xs font-medium">Tag</span>
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex justify-center gap-3 mt-4">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
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
