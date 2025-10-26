import React, { useState } from 'react';
import { FaTimes, FaTextHeight, FaSmile, FaMapMarkerAlt, FaClock, FaHashtag } from 'react-icons/fa';

const StatusEditor = ({ mediaUrl, mediaType, onSave, onClose }) => {
  const [elements, setElements] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const addElement = (type) => {
    let content = '';
    let icon = '';
    
    if (type === 'text') {
      content = 'Type here...';
      icon = '📝';
    } else if (type === 'location') {
      content = '📍 Location';
      icon = '📍';
    } else if (type === 'time') {
      content = new Date().toLocaleTimeString();
      icon = '⏰';
    } else if (type === 'hashtag') {
      content = '#trending';
      icon = '#';
    } else if (type === 'emoji') {
      content = '😊';
      icon = '😊';
    }

    const newElement = {
      id: Date.now(),
      type: type,
      content: content,
      icon: icon,
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 30,
      color: selectedColor,
      fontSize: type === 'emoji' ? 40 : 24
    };
    
    setElements([...elements, newElement]);
    setSelectedTool(null);
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

  const removeSelection = () => {
    if (selectedTool) {
      setSelectedTool(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50"
      onClick={removeSelection}
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
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <video
            src={mediaUrl}
            className="max-w-full max-h-full object-contain"
            controls
            style={{ pointerEvents: 'none' }}
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
              color: element.color,
              fontSize: `${element.fontSize}px`,
              fontWeight: 'bold',
              cursor: 'move',
              userSelect: 'none',
              pointerEvents: 'all',
              background: element.color === '#FFFFFF' ? 'rgba(0,0,0,0.5)' : 'transparent',
              padding: element.type === 'emoji' ? '0' : '5px 10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
            onDoubleClick={() => deleteElement(element.id)}
          >
            {element.type === 'emoji' && element.icon}
            {element.type !== 'emoji' && element.content}
          </div>
        ))}
      </div>

      {/* Top Toolbar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <button
          onClick={onClose}
          className="text-white bg-black/30 hover:bg-black/50 rounded-full p-3 transition-all"
        >
          <FaTimes className="text-xl" />
        </button>
        
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          ✓ Share
        </button>
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-6 z-50">
        <div className="flex justify-center gap-6 items-center">
          <button
            onClick={() => {
              setSelectedTool('text');
              addElement('text');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-all">
              <FaTextHeight className="text-2xl" />
            </div>
            <span className="text-xs">Text</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedTool('location');
              addElement('location');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-all">
              <FaMapMarkerAlt className="text-2xl" />
            </div>
            <span className="text-xs">Location</span>
          </button>

          <button
            onClick={() => {
              setSelectedTool('time');
              addElement('time');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-all">
              <FaClock className="text-2xl" />
            </div>
            <span className="text-xs">Time</span>
          </button>

          <button
            onClick={() => {
              setSelectedTool('hashtag');
              addElement('hashtag');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-all">
              <FaHashtag className="text-2xl" />
            </div>
            <span className="text-xs">Tag</span>
          </button>

          <button
            onClick={() => {
              setSelectedTool('emoji');
              addElement('emoji');
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-all">
              <FaSmile className="text-2xl" />
            </div>
            <span className="text-xs">Emoji</span>
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex justify-center gap-3 mt-4">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full border-3 transition-all ${
                selectedColor === color ? 'border-white scale-110' : 'border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Instructions */}
        <p className="text-center text-white/70 text-xs mt-4">
          💡 Click tool to add, drag to move, double-click to delete
        </p>
      </div>
    </div>
  );
};

export default StatusEditor;
