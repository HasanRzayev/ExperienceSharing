import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import QRCode from 'qrcode';
import { FaQrcode, FaMobile, FaDesktop, FaCheckCircle } from 'react-icons/fa';
import './QRLogin.css';

const QRLogin = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    generateLoginQR();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !isConfirmed) {
      timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isConfirmed) {
      // QR code expired
      setError('QR code expired. Please generate a new one.');
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, isConfirmed]);

  const generateLoginQR = async () => {
    try {
      setIsLoading(true);
      setError('');
      setIsConfirmed(false);
      setTimeLeft(300);

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.post(`${apiBaseUrl}/Device/generate-login-qr`, {});

      const { sessionId: newSessionId, qrData } = response.data;
      setSessionId(newSessionId);

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

      // Start polling for confirmation
      startPolling(newSessionId);

    } catch (error) {
      console.error('Error generating login QR:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (sessionId) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
        const response = await axios.get(`${apiBaseUrl}/Device/check-session/${sessionId}`);

        if (response.data.confirmed) {
          // Session confirmed, get token and login
          clearInterval(interval);
          await handleLoginSuccess(response.data.token, response.data.userId);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Continue polling even if there's an error
      }
    }, 2000); // Check every 2 seconds

    setPollingInterval(interval);
  };

  const handleLoginSuccess = async (token, userId) => {
    setIsConfirmed(true);
    
    // Save token
    Cookies.set('token', token, { 
      expires: 7,
      path: '/',
      sameSite: 'Lax',
      secure: window.location.protocol === 'https:'
    });

    // Fetch user data
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await fetch(`${apiBaseUrl}/Auth/GetProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        Cookies.set('userData', JSON.stringify(userData), { 
          expires: 7,
          path: '/',
          sameSite: 'Lax',
          secure: window.location.protocol === 'https:'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Show success message and redirect
    setTimeout(() => {
      navigate('/');
      window.location.reload(); // Reload to update auth state
    }, 2000);
  };

  const refreshQR = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
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
          ) : isConfirmed ? (
            <div className="success-message">
              <FaCheckCircle className="success-icon" />
              <h3>Login Successful!</h3>
              <p>Redirecting...</p>
            </div>
          ) : qrCodeImage ? (
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
                  <li>Make sure you're logged in</li>
                  <li>Go to Settings → QR Login</li>
                  <li>Tap "Scan QR Code"</li>
                  <li>Point your camera at this QR code</li>
                  <li>You'll be automatically logged in!</li>
                </ol>
              </div>

              <div className="qr-status">
                <p className="waiting-text">Waiting for scan...</p>
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
