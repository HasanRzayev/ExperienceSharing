import React, { useState, useRef } from 'react';

const ImageEditor = ({ image, onSave, onCancel }) => {
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const canvasRef = useRef(null);

  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Vintage', value: 'sepia(50%) contrast(110%) brightness(90%)' },
    { name: 'Cool', value: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Warm', value: 'sepia(30%) saturate(140%)' },
    { name: 'Black & White', value: 'grayscale(100%) contrast(130%)' },
    { name: 'Vibrant', value: 'saturate(200%) contrast(110%)' }
  ];

  const getFilterStyle = () => {
    let filterString = filter !== 'none' ? filter : '';
    filterString += ` brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    return filterString.trim();
  };

  const handleSave = () => {
    // Convert image with filters to blob and send to parent
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Apply filters
      ctx.filter = getFilterStyle();
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        onSave(blob);
      }, 'image/jpeg', 0.95);
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Image</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
              <img
                ref={canvasRef}
                src={image}
                alt="Preview"
                style={{ filter: getFilterStyle() }}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Adjustments</h3>
              
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Brightness: {brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Contrast: {contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Saturation: {saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;

