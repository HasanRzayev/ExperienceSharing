import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/AuthService.js';
import { useAuth } from '../App';
import Cookies from 'js-cookie';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting admin login with:', { email, password });
      console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
      
      // Use admin-login endpoint for .NET backend
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await fetch(`${apiBaseUrl}/Auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Admin login response:', data);
        
        if (data.token) {
          console.log('Admin login successful, navigating to admin dashboard');
          
          // Save token to cookie
          Cookies.set('token', data.token, { expires: 7 }); // 7 days
          console.log('Token saved to cookie:', data.token);
          
          // Create admin user object for context (use email from login form)
          // Note: DB has no role column, admin is identified by email
          const adminUser = {
            id: 'admin',
            userName: 'admin',
            email: email, // Use the email from login form
            profileImage: 'https://via.placeholder.com/150'
          };
          
          // IMPORTANT: Save admin userData to cookie so it persists across page reloads
          Cookies.set('userData', JSON.stringify(adminUser), { expires: 7 });
          console.log('Admin userData saved to cookie:', adminUser);
          
          handleLogin(adminUser);
          navigate('/admin');
        } else {
          alert('Admin access required. Invalid admin credentials.');
        }
      } else {
        let errorMessage = 'Invalid admin credentials';
        try {
          // Clone the response to avoid "body already read" error
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          console.error('Admin login error:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          try {
            const textResponse = await response.text();
            console.error('Admin login error (text):', textResponse);
            errorMessage = textResponse || errorMessage;
          } catch (textError) {
            console.error('Admin login error (both json and text failed):', textError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-red-600 via-purple-600 to-indigo-700 p-8 text-white text-center">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-lg opacity-90">Experience Sharing Management</p>
          </div>
          
          <div className="p-8 bg-white">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input 
                  type="email" 
                  placeholder="admin@wanderly.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="input-modern w-full" 
                />
                <p className="text-xs text-gray-500 mt-1">Use: admin@wanderly.com</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input 
                  type="password" 
                  placeholder="Enter any password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="input-modern w-full" 
                />
                <p className="text-xs text-gray-500 mt-1">Any password works for admin</p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Access Admin Panel'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                <a href="/" className="text-purple-600 hover:text-purple-500 font-semibold">
                  ← Back to Main Site
                </a>
              </p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Admin Access Only</p>
                  <p>This panel is restricted to administrators only. Use the provided credentials to access the management interface.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
