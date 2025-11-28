"use client";

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "../utils/env";

export default function FollowRequestsPage() {
  const [followRequests, setFollowRequests] = useState([]);
  const token = Cookies.get("token");
  const apiBaseUrl = getApiBaseUrl();

  // Current user ID-ni token-dan almaq üçün funksiya
  const getCurrentUserId = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
             payload.userId || 
             payload.id || 
             payload.sub;
    } catch (error) {
      return null;
    }
  };

  // Follow requestləri yeniləmək üçün funksiya
  const refreshFollowRequests = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Followers/follow-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUserId = getCurrentUserId();
      const receivedRequests = response.data.filter(req => {
        const followedId = req.FollowedId || req.followedId;
        return followedId && currentUserId && String(followedId) === String(currentUserId);
      });
      setFollowRequests(receivedRequests);
      console.log("Follow requests refreshed:", receivedRequests);
      return receivedRequests;
    } catch (error) {
      console.error("Error refreshing follow requests:", error);
      return [];
    }
  };

  useEffect(() => {
    // Token yoxlanılır və yoxdursa, səhv göstərilir
    if (!token) {
      console.error("Token not found");
      return;
    }

    // Follow requestləri yükləyirik
    refreshFollowRequests();
  }, [token, apiBaseUrl]);

  const handleFollowResponse = async (request, isAccepted) => {
    let targetRequest = null;
    try {
      console.log("handleFollowResponse called with:", { request, isAccepted });
      
      // Əgər request obyekti deyilsə, ID ilə tapmağa çalışırıq
      targetRequest = request;
      if (typeof request === 'string' || typeof request === 'number') {
        const requestId = request;
        console.log("Looking for request by ID:", requestId);
        console.log("Current followRequests state:", followRequests);
        
        targetRequest = followRequests.find(req => {
          const reqId = req.id || req.Id || req.ID || req.requestId;
          return reqId && String(reqId) === String(requestId);
        });
        
        if (!targetRequest) {
          console.error("Request not found by ID:", requestId);
          // Requestləri yeniləyib yenidən yoxlayırıq
          const refreshedRequests = await refreshFollowRequests();
          targetRequest = refreshedRequests.find(req => {
            const reqId = req.id || req.Id || req.ID || req.requestId;
            return reqId && String(reqId) === String(requestId);
          });
          
          if (!targetRequest) {
            alert("Follow request not found. It may have already been processed.");
            return;
          }
        }
      }
      
      if (!targetRequest) {
        console.error("Invalid request object:", request);
        alert("Invalid follow request data. Please refresh the page.");
        return;
      }
      
      // Backend pattern-ə əsasən followerId istifadə edirik (case-sensitive)
      const followerId = targetRequest.FollowerId || targetRequest.followerId || targetRequest.FollowerID || targetRequest.followerID;
      if (!followerId) {
        console.error("FollowerId not found in request:", targetRequest);
        console.error("Request object keys:", Object.keys(targetRequest));
        alert("Invalid follow request data. Please refresh the page.");
        return;
      }
      
      const currentUserId = getCurrentUserId();
      const requestId = targetRequest.id || targetRequest.Id || targetRequest.ID;
      
      // Ətraflı debug məlumatları
      console.log("=== FOLLOW REQUEST RESPONSE DEBUG ===");
      console.log("Full request object:", JSON.stringify(targetRequest, null, 2));
      console.log("Request ID:", requestId);
      console.log("FollowerId (sending to backend):", followerId);
      console.log("Current User ID (from token):", currentUserId);
      console.log("FollowedId (from request):", targetRequest.FollowedId || targetRequest.followedId);
      console.log("Is Accepted:", isAccepted);
      console.log("API URL:", `${apiBaseUrl}/Followers/${followerId}/respond`);
      console.log("Request body:", { isAccepted: isAccepted });
      console.log("All follow requests in state:", followRequests);
      console.log("=====================================");
      
      // Backend-ə göndərməzdən əvvəl request-in hələ də mövcud olduğunu yoxlayırıq
      const refreshedRequests = await refreshFollowRequests();
      const stillExists = refreshedRequests.find(req => {
        const reqId = req.id || req.Id || req.ID;
        const reqFollowerId = req.FollowerId || req.followerId;
        return (reqId && String(reqId) === String(requestId)) || 
               (reqFollowerId && String(reqFollowerId) === String(followerId));
      });
      
      if (!stillExists) {
        alert("This follow request no longer exists. It may have been processed or cancelled. The list has been refreshed.");
        return;
      }
      
      const response = await axios.post(
        `${apiBaseUrl}/Followers/${followerId}/respond`,
        { 
          isAccepted: isAccepted 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      // Follow request qəbul olunduğu və ya rədd edildiyi halda siyahıdan silirik
      const requestIdToRemove = targetRequest.id || targetRequest.Id || targetRequest.ID;
      setFollowRequests((prev) => prev.filter((req) => {
        const reqId = req.id || req.Id || req.ID;
        return !reqId || String(reqId) !== String(requestIdToRemove);
      }));
      console.log("Success! Follow request handled.", response.data);
      
    } catch (error) {
      console.error("Error responding to follow request", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        targetRequest: targetRequest
      });
      
      let errorMessage = error.response?.data?.message || error.message || "Failed to respond to follow request";
      
      // 404 xətası üçün daha yaxşı mesaj
      if (error.response?.status === 404) {
        // Requestləri avtomatik yeniləyirik
        console.log("404 error - refreshing follow requests...");
        console.log("Error response data:", error.response?.data);
        console.log("Debug info from backend:", error.response?.data?.debug);
        
        await refreshFollowRequests();
        
        // Backend-dən gələn debug məlumatlarını göstəririk
        const debugInfo = error.response?.data?.debug;
        let detailedMessage = "Follow request not found. It may have already been processed.\n\n";
        
        if (debugInfo) {
          detailedMessage += `Debug Info:\n`;
          detailedMessage += `- Requested FollowerId: ${debugInfo.requestedFollowerId}\n`;
          detailedMessage += `- Current UserId: ${debugInfo.currentUserId}\n`;
          detailedMessage += `- Pending requests for user: ${JSON.stringify(debugInfo.pendingRequestsForUser, null, 2)}\n`;
        }
        
        detailedMessage += "\nThe list has been refreshed.";
        alert(detailedMessage);
        return;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Notifications</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your follow requests and stay updated with your community
          </p>
        </div>

        <div className="card-modern p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v2H4a2 2 0 01-2-2V7a2 2 0 012-2h6v2H4v12z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Follow Requests</h2>
          </div>

          {followRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No follow requests</h3>
              <p className="text-gray-600 mb-6">
                You're all caught up! When someone wants to follow you, their request will appear here.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All requests handled
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {followRequests.map((request, index) => {
                // Bütün mümkün ID variantlarını yoxlayırıq
                const requestId = request.id || request.Id || request.ID || request.requestId || index;
                const followerUsername = request.FollowerUsername || request.followerUsername || request.FollowerUsername || "Unknown";
                
                return (
                  <div
                    key={requestId || index}
                    className="p-6 border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {followerUsername?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-lg">
                          <strong className="text-gray-900">{followerUsername}</strong> wants to follow you
                        </p>
                        <p className="text-gray-500 text-sm">Request sent recently</p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          className="btn-primary px-6 py-2"
                          onClick={() => handleFollowResponse(request, true)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Accept
                        </Button>
                        <Button
                          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          onClick={() => handleFollowResponse(request, false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
