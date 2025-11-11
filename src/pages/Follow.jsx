import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import FollowButton from "../components/FollowButton"; // FollowButton import edirik

const FollowersPage = () => {
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/Followers/followers`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })
      .then((res) => {
        console.log("Followers Data:", res.data); // Konsola yazdırır
        setFollowers(res.data);
      })
      .catch((err) => console.error("Error fetching followers:", err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6"> {/* max-w-lg -> max-w-2xl */}
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">İzləyicilərim</h2>
      <div className="bg-white shadow-lg rounded-lg p-5">
        {followers.length === 0 ? (
          <p className="text-gray-500 text-center">Hələ izləyicin yoxdur.</p>
        ) : (
          followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center p-4 border-b last:border-b-0 flex-wrap w-full min-h-[60px]"
            >
              <div className="flex items-center w-full sm:w-auto">
                <img
                  src={follower.profileImage || "/default-avatar.png"}
                  alt={follower.username}
                  className="w-12 h-12 rounded-full border"
                />
                <span className="font-medium text-lg text-gray-700 ml-4">{follower.username}</span>
              </div>
              {/* Boşluğu artırırıq */}
              <div className="ml-auto">
                <FollowButton userId={follower.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowersPage;
