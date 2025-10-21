import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaUsers, FaUser, FaPlus, FaSearch, FaPaperPlane, FaTimes } from 'react-icons/fa';

const ChatPageV2 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState(null); // 'user' or 'group'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const token = Cookies.get('token');

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
    fetchGroups();
    fetchAvailableUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/GroupChat/my-groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const fetchUserMessages = async (userId) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/GroupChat/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedChat(user);
    setChatType('user');
    fetchUserMessages(user.id);
  };

  const handleSelectGroup = (group) => {
    setSelectedChat(group);
    setChatType('group');
    fetchGroupMessages(group.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    try {
      if (chatType === 'user') {
        await axios.post(
          `${apiBaseUrl}/Messages`,
          {
            receiverId: selectedChat.id,
            content: newMessage.trim()
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchUserMessages(selectedChat.id);
      } else if (chatType === 'group') {
        await axios.post(
          `${apiBaseUrl}/GroupChat/${selectedChat.id}/messages`,
          { content: newMessage.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchGroupMessages(selectedChat.id);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      await axios.post(
        `${apiBaseUrl}/GroupChat`,
        {
          name: groupName,
          description: groupDescription,
          memberIds: selectedMembers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Group created successfully!');
      setShowCreateGroupModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden" style={{ height: '85vh' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header with Tabs */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                  {activeTab === 'groups' && (
                    <button
                      onClick={() => setShowCreateGroupModal(true)}
                      className="bg-white text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
                      title="Create Group"
                    >
                      <FaPlus />
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('chats')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'chats'
                        ? 'bg-white text-purple-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <FaUser className="inline mr-2" />
                    Chats
                  </button>
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'groups'
                        ? 'bg-white text-purple-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <FaUsers className="inline mr-2" />
                    Groups
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'chats' ? (
                  users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <FaUser className="text-6xl mx-auto mb-4 text-gray-300" />
                      <p>No contacts yet</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedChat?.id === user.id && chatType === 'user' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profileImage || 'https://ui-avatars.com/api/?name=' + (user.firstName || 'User')}
                            alt={user.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {user.firstName || user.userName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{user.userName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  groups.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <FaUsers className="text-6xl mx-auto mb-4 text-gray-300" />
                      <p>No groups yet</p>
                      <button
                        onClick={() => setShowCreateGroupModal(true)}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Create Group
                      </button>
                    </div>
                  ) : (
                    groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedChat?.id === group.id && chatType === 'group' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={group.groupImage || 'https://ui-avatars.com/api/?name=' + group.name + '&background=random'}
                            alt={group.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">{group.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {group.members?.length || 0} members
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          chatType === 'user'
                            ? (selectedChat.profileImage || 'https://ui-avatars.com/api/?name=' + (selectedChat.firstName || 'User'))
                            : (selectedChat.groupImage || 'https://ui-avatars.com/api/?name=' + selectedChat.name + '&background=random')
                        }
                        alt={chatType === 'user' ? selectedChat.firstName : selectedChat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {chatType === 'user' ? (selectedChat.firstName || selectedChat.userName) : selectedChat.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {chatType === 'user' ? '@' + selectedChat.userName : `${selectedChat.members?.length || 0} members`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isOwnMessage = chatType === 'user' 
                          ? msg.senderId !== selectedChat.id
                          : msg.sender?.id !== selectedChat.id; // For groups, check sender

                        return (
                          <div
                            key={index}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="flex items-start gap-2 max-w-[70%]">
                              {!isOwnMessage && chatType === 'group' && (
                                <img
                                  src={msg.sender?.profileImage || 'https://ui-avatars.com/api/?name=User'}
                                  alt="sender"
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                {!isOwnMessage && chatType === 'group' && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {msg.sender?.userName || 'Unknown'}
                                  </p>
                                )}
                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isOwnMessage
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                                  }`}
                                >
                                  <p>{msg.content}</p>
                                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-purple-200' : 'text-gray-500'}`}>
                                    {new Date(msg.sentAt || msg.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center text-gray-400">
                    {activeTab === 'chats' ? (
                      <>
                        <FaUser className="text-6xl mx-auto mb-4" />
                        <p className="text-lg">Select a contact to start chatting</p>
                      </>
                    ) : (
                      <>
                        <FaUsers className="text-6xl mx-auto mb-4" />
                        <p className="text-lg">Select a group to start chatting</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Group</h2>
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="What's this group about?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Members
                </label>
                <div className="relative mb-3">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleMemberSelection(user.id)}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                          selectedMembers.includes(user.id) ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <img
                          src={user.profileImage || 'https://ui-avatars.com/api/?name=' + (user.firstName || 'User')}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {user.firstName || user.userName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.userName}</p>
                        </div>
                        {selectedMembers.includes(user.id) && (
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {selectedMembers.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {selectedMembers.length} member(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

export default ChatPageV2;

