import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FileInput } from 'flowbite-react';
import StatusEditor from './StatusEditor';

const StatusUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setVideo(null);
      setVideoPreview(null);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setShowEditor(true);
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
      setShowEditor(true);
    }
  };

  const handleRemoveMedia = () => {
    setImage(null);
    setVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    document.getElementById('status-image').value = '';
    document.getElementById('status-video').value = '';
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
    setShowEditor(false);
    onClose();
  };

  const handleEditorSave = () => {
    // After editing, upload the status
    handleSubmit(new Event('submit'));
    setShowEditor(false);
  };

  if (!isOpen) return null;

  // Show editor if media is uploaded
  if (showEditor && (imagePreview || videoPreview)) {
    return (
      <StatusEditor
        mediaUrl={imagePreview || videoPreview}
        mediaType={imagePreview ? 'image' : 'video'}
        onSave={handleEditorSave}
        onClose={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create Status</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none"
              rows={4}
              disabled={uploading}
            />

            {/* Media Preview */}
            {(imagePreview || videoPreview) && (
              <div className="mb-4 relative">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-lg"
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
              </div>
            )}

            {/* Upload Buttons */}
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
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 text-center">
                  <span className="text-gray-600">📷 Add Photo</span>
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
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 text-center">
                  <span className="text-gray-600">🎥 Add Video</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                disabled={uploading}
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

