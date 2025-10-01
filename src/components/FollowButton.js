import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import "../CSS/FollowButton.css";

const FollowButton = ({ userId }) => {
  const [status, setStatus] = useState(""); // 'follow', 'requested', 'following'
  const token = Cookies.get("token");

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!token || !userId) return;

      try {
        const response = await axios.get(
          `http://localhost:5029/api/Followers/${userId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    checkFollowStatus();
  }, [token, userId]);

  const handleFollowClick = async () => {
    if (!token) {
      Swal.fire("Log in", "You must log in to perform this action.", "warning");
      window.location.href = "/login";
      return;
    }

    try {
      if (status === "following") {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Do you want to unfollow this user?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, unfollow!",
        });

        if (result.isConfirmed) {
          await axios.delete(`http://localhost:5029/api/Followers/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setStatus("follow");
          Swal.fire("Unfollowed!", "You are no longer following this user.", "success");
        }
      } else if (status === "requested") {
        const result = await Swal.fire({
          title: "Do you want to cancel the follow request?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, cancel!",
          cancelButtonText: "No",
        });

        if (result.isConfirmed) {
          console.log("Sent FollowedId:", userId);
          await axios.post(
            "http://localhost:5029/api/Followers/cancel-follow-request",
            {
              followedId: userId, // Sending only the followed user's ID
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Sending token in headers
                "Content-Type": "application/json",
              },
            }
          );

          setStatus("follow");
          Swal.fire("Follow request canceled!", "Your follow request has been successfully canceled.", "success");
        }
      } else {
        await axios.post(
          `http://localhost:5029/api/Followers/${userId}/request`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus("requested");
        Swal.fire("Follow request sent!", "Your follow request has been successfully sent.", "success");
      }
    } catch (error) {
      console.error("An error occurred during the follow operation:", error);

      let errorMessage = "An error occurred. Please try again later.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }

      Swal.fire("Error!", errorMessage, "error");
    }
  };

  return (
    <button className="btn-2" onClick={handleFollowClick}>
      <span>
        {status === "following"
          ? "Following"
          : status === "requested"
          ? "Cancel Follow Request"
          : "Follow"}
      </span>
    </button>
  );
};

export default FollowButton;
