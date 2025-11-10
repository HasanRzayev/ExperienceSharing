import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasiya
    if (!email.trim()) {
      setError('Email daxil edin');
      return;
    }

    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.post(`${apiBaseUrl}/Auth/forgot-password`, {
        email: email.trim()
      });

      setSuccess(response.data.message || 'Şifrə sıfırlama linki emailinizə göndərildi!');
      
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Xəta baş verdi. Zəhmət olmasa email və SMTP konfiqurasiyasını yoxlayın.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="glass overflow-hidden rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-center text-white">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white bg-opacity-20">
              <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold">Reset Password</h1>
            <p className="text-blue-100">Enter your email and new password</p>
          </div>

          <div className="bg-white p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="Enter your registered email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading}
                  className="input-modern w-full" 
                />
                <p className="mt-2 text-sm text-gray-500">
                  Sistemdə qeydiyyatdan keçmiş email adresinizi daxil edin
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <div className="flex items-center">
                    <svg className="mr-2 size-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center">
                    <svg className="mr-2 size-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="block font-medium text-green-700">{success}</span>
                      <p className="mt-2 text-sm text-gray-600">
                        📧 Zəhmət olmasa email qutunuzu yoxlayın və linki klikləyin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-3 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Göndərilir...
                  </div>
                ) : (
                  'Reset Linki Göndər'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-purple-600 hover:text-purple-500"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

