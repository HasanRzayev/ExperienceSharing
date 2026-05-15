import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleLogin } from '../services/AuthService.js';
import { useAuth } from '../App';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    const response = await register(firstName, lastName, email, password, country, profileImage, userName);
    
    if (response.success) {
      // Call the context handleLogin to update authentication state
      handleLogin(response.userData);
      alert('Signup Successful!');
      navigate('/');
    } else {
      // Show error message
      setError(response.error || 'An error occurred during registration');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const response = await googleLogin(credentialResponse.credential);
      
      if (response.success) {
        Cookies.set('token', response.token);
        handleLogin(response.userData || null);
        navigate('/');
      } else {
        setError(response.error || 'An error occurred during Google registration');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setError('An error occurred during Google registration');
    }
  };

  const handleGoogleError = () => {
    setError('Google registration failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="glass rounded-3xl overflow-hidden shadow-soft">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Visual */}
            <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 p-10 sm:p-12 flex flex-col justify-center items-center text-white">
              <div className="absolute inset-0 bg-slate-900/15"></div>
              <div className="relative z-10 text-center">
                <div className="text-8xl mb-6">🚀</div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">Join Our Community!</h1>
                <div className="space-y-4 text-lg sm:text-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Create Lasting Memories</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Experience the Local Culture</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Connect with Travelers</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
              <div className="absolute top-1/2 left-5 w-12 h-12 bg-white opacity-10 rounded-full"></div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 sm:p-12 flex flex-col justify-center bg-white/80 dark:bg-slate-950/40">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create Account</h2>
                  <p className="text-slate-600 dark:text-slate-300">Join thousands of travelers sharing their experiences</p>
                </div>

                <form className="space-y-6" onSubmit={handleSignUp}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">First Name</label>
                      <input 
                        type="text" 
                        placeholder="John" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required 
                        className="input-modern w-full" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Doe" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required 
                        className="input-modern w-full" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Username</label>
                    <input 
                      type="text" 
                      placeholder="johndoe" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      required 
                      className="input-modern w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="input-modern w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Password</label>
                    <input 
                      type="password" 
                      placeholder="Create a strong password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="input-modern w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Country</label>
                    <input 
                      type="text" 
                      placeholder="United States" 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                      required 
                      className="input-modern w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Profile Picture</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300/80 dark:border-white/10 border-dashed rounded-2xl hover:border-orange-400 transition-colors bg-white/50 dark:bg-slate-950/20">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-slate-600 dark:text-slate-300 justify-center flex-wrap gap-x-1">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              onChange={(e) => setProfileImage(e.target.files[0])}
                            />
                          </label>
                          <p>or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                      required
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-slate-600 dark:text-slate-300">
                      I agree to the <a href="#" className="font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">Terms and Conditions</a> and <a href="#" className="font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">Privacy Policy</a>
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                    className="btn-secondary w-full py-3 text-lg font-semibold"
                  >
                    Create Account
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/80 dark:border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white/80 dark:bg-slate-950/40 text-slate-500 dark:text-slate-300">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="signup_with"
                      size="large"
                      width="350"
                    />
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Already have an account? 
                    <a href="/login" className="text-green-600 hover:text-green-500 font-semibold ml-1">
                      Sign In
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

export default SignUp ;



