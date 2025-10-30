import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaUsers, FaUser, FaPlus, FaSearch, FaPaperPlane, FaTimes, FaEllipsisV, FaInfoCircle, FaSignOutAlt, FaTrash, FaBan, FaBroom, FaCheckSquare, FaCheck } from 'react-icons/fa';
import { HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineVolumeUp } from "react-icons/hi";
import EmojiPicker from "emoji-picker-react";
import MicRecorder from "mic-recorder-to-mp3";

// Upload file to Cloudinary
export async function uploadFile(file) {
  console.log("Checking file type:", file);

  // If file is a URL and is a GIF, return it directly
  if (typeof file === "string" && file.startsWith("http")) {
      console.log("GIF detected, sending directly to API:", file);
      return file;
  }

  // Check file type and fix if necessary
  if (!file.type) {
      console.warn("File type unknown, setting as audio/wav.");
      file = new File([file], file.name || "recorded-audio.wav", { type: "audio/wav" });
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); // Cloudinary preset
  formData.append("folder", "messages"); // Files for messages

  const fileType = file.type.split("/")[0]; // "image", "video", "audio"
  const fileExtension = file.name.split('.').pop().toLowerCase(); // File extension

  let cloudinaryEndpoint = process.env.REACT_APP_CLOUDINARY_ENDPOINT;

  if (fileType === "image") {
      cloudinaryEndpoint += "image/upload";
      if (fileExtension === "gif") {
          formData.append("resource_type", "image"); // GIFs are also stored as images
      }
  } else if (fileType === "video") {
      cloudinaryEndpoint += "video/upload";
  } else if (fileType === "audio") {
      cloudinaryEndpoint += "raw/upload"; // Audio files stored as "raw" in Cloudinary
  } else {
      console.error("Unsupported file type:", fileType);
      return null;
  }

  try {
      const response = await fetch(cloudinaryEndpoint, {
          method: "POST",
          body: formData
      });

      if (!response.ok) {
          throw new Error("File upload failed!");
      }

      const data = await response.json();
      return data.secure_url; // Return uploaded file link
  } catch (error) {
      console.error("File upload error:", error);
      return null;
  }
}

