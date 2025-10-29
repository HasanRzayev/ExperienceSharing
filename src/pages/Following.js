import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import FollowButton from "../components/FollowButton";

const FollowingPage = () => {
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/Followers/following`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })
      .then((res) => {
        console.log("Following Data:", res.data);
        setFollowing(res.data);
      })
      .catch((err) => console.error("Error fetching following:", err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">İzlədiyim İstifadəçilər</h2>
      <div className="bg-white shadow-lg rounded-lg p-5">
        {following.length === 0 ? (
          <p className="text-gray-500 text-center">Hələ heç kimi izləmirsən.</p>
        ) : (
          following.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-4 border-b last:border-b-0 flex-wrap w-full min-h-[60px]"
            >
              <div className="flex items-center w-full sm:w-auto">
                <img
                  src={user.profileImage || "/default-avatar.png"}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border"
                />
                <span className="font-medium text-lg text-gray-700 ml-4">{user.username}</span>
              </div>
              <div className="ml-auto">
                <FollowButton userId={user.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowingPage;
