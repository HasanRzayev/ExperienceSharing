import React from 'react';
import { useNavigate } from 'react-router-dom';

const MentionText = ({ text, users = [] }) => {
  const navigate = useNavigate();

  // Parse text for mentions (@username)
  const parseMentions = (text) => {
    if (!text) return [];
    
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }

      // Find user by username
      const username = match[1];
      const user = users.find(u => 
        (u.username || u.userName)?.toLowerCase() === username.toLowerCase()
      );

      // Add mention
      parts.push({
        type: 'mention',
        username: username,
        userId: user?.id,
        user
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return parts;
  };

  const parts = parseMentions(text);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              onClick={() => part.userId && navigate(`/profile/${part.userId}`)}
              className={`text-blue-500 hover:text-blue-700 cursor-pointer font-medium ${part.userId ? 'underline' : ''}`}
            >
              @{part.username}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
};

export default MentionText;