const ChatPageV2 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null); // Current user state
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
  
  // Media upload states
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  
  // GIF states
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifs, setGifs] = useState([]);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [recorder, setRecorder] = useState(null);
  
  // Emoji picker state
  const [showPicker, setShowPicker] = useState(false);
  
  // Group members modal state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  
  // Chat options menu state
  const [showChatOptions, setShowChatOptions] = useState(false);
  
  const messagesEndRef = useRef(null);
  const token = Cookies.get('token');

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Initialize microphone recorder
    const newRecorder = new MicRecorder({ bitRate: 128 });
    setRecorder(newRecorder);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => console.log("Microphone permission granted"))
      .catch(() => console.log("Microphone access denied"));
    
    fetchUsers();
    fetchGroups();
    fetchAvailableUsers();
    fetchCurrentUser(); // Fetch current user
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Users data from API:', response.data);
      console.log('First user example:', response.data?.[0]);
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
      console.log('Groups data from API:', response.data);
      console.log('First group example:', response.data?.[0]);
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
      
      // Check if it's a blocked user error
      if (error.response?.status === 400 && error.response?.data?.message?.includes('blocked')) {
        alert('You cannot message this user. One of you has blocked the other.');
        setSelectedChat(null);
        setMessages([]);
      } else {
        setMessages([]);
      }
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
    console.log('Selected group:', group);
    setSelectedChat(group);
    setChatType('group');
    fetchGroupMessages(group.id);
    
    // If group already has members data, use it. Otherwise fetch separately
    if (group.members && Array.isArray(group.members)) {
      console.log('Using members from group object:', group.members);
      setGroupMembers(group.members);
    } else {
      console.log('Fetching members separately for group:', group.id);
      fetchGroupMembers(group.id);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      // Try to get group details which might include members
      const response = await axios.get(`${apiBaseUrl}/GroupChat/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('=== GROUP MEMBERS DEBUG ===');
      console.log('Group details from API:', response.data);
      console.log('Members in group:', response.data?.members);
      console.log('Members count:', response.data?.members?.length);
      
      if (response.data?.members && response.data.members.length > 0) {
        console.log('First member full object:', response.data.members[0]);
        console.log('First member keys:', Object.keys(response.data.members[0]));
        
        // Check all possible name fields
        const firstMember = response.data.members[0];
        console.log('firstName:', firstMember.firstName);
        console.log('firstname:', firstMember.firstname);
        console.log('FirstName:', firstMember.FirstName);
        console.log('userName:', firstMember.userName);
        console.log('username:', firstMember.username);
        console.log('Username:', firstMember.Username);
        console.log('name:', firstMember.name);
        console.log('Name:', firstMember.Name);
      }
      console.log('=== END DEBUG ===');
      
      setGroupMembers(response.data?.members || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
      setGroupMembers([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !file) || !selectedChat) return;

    let fileUrl = null;
    let mediaType = null;

    // Upload file if exists
    if (file) {
      fileUrl = await uploadFile(file);
      if (!fileUrl) {
        console.error("File upload failed, message not sent.");
        alert('File upload failed. Please try again.');
        return;
      }
      console.log("Uploaded file link:", fileUrl);

      // Determine media type
      if (file?.name) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (["jpg", "jpeg", "png", "webp", "gif"].includes(fileExtension)) {
          mediaType = "image";
        } else if (["mp4", "avi", "mov", "mkv"].includes(fileExtension)) {
          mediaType = "video";
        } else if (["mp3", "wav", "ogg", "flac"].includes(fileExtension)) {
          mediaType = "audio";
        } else {
          mediaType = "document";
        }
      }

      // If fileUrl is GIF link
      if (fileUrl && fileUrl.includes("gif")) {
        mediaType = "image";
      }
    }

    try {
      if (chatType === 'user') {
        await axios.post(
          `${apiBaseUrl}/Messages`,
          {
            receiverId: selectedChat.id,
            content: newMessage.trim(),
            mediaUrl: fileUrl,
            mediaType: mediaType
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Optimistic UI update for instant feedback
        setMessages(prev => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            senderId: user?.id,
            receiverId: selectedChat.id,
            content: newMessage.trim(),
            mediaUrl: fileUrl,
            mediaType: mediaType,
            timestamp: new Date().toISOString()
          }
        ]);
        // Fetch latest from server
        fetchUserMessages(selectedChat.id);
      } else if (chatType === 'group') {
        await axios.post(
          `${apiBaseUrl}/GroupChat/${selectedChat.id}/messages`,
          { 
            content: newMessage.trim(),
            mediaUrl: fileUrl,
            mediaType: mediaType
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Optimistic UI update for group as well
        setMessages(prev => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            sender: { id: user?.id, userName: user?.userName, profileImage: user?.profileImage },
            content: newMessage.trim(),
            mediaUrl: fileUrl,
            mediaType: mediaType,
            timestamp: new Date().toISOString()
          }
        ]);
        fetchGroupMessages(selectedChat.id);
      }
      
      setNewMessage('');
      setFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's a blocked user error
      if (error.response?.status === 400 && error.response?.data?.message?.includes('blocked')) {
        alert('You cannot message this user. One of you has blocked the other.');
        setSelectedChat(null);
        setMessages([]);
      } else {
        alert('Message not sent: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Polling to keep messages in sync (works even if SignalR is unavailable)
  useEffect(() => {
    if (!selectedChat) return;
    const intervalId = setInterval(() => {
      if (chatType === 'user') {
        fetchUserMessages(selectedChat.id);
      } else if (chatType === 'group') {
        fetchGroupMessages(selectedChat.id);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [selectedChat, chatType]);

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

  // GIF Functions
  const fetchTrendingGifs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_GIPHY_API_URL}/trending`,
        {
          params: {
            api_key: "DjEE0CmAPnIkmKlM7sjBN1bGBwQQE21V",
            limit: 10,
            rating: "g",
          },
        }
      );
      console.log("Giphy Trending GIFs:", response.data);
      setGifs(response.data.data);
    } catch (error) {
      console.error("Failed to load GIFs:", error);
    }
  };

  const searchGifs = async (query) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_GIPHY_API_URL}/search`,
        {
          params: {
            api_key: "DjEE0CmAPnIkmKlM7sjBN1bGBwQQE21V",
            q: query,
            limit: 10,
            rating: "g",
          },
        }
      );
      console.log("Giphy Search GIFs:", response.data);
      setGifs(response.data.data);
    } catch (error) {
      console.error("Failed to search GIFs:", error);
    }
  };

  const handleGifClick = async (gifUrl) => {
    // Send GIF in selected chat
    if (!selectedChat) return;

    try {
      if (chatType === 'user') {
        await axios.post(
          `${apiBaseUrl}/Messages`,
          {
            receiverId: selectedChat.id,
            content: '',
            mediaUrl: gifUrl,
            mediaType: 'image'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchUserMessages(selectedChat.id);
      } else if (chatType === 'group') {
        await axios.post(
          `${apiBaseUrl}/GroupChat/${selectedChat.id}/messages`,
          { 
            content: '',
            mediaUrl: gifUrl,
            mediaType: 'image'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchGroupMessages(selectedChat.id);
      }
      
      setShowGifPicker(false);
    } catch (error) {
      console.error('Error sending GIF:', error);
      alert('Failed to send GIF');
    }
  };

  // Voice Recording Functions
  const startRecording = () => {
    if (!recorder) return;

    recorder.start()
      .then(() => setIsRecording(true))
      .catch((e) => console.error("Failed to start recording:", e));
  };

  const stopRecording = () => {
    if (!recorder) {
      console.error("Recorder object is undefined.");
      return;
    }

    recorder.stop();

    recorder.getMp3()
      .then(([buffer, blob]) => {
        if (!blob) {
          console.error("Blob not created.");
          return;
        }

        const blobURL = URL.createObjectURL(blob);
        setBlobURL(blobURL);
        setIsRecording(false);
        
        // Create Blob as File with name and type
        const audioFile = new File([blob], "recorded-audio.wav", { type: "audio/wav" });
        
        // Set file for sending
        setFile(audioFile);
        
        // Auto-generate preview for audio
        setFilePreview({
          url: blobURL,
          name: "recorded-audio.wav",
          type: "audio/wav",
          size: blob.size
        });
      })
      .catch((e) => console.error("Failed to stop recording:", e));
  };

  // Emoji Handler
  const handleEmojiClick = (emojiData) => {
    setNewMessage((prevText) => prevText + emojiData.emoji);
  };

  // File Handling Functions
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setDropdownOpen(false);
      
      // Create file preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview({
          url: event.target.result,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  // Chat options handlers
  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave the group?')) return;
    
    try {
      await axios.post(
        `${apiBaseUrl}/GroupChat/${selectedChat.id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('You left the group');
      setSelectedChat(null);
      fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Error occurred: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear this chat?')) return;
    
    try {
      if (chatType === 'user') {
        await axios.delete(
          `${apiBaseUrl}/Messages/conversation/${selectedChat.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(
          `${apiBaseUrl}/GroupChat/${selectedChat.id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setMessages([]);
      alert('Chat cleared successfully');
    } catch (error) {
      console.error('Error clearing chat:', error);
      alert('Error occurred: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm('Are you sure you want to block this user?')) return;
    
    try {
      await axios.post(
        `${apiBaseUrl}/Messages/block/${selectedChat.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User blocked successfully');
      setSelectedChat(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error occurred: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnblockUser = async () => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    
    try {
      await axios.delete(
        `${apiBaseUrl}/Messages/unblock/${selectedChat.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User unblocked successfully');
      setSelectedChat(null);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Error occurred: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) return;
    
    try {
      await axios.delete(
        `${apiBaseUrl}/Messages/conversation/${selectedChat.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Conversation deleted successfully');
      setSelectedChat(null);
      setMessages([]);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error occurred: ' + (error.response?.data?.message || error.message));
    }
  };

  // Remove member from group (Admin only)
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) return;
    
    try {
      await axios.delete(
        `${apiBaseUrl}/GroupChat/${selectedChat.id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Member removed from group');
      fetchGroupMembers(selectedChat.id);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error occurred: ' + (error.response?.data?.message || error.message));
    }
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
                    users.map((user) => {
                      // Extract user properties with fallbacks
                      const displayName = user.firstName || user.firstname || user.Username || user.username || user.userName || user.name || 'User';
                      const username = user.userName || user.username || user.Username || 'user';
                      const profileImg = user.profileImage || user.ProfileImage || user.profile_image;
                      
                      return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedChat?.id === user.id && chatType === 'user' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                              src={profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                              alt={displayName}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff`;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                                {displayName}
                            </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                @{username}
                            </p>
                          </div>
                        </div>
                      </div>
                      );
                    })
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
                    groups.map((group) => {
                      // Check if group image is via.placeholder and replace with ui-avatars
                      let groupImage = group.groupImage || group.GroupImage;
                      if (!groupImage || groupImage.includes('via.placeholder')) {
                        groupImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name || 'Group')}&background=random`;
                      }
                      
                      return (
                      <div
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedChat?.id === group.id && chatType === 'group' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={groupImage}
                            alt={group.name || 'Group'}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name || 'G')}&background=667eea&color=fff`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                              {group.name || 'Unnamed Group'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {group.members?.length || group.memberCount || 0} members
                            </p>
                          </div>
                        </div>
                      </div>
                    )})
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {(() => {
                          if (chatType === 'user') {
                            const displayName = selectedChat.firstName || selectedChat.firstname || selectedChat.Username || selectedChat.username || selectedChat.userName || selectedChat.name || 'User';
                            const username = selectedChat.userName || selectedChat.username || selectedChat.Username || 'user';
                            const profileImg = selectedChat.profileImage || selectedChat.ProfileImage || selectedChat.profile_image;
                            
                            return (
                              <>
                                <img
                                  src={profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                                  alt={displayName}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff`;
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-800 dark:text-white truncate">
                                    {displayName}
                        </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    @{username}
                        </p>
                      </div>
                              </>
                            );
                          } else {
                            const groupName = selectedChat.name || selectedChat.Name || 'Group';
                            let groupImg = selectedChat.groupImage || selectedChat.GroupImage || selectedChat.group_image;
                            
                            // Replace via.placeholder with ui-avatars
                            if (!groupImg || groupImg.includes('via.placeholder')) {
                              groupImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`;
                            }
                            
                            return (
                              <>
                                <img
                                  src={groupImg}
                                  alt={groupName}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff`;
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-800 dark:text-white truncate">
                                    {groupName}
                                  </h3>
                                  <button
                                    onClick={() => setShowMembersModal(true)}
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer text-left"
                                  >
                                    {selectedChat.members?.length || selectedChat.memberCount || 0} members • View all
                                  </button>
                                </div>
                              </>
                            );
                          }
                        })()}
                      </div>
                      
                      {/* 3 Dots Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowChatOptions(!showChatOptions)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FaEllipsisV className="text-gray-600 dark:text-gray-400" />
                        </button>

                        {showChatOptions && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                            {chatType === 'group' ? (
                              /* Group Chat Options */
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    setShowMembersModal(true);
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <FaInfoCircle className="text-purple-600" />
                                  <span className="text-gray-700 dark:text-gray-200">Group bilgisi</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleClearChat();
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <FaBroom className="text-blue-600" />
                                  <span className="text-gray-700 dark:text-gray-200">Clear Chat</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setSelectedChat(null);
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <FaTimes className="text-gray-600" />
                                  <span className="text-gray-700 dark:text-gray-200">Close Chat</span>
                                </button>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                
                                <button
                                  onClick={() => {
                                    handleLeaveGroup();
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                                >
                                  <FaSignOutAlt className="text-red-600" />
                                  <span className="text-red-600 dark:text-red-400 font-medium">Leave Group</span>
                                </button>
                              </div>
                            ) : (
                              /* User Chat Options */
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    navigate(`/profile/${selectedChat.id}`);
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <FaInfoCircle className="text-purple-600" />
                                  <span className="text-gray-700 dark:text-gray-200">Profile Info</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleClearChat();
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <FaBroom className="text-blue-600" />
                                  <span className="text-gray-700 dark:text-gray-200">Clear Chat</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setSelectedChat(null);
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <FaTimes className="text-gray-600" />
                                  <span className="text-gray-700 dark:text-gray-200">Close Chat</span>
                                </button>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                
                                <button
                                  onClick={() => {
                                    handleDeleteConversation();
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                                >
                                  <FaTrash className="text-red-600" />
                                  <span className="text-red-600 dark:text-red-400">Delete Chat</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleBlockUser();
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                                >
                                  <FaBan className="text-red-600" />
                                  <span className="text-red-600 dark:text-red-400 font-medium">Block User</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleUnblockUser();
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3"
                                >
                                  <FaCheck className="text-green-600" />
                                  <span className="text-green-600 dark:text-green-400 font-medium">Unblock User</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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
                        // Determine if message is from current user
                        const isOwnMessage = chatType === 'user'
                          ? String(msg.senderId) === String(user?.id)
                          : String(msg.sender?.id) === String(user?.id);

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
                                  {/* Media Display */}
                                  {msg.mediaUrl && msg.mediaType === "image" && (
                                    <img 
                                      src={msg.mediaUrl} 
                                      alt="Uploaded media" 
                                      className="rounded-xl max-w-full mb-2 max-h-64 object-contain" 
                                    />
                                  )}
                                  {msg.mediaUrl && msg.mediaType === "video" && (
                                    <video 
                                      src={msg.mediaUrl} 
                                      controls 
                                      className="rounded-xl max-w-full mb-2 max-h-64" 
                                    />
                                  )}
                                  {msg.mediaUrl && msg.mediaType === "audio" && (
                                    <audio 
                                      src={msg.mediaUrl} 
                                      controls 
                                      className="rounded-xl mb-2 w-full" 
                                    />
                                  )}
                                  
                                  {/* Text Content */}
                                  {msg.content && <p className="break-words">{msg.content}</p>}
                                  
                                  {/* Timestamp + Read receipts for own messages */}
                                  <div className={`flex items-center gap-2 mt-1 ${isOwnMessage ? 'text-purple-200' : 'text-gray-500'}`}>
                                    <span>
                                      {new Date(msg.sentAt || msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {isOwnMessage && (
                                      <span className="ml-1 select-none" style={{ fontSize: '14px', fontWeight: 700 }}>
                                        {(() => {
                                          const isDeliveredAny = msg.IsDelivered ?? msg.isDelivered;
                                          const isReadAny = msg.IsRead ?? msg.isRead;
                                          if (isReadAny) return (<span style={{ color: '#34B7F1' }}>✓✓</span>);
                                          if (isDeliveredAny) return (<span style={{ color: '#9ca3af' }}>✓✓</span>);
                                          return (<span style={{ color: '#ffffff' }}>✓</span>);
                                        })()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* File Preview */}
                  {filePreview && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="flex-shrink-0">
                          {filePreview.type.startsWith('image/') ? (
                            <img 
                              src={filePreview.url} 
                              alt="Preview" 
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : filePreview.type.startsWith('video/') ? (
                            <video 
                              src={filePreview.url} 
                              className="w-12 h-12 object-cover rounded-lg"
                              controls={false}
                            />
                          ) : filePreview.type.startsWith('audio/') ? (
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xl">🎵</span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xl">📄</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 dark:text-white font-medium truncate">{filePreview.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2 items-center">
                      {/* Media Upload Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            file ? "bg-green-100 dark:bg-green-900" : ""
                          }`}
                          onClick={() => setDropdownOpen(!isDropdownOpen)}
                          title={file ? "File selected" : "Add media"}
                        >
                          <FaPlus className={`w-5 h-5 ${file ? "text-green-600" : "text-gray-600 dark:text-gray-400"}`} />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-700 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                            <button
                              type="button"
                              className="flex items-center w-full space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                              onClick={() => document.getElementById("image-upload-v2").click()}
                            >
                              <HiOutlinePhotograph className="text-xl" /> <span>Image</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center w-full space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                              onClick={() => document.getElementById("video-upload-v2").click()}
                            >
                              <HiOutlineVideoCamera className="text-xl" /> <span>Video</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center w-full space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                              onClick={() => document.getElementById("audio-upload-v2").click()}
                            >
                              <HiOutlineVolumeUp className="text-xl" /> <span>Audio</span>
                            </button>
                          </div>
                        )}

                        {/* Hidden File Inputs */}
                        <input 
                          type="file" 
                          id="image-upload-v2" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                        <input 
                          type="file" 
                          id="video-upload-v2" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                        <input 
                          type="file" 
                          id="audio-upload-v2" 
                          accept="audio/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                      </div>

                      {/* Message Input */}
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={file ? `Type a message and send ${file.name}...` : "Type a message..."}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />

                      {/* Emoji Picker Button */}
                      <button
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          showPicker ? "bg-purple-100 dark:bg-purple-900" : ""
                        }`}
                        title="Add emoji"
                      >
                        <span className="text-xl">😊</span>
                      </button>

                      {/* Emoji Picker Modal */}
                      {showPicker && (
                        <div className="absolute bottom-20 right-20 z-30">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-2xl border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-center mb-2 px-2">
                              <h4 className="text-gray-800 dark:text-white font-semibold text-sm">Choose Emoji</h4>
                              <button
                                type="button"
                                onClick={() => setShowPicker(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <FaTimes />
                              </button>
                            </div>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        </div>
                      )}

                      {/* GIF Picker Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowGifPicker(!showGifPicker);
                          if (!gifs.length) fetchTrendingGifs();
                        }}
                        className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          showGifPicker ? "bg-purple-100 dark:bg-purple-900" : ""
                        }`}
                        title="Send GIF"
                      >
                        <span className="text-xl">🎥</span>
                      </button>

                      {/* GIF Picker Modal */}
                      {showGifPicker && (
                        <div className="absolute bottom-20 right-32 z-30 bg-white dark:bg-gray-800 rounded-xl p-4 w-72 max-h-80 overflow-auto shadow-2xl border border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-gray-800 dark:text-white font-semibold">Choose a GIF</h4>
                            <button
                              type="button"
                              onClick={() => setShowGifPicker(false)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <FaTimes />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {gifs.map((gif) => (
                              <img
                                key={gif.id}
                                src={gif.images.fixed_height.url}
                                alt="GIF"
                                className="w-full h-auto cursor-pointer rounded-lg hover:opacity-75 transition-opacity"
                                onClick={() => handleGifClick(gif.images.fixed_height.url)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Voice Recording Button */}
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          isRecording ? "bg-red-100 dark:bg-red-900 animate-pulse" : ""
                        }`}
                        title={isRecording ? "Stop recording" : "Record voice"}
                      >
                        <span className="text-xl">{isRecording ? "🛑" : "🎙️"}</span>
                      </button>

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!newMessage.trim() && !file}
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

      {/* Group Members Modal */}
      {showMembersModal && chatType === 'group' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowMembersModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedChat?.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{groupMembers.length} members</p>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {groupMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaUsers className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p>No members found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupMembers.map((member, index) => {
                    // Extract user data from nested user object
                    const userData = member.user || member;
                    const displayName = userData.firstName || userData.firstname || 'User';
                    const lastName = userData.lastName || userData.lastname || '';
                    const fullName = lastName ? `${displayName} ${lastName}` : displayName;
                    const username = userData.userName || userData.username || userData.Username || 'user';
                    const profileImg = userData.profileImage || userData.ProfileImage || userData.profile_image;
                    const isAdmin = member.role === 'Admin' || member.role === 'admin' || member.isAdmin || false;
                    
                    // Check if current user is admin of this group
                    const currentUserMember = groupMembers.find(m => m.userId === user?.id);
                    const isCurrentUserAdmin = currentUserMember?.role === 'Admin';
                    const isCurrentUser = member.userId === user?.id;
                    
                    return (
                      <div
                        key={member.id || index}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <img
                          src={profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                            {fullName}
                            {isCurrentUser && <span className="text-xs text-gray-500 ml-2">(Siz)</span>}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{username}
                          </p>
                        </div>
                        {isAdmin && (
                          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                            Admin
                          </span>
                        )}
                        {isCurrentUserAdmin && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove from Group"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPageV2;

