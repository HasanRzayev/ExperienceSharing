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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Device Link QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <FaTimes className="size-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Scan this QR code with another device to link it to your account
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
            </div>
          ) : qrCodeUrl ? (
            <div className="mb-4 rounded-lg border-2 border-gray-200 bg-white p-4">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            </div>
          ) : (
            <div className="mb-4 rounded-lg bg-gray-100 p-8">
              <FaQrcode className="mx-auto mb-2 size-16 text-gray-400" />
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
                className="flex flex-1 items-center justify-center rounded-lg bg-blue-100 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaDownload className="mr-2 size-4" />
                Download
              </button>
              <button
                onClick={copyQRData}
                className="flex flex-1 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
              >
                <FaCopy className="mr-2 size-4" />
                Copy Data
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-blue-600"
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
