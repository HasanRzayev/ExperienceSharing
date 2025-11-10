import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import QRCode from 'qrcode';
import { FaQrcode, FaMobile, FaDesktop, FaTablet } from 'react-icons/fa';

const QRLogin = () => {
  const navigate = useNavigate();
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    generateLoginQR();
  }, []);

  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && qrCodeData) {
      // QR code expired
      setQrCodeData(null);
      setQrCodeImage('');
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const generateLoginQR = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/Device/generate-login-qr-public`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { qrData, expiresIn } = response.data;
      setQrCodeData(qrData);
      setTimeLeft(expiresIn);

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeImage(qrImage);

    } catch (error) {
      console.error('Error generating login QR:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshQR = () => {
    generateLoginQR();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="qr-login-container">
      <div className="qr-login-card">
        <div className="qr-login-header">
          <h1>Login with QR Code</h1>
          <p>Scan this QR code with your mobile device to login</p>
        </div>

        <div className="qr-code-section">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={refreshQR} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : qrCodeData ? (
            <div className="qr-code-display">
              <div className="qr-code-wrapper">
                <img src={qrCodeImage} alt="Login QR Code" className="qr-code-image" />
                <div className="qr-code-overlay">
                  <div className="timer">
                    <span className="timer-text">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>
              
              <div className="qr-instructions">
                <h3>How to use:</h3>
                <ol>
                  <li>Open the app on your mobile device</li>
                  <li>Go to Settings → Linked Devices</li>
                  <li>Tap "Scan QR Code"</li>
                  <li>Point your camera at this QR code</li>
                  <li>You'll be automatically logged in!</li>
                </ol>
              </div>

              <div className="qr-actions">
                <button onClick={refreshQR} className="refresh-btn">
                  Refresh QR Code
                </button>
                <button onClick={() => navigate('/login')} className="back-btn">
                  Back to Login
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="qr-login-footer">
          <div className="device-icons">
            <FaDesktop className="device-icon" />
            <span>→</span>
            <FaMobile className="device-icon" />
          </div>
          <p>Secure login across devices</p>
        </div>
      </div>
    </div>
  );
};

export default QRLogin;
