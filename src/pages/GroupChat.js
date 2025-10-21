import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaUsers, FaPlus, FaSearch, FaUserPlus, FaCog, FaSignOutAlt } from 'react-icons/fa';

const GroupChat = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');

  // Create Group Modal State
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchGroups();
    fetchUsers();
  }, [token]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/GroupChat/my-groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/GroupChat/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchGroupMessages(group.id);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/GroupChat`,
        {
          name: groupName,
          description: groupDescription,
          memberIds: selectedMembers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Group created successfully!');
      setShowCreateModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await axios.post(
        `${apiBaseUrl}/GroupChat/${selectedGroup.id}/message`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      fetchGroupMessages(selectedGroup.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = availableUsers.filter(user =>
    user.firstName?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.userName?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '80vh' }}>
          <div className="flex h-full">
            {/* Groups Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaUsers /> Group Chats
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
                    title="Create Group"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Groups List */}
              <div className="flex-1 overflow-y-auto">
                {groups.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaUsers className="text-6xl mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No groups yet</p>
                    <p className="text-sm">Create your first group to get started!</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleSelectGroup(group)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedGroup?.id === group.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={group.groupImage || 'https://via.placeholder.com/50'}
                          alt={group.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{group.name}</h3>
                          <p className="text-sm text-gray-500">
                            {group.members?.length || 0} members
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedGroup ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedGroup.groupImage || 'https://via.placeholder.com/50'}
                        alt={selectedGroup.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{selectedGroup.name}</h3>
                        <p className="text-xs text-gray-500">
                          {selectedGroup.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-gray-100">
                      <FaCog className="text-xl" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="flex items-start gap-3">
                          <img
                            src={msg.sender?.profileImage || 'https://via.placeholder.com/40'}
                            alt={msg.sender?.userName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-800">
                                {msg.sender?.userName || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.sentAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                              <p className="text-gray-700">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <FaUsers className="text-6xl mx-auto mb-4" />
                    <p className="text-lg">Select a group to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Create New Group</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="What's this group about?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Add Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Members
                </label>
                <div className="relative mb-3">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleMemberSelection(user.id)}
                      className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                        selectedMembers.includes(user.id) ? 'bg-purple-50' : ''
                      }`}
                    >
                      <img
                        src={user.profileImage || 'https://via.placeholder.com/40'}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {user.firstName || user.userName}
                        </p>
                        <p className="text-sm text-gray-500">@{user.userName}</p>
                      </div>
                      {selectedMembers.includes(user.id) && (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>

                {selectedMembers.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedMembers.length} member(s) selected
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;

