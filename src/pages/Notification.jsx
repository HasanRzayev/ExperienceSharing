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

  useEffect(() => {
    // Token yoxlanılır və yoxdursa, səhv göstərilir
    if (!token) {
      console.error("Token not found");
      return;
    }

    // Follow requestləri alırıq
    axios
      .get(`${apiBaseUrl}/Followers/follow-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFollowRequests(response.data); // Follow request-ləri state-ə yükləyirik
        console.log("Follow requests data:", response.data);
        console.log("First request structure:", response.data[0]);
      })
      .catch((error) => console.error("Error fetching follow requests:", error));
  }, [token]);

  const handleFollowResponse = async (requestId, isAccepted) => {
    try {
      // Follow request-i tapırıq
      const request = followRequests.find(req => req.id === requestId);
      console.log("Found request:", request);
      
      // Backend pattern-ə əsasən followerId istifadə edirik
      console.log("Trying with followerId:", request.followerId);
      await axios.post(
        `${apiBaseUrl}/Followers/${request.followerId}/respond`,
        { 
          isAccepted: isAccepted 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Follow request qəbul olunduğu və ya rədd edildiyi halda siyahıdan silirik
      setFollowRequests((prev) => prev.filter((req) => req.id !== requestId));
      console.log("Success! Follow request handled.");
      
    } catch (error) {
      console.error("Error responding to follow request", error.response?.data);
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
              {followRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-6 border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {request.followerUsername?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 text-lg">
                        <strong className="text-gray-900">{request.followerUsername}</strong> wants to follow you
                      </p>
                      <p className="text-gray-500 text-sm">Request sent recently</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        className="btn-primary px-6 py-2"
                        onClick={() => handleFollowResponse(request.id, true)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </Button>
                      <Button
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        onClick={() => handleFollowResponse(request.id, false)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
