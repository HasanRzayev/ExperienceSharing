import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../App";
import Cookies from "js-cookie";

function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    experienceId: "",
    userId: "",
  });

  const navigate = useNavigate();
  const { userData } = useAuth();
  const pageSize = 1000; // Show ALL comments at once

  useEffect(() => {
    if (!userData || userData.email !== "admin@wanderly.com") {
      navigate("/admin-login");
      return;
    }
    fetchComments();
  }, [currentPage, searchTerm, userData, navigate]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("token");
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://experiencesharingbackend.runasp.net/api";
      const response = await fetch(
        `${apiBaseUrl}/Admin/comments?page=${currentPage}&pageSize=${pageSize}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Admin comments endpoint returns { data, total, totalPages }
        setComments(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } else {
        console.error("Failed to fetch comments:", response.status);
        // Fallback to empty data if API fails
        setComments([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setFormData({
      content: comment.content,
      experienceId: comment.experienceId,
      userId: comment.userId,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingComment(null);
    setFormData({
      content: "",
      experienceId: "",
      userId: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get("token");
      const url = editingComment
        ? `${process.env.REACT_APP_API_BASE_URL}/admin/comments/${editingComment.id}`
        : `${process.env.REACT_APP_API_BASE_URL}/admin/comments`;

      const method = editingComment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchComments();
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const token = Cookies.get("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/admin/comments/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          fetchComments();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin")}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Comments
                </h1>
                <p className="text-sm text-gray-600">
                  Total: {totalItems} comments
                </p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Comment ID:</span>{" "}
                      {comment.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Experience ID:</span>{" "}
                      {comment.experienceId}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">User ID:</span>{" "}
                      {comment.userId}
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-gray-900">{comment.content}</p>
                  </div>

                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Created:</span>{" "}
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : "N/A"}
                  </div>
                </div>

                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(comment)}
                    className="rounded bg-indigo-100 px-3 py-1 text-sm text-indigo-700 transition-colors hover:bg-indigo-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 transition-colors hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {editingComment ? "Edit Comment" : "Add Comment"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter comment content..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Experience ID
                </label>
                <input
                  type="text"
                  name="experienceId"
                  value={formData.experienceId}
                  onChange={handleInputChange}
                  placeholder="Enter experience ID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Enter user ID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComments;
