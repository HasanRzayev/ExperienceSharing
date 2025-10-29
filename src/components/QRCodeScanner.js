import React, { useState, useRef, useEffect } from 'react';
import { FaQrcode, FaTimes, FaCamera, FaStop } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';

const QRCodeScanner = ({ onClose, onDeviceLinked }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsScanning(true);
      
      // Start QR code detection
      detectQRCode();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera access to scan QR codes.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setError(null);
  };

  const detectQRCode = () => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR code detection (in real implementation, use a QR code library)
      // For now, we'll simulate detection
      setTimeout(() => {
        if (isScanning) {
          detectQRCode();
        }
      }, 100);
    } else {
      setTimeout(() => {
        if (isScanning) {
          detectQRCode();
        }
      }, 100);
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    try {
      setError(null);
      
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const deviceInfo = {
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Device',
        deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        deviceInfo: navigator.userAgent
      };

      // Confirm device link
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/Device/confirm-link`,
        {
          sessionId: qrData.sessionId,
          ...deviceInfo
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Device linked successfully!');
      stopScanning();
      
      if (onDeviceLinked) {
        onDeviceLinked(response.data);
      }

      // Close scanner after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error linking device:', error);
      setError(error.response?.data?.message || 'Failed to link device');
    }
  };

  const simulateQRDetection = () => {
    // For demo purposes, simulate QR code detection
    const mockQRData = {
      sessionId: 'demo-session-123',
      userId: 1,
      timestamp: Date.now(),
      action: 'device_link'
    };
    handleQRCodeDetected(mockQRData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Point your camera at a QR code to link a device
          </p>

          {/* Camera Preview */}
          <div className="relative bg-gray-100 rounded-lg mb-4 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {!isScanning && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FaQrcode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Camera not active</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                <FaCamera className="w-5 h-5 mr-2" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                <FaStop className="w-5 h-5 mr-2" />
                Stop Scanning
              </button>
            )}

            {/* Demo Button */}
            <button
              onClick={simulateQRDetection}
              className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Demo: Simulate QR Detection
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
