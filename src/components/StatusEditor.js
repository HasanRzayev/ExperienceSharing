import React, { useState, useRef } from 'react';
import { FaTimes, FaTextHeight, FaSmile, FaMapMarkerAlt, FaClock, FaHashtag, FaImage, FaPaintBrush } from 'react-icons/fa';

const StatusEditor = ({ mediaUrl, mediaType, onSave, onClose }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [color, setColor] = useState('#000000');
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const canvasRef = useRef(null);

  // Text overlay
  const addText = () => {
    const newText = {
      id: Date.now(),
      text: 'Type here...',
      x: 100,
      y: 100,
      color: color,
      fontSize: 24,
      fontWeight: 'normal',
      textAlign: 'left'
    };
    setTextElements([...textElements, newText]);
    setActiveTool('text');
  };

  // Stickers
  const addSticker = (type) => {
    const sticker = {
      id: Date.now(),
      type: type,
      x: 150,
      y: 200,
      size: 50
    };
    setStickers([...stickers, sticker]);
    setActiveTool(null);
  };

  // Location sticker
  const addLocation = () => {
    addSticker('location');
  };

  // Time sticker
  const addTime = () => {
    addSticker('time');
  };

  // Hashtag sticker
  const addHashtag = () => {
    addSticker('hashtag');
  };

  // Emoji
  const addEmoji = () => {
    addSticker('emoji');
  };

  const updateText = (id, updates) => {
    setTextElements(textElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id) => {
    setTextElements(textElements.filter(el => el.id !== id));
    setStickers(stickers.filter(s => s.id !== id));
  };

  const handleSave = () => {
    // Combine all elements into final image
    onSave({
      textElements,
      stickers,
      originalMedia: mediaUrl
    });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (selectedTextIndex !== null && textElements[selectedTextIndex]) {
      updateText(textElements[selectedTextIndex].id, { color: newColor });
    }
  };

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Toolbar at top */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <button
          onClick={onClose}
          className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
        >
          <FaTimes />
        </button>
        <div className="flex gap-2">
          <button
            onClick={addText}
            className={`text-white bg-black/30 hover:bg-black/50 rounded-full p-3 ${activeTool === 'text' ? 'bg-purple-500/50' : ''}`}
            title="Add Text"
          >
            <FaTextHeight />
          </button>
          <button
            onClick={addLocation}
            className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
            title="Add Location"
          >
            <FaMapMarkerAlt />
          </button>
          <button
            onClick={addTime}
            className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
            title="Add Time"
          >
            <FaClock />
          </button>
          <button
            onClick={addHashtag}
            className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
            title="Add Hashtag"
          >
            <FaHashtag />
          </button>
          <button
            onClick={addEmoji}
            className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3"
            title="Add Emoji"
          >
            <FaSmile />
          </button>
          <button
            onClick={handleSave}
            className="text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-4 py-2 font-bold"
          >
            Save
          </button>
        </div>
      </div>

      {/* Media Display */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt="Status"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={mediaUrl}
            className="max-w-full max-h-full object-contain"
            controls
          />
        )}

        {/* Text Overlays */}
        {textElements.map((el, idx) => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${el.x}px`,
              top: `${el.y}px`,
              color: el.color,
              fontSize: `${el.fontSize}px`,
              fontWeight: el.fontWeight,
              textAlign: el.textAlign,
              cursor: 'move'
            }}
            onClick={() => setSelectedTextIndex(idx)}
          >
            {el.text}
          </div>
        ))}

        {/* Stickers */}
        {stickers.map(sticker => (
          <div
            key={sticker.id}
            style={{
              position: 'absolute',
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
              cursor: 'move'
            }}
          >
            {sticker.type === 'location' && '📍'}
            {sticker.type === 'time' && new Date().toLocaleTimeString()}
            {sticker.type === 'hashtag' && '#trending'}
            {sticker.type === 'emoji' && '😊'}
          </div>
        ))}
      </div>

      {/* Color Picker */}
      {activeTool === 'text' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-3 z-50">
          <div className="flex gap-2">
            {colors.map(colorOption => (
              <button
                key={colorOption}
                onClick={() => handleColorChange(colorOption)}
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 flex justify-center gap-4 z-50">
        <button
          onClick={addText}
          className="text-white hover:text-purple-400 transition-colors"
          title="Text"
        >
          <FaTextHeight className="text-2xl" />
        </button>
        <button
          onClick={addLocation}
          className="text-white hover:text-purple-400 transition-colors"
          title="Location"
        >
          <FaMapMarkerAlt className="text-2xl" />
        </button>
        <button
          onClick={addTime}
          className="text-white hover:text-purple-400 transition-colors"
          title="Time"
        >
          <FaClock className="text-2xl" />
        </button>
        <button
          onClick={addHashtag}
          className="text-white hover:text-purple-400 transition-colors"
          title="Hashtag"
        >
          <FaHashtag className="text-2xl" />
        </button>
        <button
          onClick={addEmoji}
          className="text-white hover:text-purple-400 transition-colors"
          title="Emoji"
        >
          <FaSmile className="text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default StatusEditor;

