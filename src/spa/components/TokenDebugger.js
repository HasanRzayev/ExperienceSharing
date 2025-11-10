import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const TokenDebugger = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    setLoading(true);
    const token = Cookies.get('token');
    
    const info = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
      allCookies: document.cookie,
      backendTests: {}
    };

    if (token) {
      // Test 1: Token Debug Endpoint
      try {
        const apiBaseUrl = 'https://experiencesharingbackend.runasp.net/api';
        const response1 = await axios.get(`${apiBaseUrl}/HealthCheck/token-debug`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        info.backendTests.tokenDebug = response1.data;
      } catch (error) {
        info.backendTests.tokenDebug = { error: error.message, status: error.response?.status };
      }

      // Test 2: Auth Test Endpoint (requires valid token)
      try {
        const apiBaseUrl = 'https://experiencesharingbackend.runasp.net/api';
        const response2 = await axios.get(`${apiBaseUrl}/HealthCheck/auth-test`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        info.backendTests.authTest = response2.data;
      } catch (error) {
        info.backendTests.authTest = { error: error.message, status: error.response?.status };
      }

      // Test 3: SavedExperience Check
      try {
        const apiBaseUrl = 'https://experiencesharingbackend.runasp.net/api';
        const response3 = await axios.get(`${apiBaseUrl}/SavedExperience/check/29`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500
        });
        info.backendTests.savedExperienceCheck = { 
          status: response3.status, 
          data: response3.data 
        };
      } catch (error) {
        info.backendTests.savedExperienceCheck = { error: error.message };
      }
    }

    setDebugInfo(info);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={testToken}
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-lg hover:bg-red-700"
      >
        {loading ? '🔍 Testing...' : '🔧 DEBUG TOKEN'}
      </button>

      {debugInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                🔧 Token Debug Info
              </h2>
              <button
                onClick={() => setDebugInfo(null)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>

            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>Has Token:</strong> {debugInfo.hasToken ? '✅ YES' : '❌ NO'}
              </div>
              <div className="text-sm">
                <strong>Token Length:</strong> {debugInfo.tokenLength}
              </div>
              {debugInfo.backendTests.authTest && (
                <div className="text-sm">
                  <strong>Auth Test:</strong> {
                    debugInfo.backendTests.authTest.status === 'AUTHENTICATED' 
                      ? '✅ SUCCESS' 
                      : `❌ FAILED (${debugInfo.backendTests.authTest.error || debugInfo.backendTests.authTest.status})`
                  }
                </div>
              )}
              {debugInfo.backendTests.savedExperienceCheck && (
                <div className="text-sm">
                  <strong>SavedExperience Check:</strong> {
                    debugInfo.backendTests.savedExperienceCheck.status === 200 
                      ? '✅ 200 OK' 
                      : `❌ ${debugInfo.backendTests.savedExperienceCheck.status} ${debugInfo.backendTests.savedExperienceCheck.error || ''}`
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDebugger;

