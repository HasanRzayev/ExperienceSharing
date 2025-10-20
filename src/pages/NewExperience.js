import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import swal from 'sweetalert';
import { FileInput, Label } from "flowbite-react";
import AIModerationService from '../services/AIModerationService';
import { useParams, useNavigate } from 'react-router-dom';

const NewExperience = () => {
  const { id } = useParams(); // URL-dən id-ni oxuyuruq
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moderationResults, setModerationResults] = useState(null);
  const [existingImages, setExistingImages] = useState([]); // Köhnə şəkillər

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleTagRemove = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]); // New images are appended to the previous ones
  };

  const handleImageRemove = (index) => {
    setImages(images.filter((_, i) => i !== index)); // Remove image at index
  };

  const clearForm = () => {
    setTags([]);
    setInputValue('');
    setImages([]);
    setTitle('');
    setDescription('');
    setLocation('');
    setDate('');
    setError('');
    setModerationResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages([...images, ...files]); // Add dropped files to the image array
  };

  // Əgər id varsa, experience məlumatlarını gətir
  useEffect(() => {
    if (id) {
      const fetchExperience = async () => {
        try {
          const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
          const response = await axios.get(`${apiBaseUrl}/Experiences/${id}`);
          const data = response.data;
          
          setTitle(data.title || '');
          setDescription(data.description || '');
          setLocation(data.location || '');
          setDate(data.date ? data.date.split('T')[0] : ''); // Format date for input
          
          // Tag-ları parse et
          const parsedTags = (data.tags || []).map(t => {
            let tagName = t.tagName || t.name || t;
            
            // Əgər JSON string-dirsə, parse et
            if (typeof tagName === 'string' && (tagName.startsWith('[') || tagName.startsWith('"'))) {
              try {
                let parsed = tagName;
                while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                  parsed = JSON.parse(parsed);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    parsed = parsed[0];
                  }
                }
                tagName = parsed;
              } catch (e) {
                console.error('Tag parse error:', e);
              }
            }
            
            return tagName;
          }).filter(tag => tag && typeof tag === 'string' && !tag.includes('\\') && !tag.includes('['));
          
          setTags(parsedTags);
          setExistingImages(data.imageUrls || []);
        } catch (error) {
          console.error('Error fetching experience:', error);
          swal({
            title: "Error!",
            text: "Failed to load experience data",
            icon: "error",
            button: "OK"
          });
        }
      };
      
      fetchExperience();
    }
  }, [id]);

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("Title", title.trim() || "Untitled Draft");
      formData.append("Description", description.trim() || "");
      formData.append("Location", location.trim() || "");
      formData.append("Date", date.trim() || new Date().toISOString());
      formData.append("Rating", "0");
      
      tags.filter(tag => tag.trim()).forEach((tag) => {
        formData.append("Tags", tag.trim());
      });
    
      images.forEach((image) => {
        formData.append("Images", image);
      });
    
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      await axios.post(`${apiBaseUrl}/Experiences/save-draft`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      swal({
        title: "Draft Saved!",
        text: "Your experience has been saved as a draft",
        icon: "success",
        timer: 2000,
        button: false
      });

      clearForm();
      setTimeout(() => {
        navigate("/Profil");
      }, 2000);
    } catch (error) {
      console.error("Error saving draft:", error);
      setError("Failed to save draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Inputları yoxla
    if (!title.trim() || !description.trim() || !location.trim() || !date.trim()) {
      setError("Bütün sahələri doldurun!");
      return;
    }
  
    // Ən azı bir şəkil əlavə olunubmu? (Edit mode-da köhnə şəkillər də sayılır)
    if (images.length === 0 && (!id || existingImages.length === 0)) {
      setError("Ən azı 1 şəkil əlavə edin!");
      return;
    }
  
    // Ən azı bir tag varsa, içində boşluqlardan ibarət olmamalıdır
    if (tags.some(tag => !tag.trim())) {
      setError("Boş etiketlər əlavə etmək olmaz!");
      return;
    }
  
    setError(""); // Əgər hər şey qaydasındadırsa, error mesajını sıfırla
    setIsLoading(true);
    setModerationResults(null);

    try {
      // AI Moderation Check - yalnız yeni post yaradarkən
      if (!id) {
        console.log("Starting AI moderation...");
        try {
          const moderationResults = await AIModerationService.performCompleteModeration(
            title.trim(),
            description.trim(),
            location.trim(),
            tags.filter(tag => tag.trim()),
            images
          );

          setModerationResults(moderationResults);

          if (!moderationResults.overallApproved) {
            let errorMessage = "Content moderation failed:\n";
            
            if (!moderationResults.textModeration.isAppropriate) {
              errorMessage += `Text: ${moderationResults.textModeration.reasons.join(', ')}\n`;
            }
            
            if (moderationResults.imageModeration) {
              moderationResults.imageModeration.forEach((img, index) => {
                if (!img.isAppropriate) {
                  errorMessage += `Image ${index + 1}: ${img.reasons.join(', ')}\n`;
                }
              });
            }
            
            if (moderationResults.relevanceCheck && !moderationResults.relevanceCheck.isRelevant) {
              errorMessage += `Relevance: ${moderationResults.relevanceCheck.reasons.join(', ')}\n`;
            }

            swal({
              title: "Content Not Approved",
              text: errorMessage,
              icon: "warning",
              button: "OK"
            });
            setIsLoading(false);
            return;
          }

          console.log("AI moderation passed, uploading experience...");
        } catch (moderationError) {
          console.error("AI Moderation Error:", moderationError);
          // AI moderation xətası varsa, yenə də davam et (API açarı işləməyə bilər)
          console.log("AI moderation failed, continuing without moderation...");
        }
      } else {
        // Edit mode - AI moderation skip edilir
        console.log("Edit mode - skipping AI moderation...");
      }

      // Proceed with upload
      
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("Title", title.trim());
      formData.append("Description", description.trim());
      formData.append("Location", location.trim());
      formData.append("Date", date.trim());
      
      // Tag-ları ayrı-ayrı append et (JSON.stringify istifadə etmə!)
      tags.filter(tag => tag.trim()).forEach((tag) => {
        formData.append("Tags", tag.trim());
      });
    
      images.forEach((image) => {
        formData.append("Images", image);
      });
    
      let response;
      if (id) {
        // Edit mode - PUT request
        response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/Experiences/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      } else {
        // Create mode - POST request
        response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/Experiences`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      }

      // Success - clear form and show success message
      clearForm();
      swal({
        title: "Success!",
        text: id ? "Experience updated successfully!" : "Experience added successfully after AI moderation",
        icon: "success",
        timer: 3000,
        button: false,
      });
      
      // Navigate back to profile after success
      navigate('/Profil');
    } catch (error) {
      console.error("Submit error:", error);
      swal({
        title: "Error!",
        text: error.response ? error.response.data.message : "An error occurred",
        icon: "error",
        timer: 3000,
        button: false,
      });
      setError("Gönderiyi yüklerken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            {id ? 'Edit Your Experience' : 'Share Your Experience'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {id ? 'Update your experience details' : 'Inspire others with your amazing adventures and create lasting memories'}
          </p>
        </div>

        <div className="card-modern p-8 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Content Moderation</h3>
                <p className="text-gray-600">Checking content for appropriateness...</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Analyzing text content</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span className="text-sm text-gray-600">Checking images</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <span className="text-sm text-gray-600">Verifying relevance</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Experience Title
                </label>
                <input 
                  type="text" 
                  placeholder="Give your experience a memorable title..." 
                  className="input-modern w-full disabled:opacity-50 disabled:cursor-not-allowed" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  disabled={isLoading}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </label>
                <input 
                  type="text" 
                  placeholder="Where did this happen?" 
                  className="input-modern w-full disabled:opacity-50 disabled:cursor-not-allowed" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  disabled={isLoading}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </label>
              <textarea 
                placeholder="Tell us about your amazing experience in detail..." 
                className="input-modern w-full h-32 resize-none disabled:opacity-50 disabled:cursor-not-allowed" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                disabled={isLoading}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date
              </label>
              <input 
                type="date" 
                className="input-modern w-full disabled:opacity-50 disabled:cursor-not-allowed" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                disabled={isLoading}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleTagRemove(index)} 
                      className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                className="input-modern w-full disabled:opacity-50 disabled:cursor-not-allowed" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={handleKeyDown} 
                disabled={isLoading}
                placeholder="Add tags (press Enter to add)" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Photos
              </label>
              
              {/* Drag-and-Drop file upload */}
              <div
                onDrop={isLoading ? undefined : handleDrop}
                onDragOver={isLoading ? undefined : (e) => e.preventDefault()}
                className={`relative group ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Label
                  htmlFor="dropzone-file"
                  className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 hover:border-purple-400 transition-all duration-300"
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-700">
                      <span className="text-purple-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                  <FileInput id="dropzone-file" className="hidden" onChange={handleImageChange} multiple disabled={isLoading} />
                </Label>
              </div>

              {/* Existing Images (Edit mode) */}
              {id && existingImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Current Images ({existingImages.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image.url || image} 
                          alt="Existing" 
                          className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow border-2 border-blue-300" 
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          Current
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    💡 Upload new images below to replace current ones
                  </p>
                </div>
              )}

              {/* New Image Preview */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    {id ? 'New Images to Upload' : 'Selected Images'} ({images.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow border-2 border-green-300" 
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 text-sm transition-colors shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* AI Moderation Results */}
            {moderationResults && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-blue-800 font-semibold mb-2">AI Content Moderation Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${moderationResults.textModeration.isAppropriate ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-gray-700">Text Content: {moderationResults.textModeration.isAppropriate ? 'Approved' : 'Rejected'}</span>
                      </div>
                      {moderationResults.imageModeration && (
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${moderationResults.imageModeration.every(img => img.isAppropriate) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-700">Images: {moderationResults.imageModeration.every(img => img.isAppropriate) ? 'Approved' : 'Rejected'}</span>
                        </div>
                      )}
                      {moderationResults.relevanceCheck && (
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${moderationResults.relevanceCheck.isRelevant ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-700">Content Relevance: {moderationResults.relevanceCheck.isRelevant ? 'Approved' : 'Rejected'}</span>
                        </div>
                      )}
                      <div className="mt-2 p-2 bg-white rounded border">
                        <span className="font-medium text-gray-800">Overall Status: </span>
                        <span className={moderationResults.overallApproved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {moderationResults.overallApproved ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button 
                type="button"
                onClick={clearForm}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Clear Form
              </button>
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                💾 Save Draft
              </button>
              <button 
                type="submit" 
                className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    AI Checking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Share Experience
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewExperience;
