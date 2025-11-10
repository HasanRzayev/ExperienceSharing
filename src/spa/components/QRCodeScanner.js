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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <FaTimes className="size-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Point your camera at a QR code to link a device
          </p>

          {/* Camera Preview */}
          <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-64 w-full object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {!isScanning && (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <FaQrcode className="mx-auto mb-4 size-16 text-gray-400" />
                  <p className="text-gray-500">Camera not active</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
              {success}
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-blue-600"
              >
                <FaCamera className="mr-2 size-5" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex w-full items-center justify-center rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:bg-red-600"
              >
                <FaStop className="mr-2 size-5" />
                Stop Scanning
              </button>
            )}

            {/* Demo Button */}
            <button
              onClick={simulateQRDetection}
              className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
            >
              Demo: Simulate QR Detection
            </button>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
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
