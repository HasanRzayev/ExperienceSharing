import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { getApiBaseUrl } from '../utils/env';

const SaveButton = ({ experienceId, renderAsMenuItem = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    if (token) {
      checkIfSaved();
    }
  }, [experienceId, token]);

  const checkIfSaved = async () => {
    // If no token, just return - don't show error
    if (!token) {
      console.log('⚠️ SaveButton - No token found');
      return;
    }

    console.log('🔍 SaveButton - Checking saved status with token:', token ? token.substring(0, 30) + '...' : 'null');

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(
        `${apiBaseUrl}/SavedExperience/check/${experienceId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500 // Don't treat 401 as error
        }
      );
      
      console.log('📥 SaveButton - Response status:', response.status);
      
      if (response.status === 200) {
        console.log('✅ SaveButton - Check successful:', response.data);
        setIsSaved(response.data.isSaved);
      } else if (response.status === 401) {
        console.log('🔒 SaveButton - Token invalid or expired');
        setIsSaved(false);
      } else {
        console.log('⚠️ SaveButton - Unexpected status:', response.status);
        setIsSaved(false);
      }
    } catch (error) {
      console.log('❌ SaveButton - Network error:', error.message);
      setIsSaved(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.stopPropagation();
    
    if (!token) {
      Swal.fire({
        title: '🔒 Login Required',
        text: 'Please log in to save experiences.',
        icon: 'info',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      
      if (isSaved) {
        // Unsave
        const response = await axios.delete(
          `${apiBaseUrl}/SavedExperience/${experienceId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: (status) => status < 500 // Don't treat 401 as error
          }
        );
        
        if (response.status === 200) {
          Swal.fire({
            title: 'Unsaved!',
            text: 'This experience has been removed from your saved list.',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
          });
          setIsSaved(false);
        } else if (response.status === 401) {
          // Session expired
          Swal.fire({
            title: '🔒 Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'warning',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
            confirmButtonText: 'Go to Login',
            showCancelButton: true,
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login';
            }
          });
        }
      } else {
        // Save
        const response = await axios.post(
          `${apiBaseUrl}/SavedExperience/${experienceId}`,
          {},
          { 
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: (status) => status < 500 // Don't treat 401 as error
          }
        );
        
        if (response.status === 200) {
          Swal.fire({
            title: 'Saved! 📌',
            text: 'This experience has been added to your saved list.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
          });
          setIsSaved(true);
        } else if (response.status === 401) {
          // Session expired
          Swal.fire({
            title: '🔒 Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'warning',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
            confirmButtonText: 'Go to Login',
            showCancelButton: true,
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login';
            }
          });
        }
      }
    } catch (error) {
      // Network error or other server error (500+)
      Swal.fire({
        title: '❌ Error',
        text: 'An error occurred. Please check your connection and try again.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render as menu item
  if (renderAsMenuItem) {
    return (
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300 disabled:opacity-50"
      >
        <svg 
          className={`w-5 h-5 ${isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
        <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  // Render as floating button
  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`bg-white dark:bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${
        isSaved 
          ? 'border-yellow-400 dark:border-yellow-500' 
          : 'border-gray-200 dark:border-gray-700'
      } hover:border-yellow-400 dark:hover:border-yellow-500 z-10 disabled:opacity-50`}
      title={isSaved ? "Unsave" : "Save"}
    >
      <svg 
        className={`w-5 h-5 ${
          isSaved 
            ? 'text-yellow-500 dark:text-yellow-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};

export default SaveButton;

