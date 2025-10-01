import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import LikeButton from "../components/LikeButton";
import FollowButton from "../components/FollowButton";
import { Carousel } from "flowbite-react";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CardAbout = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const handleUserNameClick = () => {
    if (post.user?.id) {
      navigate(`/profile/${post.user.id}`);
    }
  };
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5029/api/Experiences/${id}`
        );
        setPost(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchPost();
  }, [id]);

  if (!post) {
    return (
      <p className="text-center text-lg font-semibold text-gray-700 mt-5">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden p-6 mt-10">
      {/* Üst hissə: İstifadəçi adı və Like/Follow düymələri */}
      <div className="flex justify-between items-center mb-4">
        {/* İstifadəçi məlumatları */}
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full border-2 border-gray-300"
            src={post.user?.profileImage || "/default-avatar.png"}
            alt={post.user?.firstName}
          />
    <p
  className="text-lg font-semibold text-gray-900 cursor-pointer hover:underline"
  onClick={handleUserNameClick}
>
  {post.user?.firstName || "Unknown User"}
</p>
        </div>

        {/* Like və Follow düymələri */}
        <div className="flex items-center gap-4">
          <LikeButton experienceId={post.id} />
          <FollowButton userId={post.user?.id} />
        </div>
      </div>

      {/* Şəkil Karuseli */}
      <div className="relative h-64 sm:h-80 xl:h-96 2xl:h-[30rem] rounded-xl overflow-hidden shadow-lg">
        <Carousel className="rounded-xl">
          {post.imageUrls && post.imageUrls.length > 0 ? (
            post.imageUrls.map((image, index) => (
              <img
                key={index}
                className="w-full h-full object-cover rounded-xl"
                src={image.url}
                alt={`Slide ${index}`}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No images available</p>
          )}
        </Carousel>
      </div>

      {/* Aşağı hissə: Başlıq, təsvir, tarix və məkan */}
      <div className="mt-6 space-y-4 text-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          {post.title}
        </h1>
        <p className="text-lg text-gray-800 leading-relaxed bg-gray-100 p-4 rounded-xl shadow-sm text-center">
          {post.description || "No description available."}
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 text-lg">
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <strong>Date:</strong>{" "}
            {post.date !== "0001-01-01T00:00:00"
              ? new Date(post.date)
              : "Not specified"}
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" />
            <strong>Location:</strong> {post.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardAbout;
