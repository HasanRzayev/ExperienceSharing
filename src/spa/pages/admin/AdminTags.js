import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../App";
import Cookies from "js-cookie";

function AdminTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
  });

  const navigate = useNavigate();
  const { userData } = useAuth();
  const pageSize = 1000; // Show ALL tags at once

  useEffect(() => {
    if (!userData || userData.email !== "admin@wanderly.com") {
      navigate("/admin-login");
      return;
    }
    fetchTags();
  }, [currentPage, searchTerm, userData, navigate]);

  const fetchTags = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("token");
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://experiencesharingbackend.runasp.net/api";
      const response = await fetch(
        `${apiBaseUrl}/Admin/tags?page=1&pageSize=1000&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const responseData = await response.json();
        // Admin tags endpoint returns paginated data
        setTags(Array.isArray(responseData.data) ? responseData.data : []);
        setTotalPages(responseData.totalPages || 1);
        setTotalItems(responseData.total || 0);
      } else {
        console.error("Failed to fetch tags:", response.status);
        // Fallback to empty data if API fails
        setTags([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
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

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTag(null);
    setFormData({
      name: "",
      color: "#3B82F6",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get("token");
      const url = editingTag
        ? `${process.env.REACT_APP_API_BASE_URL}/admin/tags/${editingTag.id}`
        : `${process.env.REACT_APP_API_BASE_URL}/admin/tags`;

      const method = editingTag ? "PUT" : "POST";

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
        fetchTags();
      }
    } catch (error) {
      console.error("Error saving tag:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        const token = Cookies.get("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/admin/tags/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          fetchTags();
        }
      } catch (error) {
        console.error("Error deleting tag:", error);
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

  const predefinedColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6B7280",
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading tags...</p>
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
                  Manage Tags
                </h1>
                <p className="text-sm text-gray-600">
                  Total: {totalItems} tags
                </p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              Add Tag
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
            placeholder="Search tags..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="mr-3 size-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tag.name}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Color:</span> {tag.color}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span>{" "}
                  {tag.createdAt
                    ? new Date(tag.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div className="mt-4">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
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
              {editingTag ? "Edit Tag" : "Add Tag"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tag Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., travel, food, adventure"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={handleInputChange}
                    name="color"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Predefined Colors
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color }))
                      }
                      className={`size-8 rounded border-2 ${
                        formData.color === color
                          ? "border-gray-400"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <div className="mb-2 text-sm text-gray-600">Preview:</div>
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name || "Tag Name"}
                </span>
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

export default AdminTags;
