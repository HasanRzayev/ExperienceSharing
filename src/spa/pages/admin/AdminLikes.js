import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../App";
import Cookies from "js-cookie";

function AdminLikes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { userData } = useAuth();
  const pageSize = 1000; // Show ALL likes at once

  useEffect(() => {
    if (!userData || userData.email !== "admin@wanderly.com") {
      navigate("/admin-login");
      return;
    }
    fetchLikes();
  }, [currentPage, searchTerm, userData, navigate]);

  const fetchLikes = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("token");
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://experiencesharingbackend.runasp.net/api";
      const response = await fetch(
        `${apiBaseUrl}/Admin/likes?page=1&pageSize=1000&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const responseData = await response.json();
        // Admin likes endpoint returns paginated data
        const likesData = responseData.data || [];
        const allLikes = likesData.map((like) => ({
          id: like.id,
          experienceId: like.experienceId,
          userId: like.userId,
          experienceTitle:
            like.experience?.title || `Experience ${like.experienceId}`,
          userName: like.user?.userName || `User ${like.userId}`,
          userFirstName: like.user?.firstName,
          userLastName: like.user?.lastName,
          likesCount: 1,
        }));

        setLikes(allLikes);
        setTotalPages(1);
        setTotalItems(allLikes.length);
      } else {
        console.error("Failed to fetch likes:", response.status);
        // Fallback to empty data if API fails
        setLikes([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this like?")) {
      try {
        const token = Cookies.get("token");
        const apiBaseUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://experiencesharingbackend.runasp.net/api";
        const response = await fetch(`${apiBaseUrl}/Admin/likes/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          fetchLikes();
        }
      } catch (error) {
        console.error("Error deleting like:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading likes...</p>
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
                  Manage Likes
                </h1>
                <p className="text-sm text-gray-600">
                  Total: {totalItems} likes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search likes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="size-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {totalItems}
              </div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {likes.length > 0
                  ? Math.round((likes.length / totalItems) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Current Page</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {totalPages}
              </div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
          </div>
        </div>

        {/* Likes Table */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Like ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {likes.map((like) => (
                  <tr key={like.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {like.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {like.experienceTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {like.experienceId}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="mr-3 flex size-8 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-sm font-semibold text-purple-600">
                            {like.userFirstName
                              ? like.userFirstName.charAt(0).toUpperCase()
                              : String(like.userId).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{like.userName}</div>
                          <div className="text-xs text-gray-500">
                            {like.userFirstName && like.userLastName
                              ? `${like.userFirstName} ${like.userLastName}`
                              : `ID: ${like.userId}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {like.createdAt
                        ? new Date(like.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleDelete(like.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {likes.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">❤️</div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No likes found
            </h3>
            <p className="text-gray-600">
              There are no likes to display at the moment.
            </p>
          </div>
        )}

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
    </div>
  );
}

export default AdminLikes;
