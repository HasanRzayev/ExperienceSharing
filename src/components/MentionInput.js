import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = "Write a comment...",
  className = "",
  onSubmit,
  users = [],
  onMention = null,
  mentionedUsers = []
}) => {
  const [text, setText] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selection, setSelection] = useState(0);
  const [mentionString, setMentionString] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [allUsers, setAllUsers] = useState([]);
  const textareaRef = useRef(null);
  const suggestionRef = useRef(null);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

  // Detect @ mentions and show suggestions
  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newText.substring(0, cursorPosition);
    
    // Check if there's a @ mention
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');

    if (lastAtIndex > lastSpaceIndex) {
      const mentionStr = textBeforeCursor.substring(lastAtIndex + 1, cursorPosition);
      setMentionString(mentionStr);
      setMentionStartIndex(lastAtIndex);
      
      // Use allUsers or prop users
      const userList = allUsers.length > 0 ? allUsers : users;
      
      // Filter users based on mention string
      if (mentionStr) {
        const filteredUsers = userList.filter(user => {
          const username = user.userName || user.username;
          return (
            username?.toLowerCase().includes(mentionStr.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(mentionStr.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(mentionStr.toLowerCase())
          );
        });
        setSuggestions(filteredUsers.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions(userList.slice(0, 5));
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
      setMentionString('');
      setMentionStartIndex(-1);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (user) => {
    console.log('handleSelectSuggestion called with user:', user);
    const username = user?.userName || user?.username;
    if (!user || !username) {
      console.error('Invalid user in handleSelectSuggestion', user);
      return;
    }
    
    const textBeforeMention = text.substring(0, mentionStartIndex);
    const textAfterCursor = text.substring(textareaRef.current.selectionStart);
    const newText = textBeforeMention + `@${username} ` + textAfterCursor;
    
    setText(newText);
    onChange(newText);
    setShowSuggestions(false);
    setMentionString('');
    
    // Call onMention callback if provided
    if (onMention && user.id) {
      onMention(user.id, username);
    }
    
    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        mentionStartIndex + 1 + username.length + 1,
        mentionStartIndex + 1 + username.length + 1
      );
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelection(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelection(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const selectedUser = suggestions[selection];
        if (selectedUser) {
          handleSelectSuggestion(selectedUser);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get('token');
        if (token) {
          const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('messaging-contacts response:', response.data);
          
          // Add current user to the list
          const currentUserRes = await axios.get(`${apiBaseUrl}/Auth/GetProfile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('GetProfile response:', currentUserRes.data);
          
          setAllUsers([...response.data || [], currentUserRes.data]);
          console.log('allUsers set to:', allUsers);
        }
      } catch (error) {
        console.error('Error fetching users for mentions:', error);
      }
    };

    fetchUsers();
  }, []);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelection(0);
  }, [suggestions]);

  // Update textarea position when suggestions appear
  useEffect(() => {
    if (showSuggestions && suggestionRef.current) {
      suggestionRef.current.scrollTop = 0;
    }
  }, [showSuggestions]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none ${className}`}
        rows={3}
      />

      {/* Mention Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionRef}
          className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto w-full"
          style={{ top: '100%' }}
        >
          {suggestions.map((user, index) => {
            console.log('Rendering suggestion:', user);
            return (
            <button
              key={user?.id || index}
              type="button"
              onClick={() => user && handleSelectSuggestion(user)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 transition-colors ${
                index === selection ? 'bg-purple-50' : ''
              }`}
            >
              <img
                src={user.profileImage || 'https://via.placeholder.com/32'}
                alt={user.userName || user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  @{user.userName || user.username}
                </div>
              </div>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentionInput;

