import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import FollowButton from "../components/FollowButton";
import { getApiBaseUrl } from "../utils/env";
import { useNavigate } from "react-router-dom";

const FollowingPage = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${apiBaseUrl}/followers/following`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Following Data:", res.data);
        setFollowing(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching following:", err);
        setFollowing([]);
      })
      .finally(() => setLoading(false));
  }, [token, apiBaseUrl, navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading following...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">İzlədiyim İstifadəçilər</h2>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5">
        {following.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Hələ heç kimi izləmirsən.</p>
        ) : (
          following.map((user) => {
            const userId = user.id || user.Id || user.userId || user.UserId;
            const userName = user.userName || user.UserName || user.username || user.Username || "Unknown";
            const profileImage = user.profileImage || user.ProfileImage || "/default-avatar.png";
            const firstName = user.firstName || user.FirstName || "";
            const lastName = user.lastName || user.LastName || "";
            const displayName = firstName && lastName ? `${firstName} ${lastName}` : userName;

            return (
              <div
                key={userId}
                className="flex items-center p-4 border-b dark:border-gray-700 last:border-b-0 flex-wrap w-full min-h-[60px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                <div className="flex items-center w-full sm:w-auto flex-1">
                  <img
                    src={profileImage}
                    alt={userName}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div className="ml-4">
                    <span className="font-medium text-lg text-gray-700 dark:text-white block">{displayName}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">@{userName}</span>
                  </div>
                </div>
                <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                  <FollowButton userId={userId} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FollowingPage;
