import React, { useState, useEffect } from 'react';
import { FaQrcode, FaTimes, FaDownload, FaCopy } from 'react-icons/fa';

const QRCodeGenerator = ({ qrData, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [qrData]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Import QRCode library dynamically
      const QRCode = (await import('qrcode')).default;
      
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData.qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = 'device-link-qr.png';
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(JSON.stringify(qrData.qrData));
    alert('QR data copied to clipboard!');
  };

  const formatTimeRemaining = () => {
    if (!qrData.expiresAt) return 'Unknown';
    
    const now = new Date();
    const expires = new Date(qrData.expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Device Link QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Scan this QR code with another device to link it to your account
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : qrCodeUrl ? (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg mb-4">
              <FaQrcode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Failed to generate QR code</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Expires in:</span>
              <span className="font-semibold text-red-600">{formatTimeRemaining()}</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={downloadQRCode}
                disabled={!qrCodeUrl}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={copyQRData}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaCopy className="w-4 h-4 mr-2" />
                Copy Data
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
