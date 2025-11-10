import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Reset token tapılmadı. Zəhmət olmasa emailinizdəki linkdən istifadə edin.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasiya
    if (!token) {
      setError('Token mövcud deyil');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      setError('Yeni parol ən azı 8 simvoldan ibarət olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parollar uyğun gəlmir');
      return;
    }

    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
      const response = await axios.post(`${apiBaseUrl}/Auth/reset-password`, {
        token: token,
        newPassword: newPassword
      });

      setSuccess(response.data.message || 'Şifrə uğurla yeniləndi!');
      
      // 2 saniyə sonra login səhifəsinə yönləndir
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Şifrə yeniləmə zamanı xəta baş verdi. Token etibarsız və ya vaxtı keçmiş ola bilər.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="w-full max-w-md">
        <div className="glass overflow-hidden rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 p-8 text-center text-white">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white bg-opacity-20">
              <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold">Create New Password</h1>
            <p className="text-blue-100">Enter your new password below</p>
          </div>

          <div className="bg-white p-8">
            {!token ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">
                <svg className="mx-auto mb-3 size-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">Token mövcud deyil</p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="mt-4 font-semibold text-purple-600 hover:text-purple-700"
                >
                  Forgot Password səhifəsinə qayıt
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input 
                    type="password" 
                    placeholder="Enter new password (min 8 characters)" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    minLength={8}
                    disabled={isLoading}
                    className="input-modern w-full" 
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={8}
                    disabled={isLoading}
                    className="input-modern w-full" 
                  />
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
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                    <div className="flex items-center">
                      <svg className="mr-2 size-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{success}</span>
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
                      Yenilənir...
                    </div>
                  ) : (
                    'Şifrəni Yenilə'
                  )}
                </button>
              </form>
            )}

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

export default ResetPassword;

