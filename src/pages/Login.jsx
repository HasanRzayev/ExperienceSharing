import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleLogin } from '../services/AuthService.js';
import { useAuth } from '../App';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    const response = await login(email, password);
    
    if (response.success) {
      // Call the onLogin prop to update parent state
      if (onLogin) {
        onLogin(response.userData || null);
      }
      // Also call the context handleLogin (will fetch user data from API)
      handleLogin(response.userData || null);
      navigate('/');
    } else {
      // Show error message
      setError(response.error || 'An error occurred during login');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const response = await googleLogin(credentialResponse.credential);
      
      if (response.success) {
        Cookies.set('token', response.token);
        if (onLogin) {
          onLogin(response.userData || null);
        }
        handleLogin(response.userData || null);
        navigate('/');
      } else {
        setError(response.error || 'An error occurred during Google login');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('An error occurred during Google login');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="glass rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Visual */}
            <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 p-12 flex flex-col justify-center items-center text-white">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10 text-center">
                <div className="text-8xl mb-6">🌟</div>
                <h1 className="text-5xl font-bold mb-6">Welcome Back!</h1>
                <div className="space-y-4 text-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Your Perfect Getaway</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Create Lasting Memories</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Discover Hidden Gems</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
              <div className="absolute top-1/2 left-5 w-12 h-12 bg-white opacity-10 rounded-full"></div>
            </div>

            {/* Right Side - Form */}
            <div className="p-12 flex flex-col justify-center bg-white dark:bg-gray-800">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sign In</h2>
                  <p className="text-gray-600 dark:text-gray-400">Welcome back! Please sign in to your account</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="input-modern w-full" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="input-modern w-full" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500">Forgot password?</a>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary w-full py-3 text-lg font-semibold"
                  >
                    Sign In
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="signin_with"
                      size="large"
                      width="350"
                    />
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Don't have an account? 
                    <a href="/signup" className="text-orange-600 hover:text-orange-500 font-semibold ml-1">
                      Create Account
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Login;
