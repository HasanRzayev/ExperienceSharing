import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import Cookies from "js-cookie";
import { Dropdown } from "flowbite-react";
import { HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineVolumeUp } from "react-icons/hi";
import EmojiPicker from "emoji-picker-react";

import MicRecorder from "mic-recorder-to-mp3";
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
  formData.append("folder", "messages"); // Fayllar mesajlar üçün ayrıca qovluğa düşsün

  const fileType = file.type.split("/")[0]; // "image", "video", "audio"
  const fileExtension = file.name.split('.').pop().toLowerCase(); // Fayl uzantısı

  let cloudinaryEndpoint = process.env.REACT_APP_CLOUDINARY_ENDPOINT;

  if (fileType === "image") {
      cloudinaryEndpoint += "image/upload";
      if (fileExtension === "gif") {
          formData.append("resource_type", "image"); // GIF-lər də image kimi gedir
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



const ChatPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  
  // Debug: users state-ini yoxla
  useEffect(() => {
    console.log('Users state changed:', users);
    console.log('Users length:', users.length);
  }, [users]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [recorder, setRecorder] = useState(null);
  const messagesEndRef = useRef(null);
  
  const TENOR_API_KEY = "DjEE0CmAPnIkmKlM7sjBN1bGBwQQE21V";
  const [showPicker, setShowPicker] = useState(false);
  const fetchTrendingGifs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_GIPHY_API_URL}/trending`,
        {
          params: {
            api_key: "DjEE0CmAPnIkmKlM7sjBN1bGBwQQE21V", // Öz API açarını yaz
            limit: 10, // Neçə GIF gətirmək istəyirsənsə
            rating: "g", // GIF-lərin uyğunluq dərəcəsi (g, pg, pg-13, r)
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
            api_key: "DjEE0CmAPnIkmKlM7sjBN1bGBwQQE21V", // Giphy API açarın
            q: query, // Axtarılan söz
            limit: 10, // Maksimum nəticə sayı
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

          // Call sendMessage directly (will upload inside)
          sendMessage("", audioFile);
      })
      .catch((e) => console.error("Failed to stop recording:", e));
};

  const handleGifClick = (gifUrl) => {
    sendMessage("", gifUrl); // Send selected GIF as message
    setShowGifPicker(false);
  };
  const handleEmojiClick = (emojiData) => {
    setNewMessage((prevText) => prevText + emojiData.emoji); // ✔️
    // setShowPicker(false); // Don't close after selection - user can select multiple emojis
  };

  // Handle message click - Navigate to experience detail or open media
  const handleMessageClick = (message) => {
    console.log('Message clicked:', message);
    console.log('Message type:', message.messageType);
    console.log('Message content:', message.content);
    
    // Check if message content has experience URL (works even if messageType is not set)
    if (message.content) {
      // Extract experience link from content - support both /about/ and /card/ formats
      const experienceMatch = message.content.match(/\/(about|card)\/(\d+)/);
      console.log('Experience match:', experienceMatch);
      
      if (experienceMatch) {
        const experienceId = experienceMatch[2];
        console.log('Navigating to card:', experienceId);
        navigate(`/card/${experienceId}`); // Always navigate to /card/ for consistency
        return;
      } else {
        console.log('No URL found in content');
      }
    }
    
    // If media exists and is image/video, could open modal
    if (message.mediaUrl && (message.mediaType === 'image' || message.mediaType === 'video')) {
      // You can add media modal here
      console.log('Media clicked:', message.mediaUrl);
    }
  };
  useEffect(() => {
    const newRecorder = new MicRecorder({ bitRate: 128 });
        setRecorder(newRecorder);

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => console.log("Microphone permission granted"))
            .catch(() => console.log("Microphone access denied"));
    console.log("Fetching user profile...");
    setUserLoading(true);
  
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })
      .then((res) => {
        console.log("Full response:", res);
        console.log("Response data:", res.data);
        console.log("Response data type:", typeof res.data);
        console.log("Response data keys:", Object.keys(res.data || {}));
        console.log("User ID from response:", res.data.id);
        console.log("User ID from userId:", res.data.userId);
        console.log("Profile image properties:", {
          profileImage: res.data.profileImage,
          profileImageUrl: res.data.profileImageUrl,
          image: res.data.image,
          avatar: res.data.avatar
        });
        
        // Ensure we're setting the full user object
        if (typeof res.data === 'object' && res.data !== null) {
          setUser(res.data);
        } else {
          console.error("Invalid user data received:", res.data);
          // Create a fallback user object
          const fallbackUser = {
            id: res.data || '1',
            userId: res.data || '1',
            userName: 'test_user',
            email: 'test@example.com',
            profileImage: 'https://via.placeholder.com/150'
          };
          setUser(fallbackUser);
        }
        setUserLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setUserLoading(false);
      });
  }, []);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
        
        // Əvvəlcə messaging-contacts endpoint-ini cəhd et
        try {
          console.log('Trying messaging-contacts endpoint...');
          console.log('API URL:', `${apiBaseUrl}/Followers/messaging-contacts`);
          console.log('Token:', Cookies.get("token"));
          
          const messagingResponse = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          });
          
          console.log('Messaging-contacts response:', messagingResponse.data);
          console.log('Response type:', typeof messagingResponse.data);
          console.log('Response length:', messagingResponse.data?.length);
          console.log('First contact example:', messagingResponse.data?.[0]);
          
          if (!Array.isArray(messagingResponse.data)) {
            console.error('Response is not an array:', messagingResponse.data);
            return;
          }
          
          const formattedContacts = messagingResponse.data.map((contact) => {
            console.log('Processing contact:', contact);
            console.log('Contact.id:', contact.id);
            console.log('Contact.username:', contact.username);
            console.log('Contact.profileImage:', contact.profileImage);
            console.log('Contact.relationshipType:', contact.relationshipType);
            
            const formatted = {
              id: contact.id,
              username: contact.username,
              profileImage: contact.profileImage,
              relationshipType: contact.relationshipType,
              firstName: contact.firstName,
              lastName: contact.lastName
            };
            
            console.log('Formatted contact:', formatted);
            return formatted;
          });
          
          console.log('Formatted contacts:', formattedContacts);
          setUsers(formattedContacts);
          return;
        } catch (messagingError) {
          console.warn('Messaging-contacts endpoint not available, falling back to separate endpoints:', messagingError);
          console.error('Messaging error details:', messagingError.response?.data);
          console.error('Messaging error status:', messagingError.response?.status);
        }
        
        // Fallback: following və followers endpoint-lərini ayrı-ayrı çağır
        console.log('Using fallback endpoints...');
        const [followingRes, followersRes, sendersRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/Followers/following`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          }).catch((err) => {
            console.error('Following endpoint error:', err);
            return { data: [] };
          }),
          axios.get(`${apiBaseUrl}/Followers/followers`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          }).catch((err) => {
            console.error('Followers endpoint error:', err);
            return { data: [] };
          }),
          axios.get(`${apiBaseUrl}/Followers/senders`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          }).catch((err) => {
            console.error('Senders endpoint error:', err);
            return { data: [] };
          })
        ]);
        
        const following = followingRes.data || [];
        const followers = followersRes.data || [];
        const senders = sendersRes.data || [];
        
        console.log('Following data:', following);
        console.log('Following length:', following.length);
        console.log('Followers data:', followers);
        console.log('Followers length:', followers.length);
        console.log('Senders data:', senders);
        console.log('Senders length:', senders.length);
        
        // Bütün kontakları formatla
        const formattedFollowing = following.map((user) => ({
          id: user.id,
          username: user.username,
          profileImage: user.profileImage,
          relationshipType: 'following'
        }));
        
        const formattedFollowers = followers.map((user) => ({
          id: user.id,
          username: user.username,
          profileImage: user.profileImage,
          relationshipType: 'follower'
        }));
        
        const formattedSenders = senders.map((sender) => ({
          id: sender.id,
          username: sender.userName,
          profileImage: sender.profileImage,
          relationshipType: 'sender'
        }));

        // Bütün kontakları birləşdir və dublikatları çıxar
        const allContacts = [...formattedFollowing, ...formattedFollowers, ...formattedSenders]
          .reduce((acc, contact) => {
            const existing = acc.find(c => c.id === contact.id);
            if (!existing) {
              acc.push(contact);
            }
            return acc;
          }, [])
          .sort((a, b) => {
            // mutual -> following -> follower -> sender sırası
            const order = { mutual: 0, following: 1, follower: 2, sender: 3 };
            return (order[a.relationshipType] || 4) - (order[b.relationshipType] || 4);
          });

        console.log('Formatted following:', formattedFollowing);
        console.log('Formatted followers:', formattedFollowers);
        console.log('Formatted senders:', formattedSenders);
        console.log('Final all contacts:', allContacts);
        setUsers(allContacts);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    console.log("🔄 Setting up SignalR connection...");
    const signalRUrl = process.env.REACT_APP_SIGNALR_HUB_URL || 'https://experiencesharingbackend.runasp.net/api/hubs/message';
    console.log("🔗 SignalR URL:", signalRUrl);
    console.log("🔐 Token available:", !!Cookies.get("token"));
    
    const newConnection = new HubConnectionBuilder()
      .withUrl(signalRUrl, {
        accessTokenFactory: () => {
          const token = Cookies.get("token");
          console.log("📤 Sending token:", !!token);
          return token;
        }
      })
      .withAutomaticReconnect()
      .build();

    console.log("🚀 Starting SignalR connection...");
    newConnection
      .start()
      .then(() => {
        console.log("✅ Connected to SignalR");
        console.log("SignalR State:", newConnection.state);
        console.log("SignalR ConnectionId:", newConnection.connectionId);
        setConnection(newConnection);
      })
      .catch((err) => {
        console.error("❌ Connection failed: ", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error details:", JSON.stringify(err, null, 2));
        // Retry for other errors
        setTimeout(() => {
          console.log("🔄 Retrying SignalR connection in 5 seconds...");
          newConnection.start();
        }, 5000);
      });

    newConnection.on("ReceiveMessage", (messageData) => {
      console.log("📨 Received message via SignalR:", messageData);
      console.log("📨 Message sender ID:", messageData.senderId);
      console.log("📨 Message receiver ID:", messageData.receiverId);
      console.log("📨 Current user ID:", user?.id);
      console.log("📨 Selected user ID:", selectedUser?.id);
      
      setMessages((prev) => {
        console.log("📨 Current messages count:", prev.length);
        
        // Check if message already exists to avoid duplicates
        const messageExists = prev.some(msg => 
          msg.id === messageData.id || 
          (msg.senderId === messageData.senderId && 
           msg.content === messageData.content && 
           msg.timestamp === messageData.timestamp)
        );
        
        if (messageExists) {
          console.log("📨 Message already exists, skipping duplicate");
          return prev;
        }
        
        console.log("📨 Adding new message to chat");
        
        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom(true);
        }, 100);
        
        return [...prev, messageData];
      });
    });

    // Handle message sent confirmation
    newConnection.on("messageSent", (messageData) => {
      console.log("Message sent confirmation:", messageData);
      // Don't add the message here since we already added it in sendMessage
      // This is just for confirmation
    });

    // Bağlantı vəziyyətini izlə
    newConnection.onclose((error) => {
      console.log("🔌 Connection closed:", error);
      setConnection(null);
      // Yalnız backend problemi yoxdursa yenidən qoşul
      if (!error || !error.message.includes("404") || !error.message.includes("Failed to fetch")) {
        setTimeout(() => {
          newConnection.start();
        }, 5000);
      }
    });

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchMessages = async () => {
      console.log("Fetching messages for user:", selectedUser.id);
      
      if (!selectedUser.id) {
        console.error("Selected user ID is undefined");
        return;
      }
    
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api'}/Messages/conversation/${selectedUser.id}`, 
          { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
        );
        
        console.log("📩 Fetched messages:", response.data);
        setMessages(response.data || []);
        setIsInitialLoad(true); // Reset initial load for new conversation
        
        // Scroll to bottom after fetching messages
        setTimeout(() => {
          scrollToBottom(false);
        }, 100);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      }
    };
    
    // Fetch messages when user is selected
    fetchMessages();
    
    // Also set up interval to periodically fetch new messages
    // Only fetch if connection is not active
    const intervalId = setInterval(() => {
      if (!connection || connection.state !== "Connected") {
        fetchMessages();
      }
    }, 5000); // Fetch every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedUser, connection]);

  const uploadFileToServer = async (formData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; // Media URL returned from API
    } catch (error) {
      console.error("File upload error:", error);
      return null;
    }
  };
  async function sendMessage(text, file) {
    // Bağlantı yoxlanması əlavə edin
    if (!connection || connection.state !== "Connected") {
      console.error("❌ SignalR connection is not established");
      alert("Chat connection is not established. Please refresh the page.");
      return;
    }

    if (!selectedUser) {
        console.error("No user selected!");
        alert("Please select a user.");
        return;
    }

    if (!user) {
        console.error("Logged in user not found!");
        alert("User data not loaded. Please refresh the page.");
        return;
    }

    if (userLoading) {
        console.error("User data still loading!");
        alert("User data is loading. Please wait.");
        return;
    }

    console.log("Full user object:", user);
    console.log("User type:", typeof user);
    console.log("User keys:", Object.keys(user || {}));
    console.log("User.id:", user?.id);
    console.log("User.userId:", user?.userId);
    
    // Try different ways to get the user ID
    const userId = user?.id || user?.userId || user?.user_id || user;
    
    if (!userId) {
        console.error("User ID not found!", user);
        alert("User ID is unknown. Please login again.");
        return;
    }
    
    console.log("Final userId:", userId);

    let fileUrl = null;
    let mediaType = null;

    if (file) {
        fileUrl = await uploadFile(file);
        if (!fileUrl) {
            console.error("File upload failed, message not sent.");
            return;
        }
        console.log("Uploaded file link:", fileUrl);

        // If file exists and has name, set mediaType based on extension
        if (file?.name) {
          console.log(file.name)
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
                mediaType = "image";
            } else if (["mp4", "avi", "mov", "mkv"].includes(fileExtension)) {
                mediaType = "video";
            } else if (["mp3", "wav", "ogg", "flac","audio/wav"].includes(fileExtension)) {
                mediaType = "audio";
            } else {
                mediaType = "document";
            }
        }
    }

    // Əgər fileUrl varsa və GIF linkidirsə (GIPHY və digər URL-ləri nəzərə alırıq)
    if (fileUrl && fileUrl.includes("gif")) {
        mediaType = "image";
    }

    const messageData = {
        content: text.trim(),
        mediaUrl: fileUrl, 
        mediaType: mediaType, // GIF üçün də mediaType olacaq
        senderId: userId,
        receiverId: selectedUser.id,
        timestamp: new Date().toISOString()
    };

    console.log("Message JSON:", messageData);
    console.log("User object when sending:", user);
    console.log("User ID when sending:", user?.id);
    console.log("User ID alt when sending:", user?.userId);

    try {
        // Check connection status again
        console.log("Connection state before send:", connection.state);
        
        if (connection.state === "Connected") {
          console.log("🚀 Sending message via SignalR:", messageData);
          await connection.invoke("SendMessage", messageData);
          console.log("✅ Message sent successfully via SignalR");

          // Add message to local state immediately for instant feedback
          setMessages((prev) => [...prev, {
            ...messageData,
            senderName: user?.firstName || user?.userName || 'You',
            senderProfileImage: user?.profileImage,
            timestamp: messageData.timestamp
          }]);

          // Clear input fields after sending
          setNewMessage(""); // Clear input after sending message
          setFile(null); // Reset file selection
          setFilePreview(null); // Clear file preview
          
          // Scroll to bottom after sending message
          setTimeout(() => {
            scrollToBottom(true);
          }, 100);
        } else {
          console.error("❌ Connection not ready:", connection.state);
          alert("Connection problem. Please refresh the page.");
        }
    } catch (error) {
        console.error("❌ Server error:", error?.message || error);
        console.error("❌ Full error:", error);
          alert("Message failed to send. Please try again.");
    }
}




const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setDropdownOpen(false);
    
    // Fayl preview yaratmaq
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

// Auto scroll to bottom function
const scrollToBottom = (smooth = true) => {
  messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
};

// State to track if it's the initial load
const [isInitialLoad, setIsInitialLoad] = useState(true);
const [previousMessageCount, setPreviousMessageCount] = useState(0);

// Auto scroll when messages change
useEffect(() => {
  if (isInitialLoad && messages.length > 0) {
    // First load: scroll to bottom instantly
    setTimeout(() => {
      scrollToBottom(false);
    }, 100);
    setIsInitialLoad(false);
    setPreviousMessageCount(messages.length);
  } else if (!isInitialLoad && messages.length > previousMessageCount) {
    // New message: always scroll to bottom (with smooth animation)
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
    setPreviousMessageCount(messages.length);
  }
}, [messages, isInitialLoad, previousMessageCount]);

// Filter users based on search query
const filteredUsers = users.filter(user => 
  (user.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
  (user.Username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
  (user.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
  (user.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
);

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex overflow-hidden">
      {/* SOL PANEL */}
      <div className="w-1/4 glass m-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: 'calc(100vh - 2rem)' }}>
        {/* Header with title */}
        <div className="p-6 border-b border-white border-opacity-10">
          <h2 className="text-2xl font-bold mb-4 gradient-text">💬 Chats</h2>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 glass rounded-xl outline-none text-white placeholder-gray-300 focus:shadow-hover transition-smooth"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 text-xl">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white text-xl"
              >
                ✖
              </button>
            )}
          </div>
        </div>
        
        {/* Users List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300">
              {searchQuery ? 'No users found' : 'No contacts yet'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user, index) => {
          console.log('Rendering user:', user);
          return (
          <div
            key={user.id || `user-${index}`}
            className={`p-4 flex items-center space-x-4 cursor-pointer rounded-xl transition-smooth hover:shadow-hover ${
              selectedUser?.id === user.id 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg" 
                : "glass hover:bg-white hover:bg-opacity-10"
            }`}
            onClick={() => {
              console.log('User clicked:', user);
              setSelectedUser(user);
            }}
          >
                <div className="relative">
                  <img
                    src={user.ProfileImage || user.profileImage || "https://via.placeholder.com/40"}
                    alt={user.Username || user.username}
                    className="w-12 h-12 rounded-full border-2 border-white border-opacity-30 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{user.Username || user.username}</span>
                    {user.relationshipType && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.relationshipType === 'mutual' 
                          ? 'bg-green-500 bg-opacity-80 text-white' 
                          : user.relationshipType === 'following'
                          ? 'bg-blue-500 bg-opacity-80 text-white'
                          : user.relationshipType === 'follower'
                          ? 'bg-gray-500 bg-opacity-80 text-white'
                          : 'bg-purple-500 bg-opacity-80 text-white'
                      }`}>
                        {user.relationshipType === 'mutual' ? '🤝' :
                         user.relationshipType === 'following' ? '👤' :
                         user.relationshipType === 'follower' ? '👥' :
                         '📨'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">Online</p>
                </div>
              </div>
            );
          })
        )}
          </div>
        </div>
      </div>

      {/* SAĞ PANEL */}
      <div className="w-3/4 glass my-4 mr-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center flex-shrink-0">
          {selectedUser ? (
            <div className="flex items-center justify-center space-x-4">
              <img
                src={selectedUser.profileImage || "https://via.placeholder.com/40"}
                alt={selectedUser.username}
                className="w-10 h-10 rounded-full border-2 border-white border-opacity-30"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedUser.username}</h3>
                <p className="text-sm text-white text-opacity-80">Online</p>
              </div>
            </div>
          ) : (
            <h3 className="text-xl font-bold text-white">Select a chat to start messaging</h3>
          )}
        </div>

        {/* Messages - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-gray-900 to-opacity-10 custom-scrollbar">
          {userLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading user data...</h3>
                <p className="text-gray-300">Please wait while we load your profile</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-gray-300">Send your first message to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Backend-dən gələn IsFromCurrentUser field-ini istifadə edək, yoxdursa manual hesabla
              const currentUserId = user?.id || user?.userId;
              const isMyMessage = msg.IsFromCurrentUser !== undefined 
                ? msg.IsFromCurrentUser 
                : (currentUserId && parseInt(msg.senderId) === parseInt(currentUserId));
              console.log("Message check:", { 
                msgSenderId: msg.senderId, 
                currentUserId: user?.id, 
                isMyMessage,
                IsFromCurrentUser: msg.IsFromCurrentUser,
                msgContent: msg.content,
                msgSentAt: msg.sentAt
              });
              
              return (
                <div key={index} className={`flex items-end space-x-3 ${isMyMessage ? "justify-end" : "justify-start"}`}>
                  
                  {/* Profile picture if message is not from current user */}
                  {!isMyMessage && (
                    <img
                      src={msg.senderProfileImage || selectedUser?.profileImage || "https://via.placeholder.com/40"}
                      alt={msg.senderName || "Sender Profile"}
                      className="w-10 h-10 rounded-full border-2 border-white border-opacity-30 shadow-lg"
                    />
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-md ${isMyMessage ? "order-first" : ""}`}>
                    {!isMyMessage && msg.senderName && (
                      <div className="text-xs font-semibold text-gray-300 mb-1 ml-2">
                        {msg.senderName}
                      </div>
                    )}
                    
                    <div
                      className={`p-4 rounded-2xl shadow-lg transition-smooth ${
                        isMyMessage 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto" 
                          : "bg-white bg-opacity-20 backdrop-blur-sm text-white mr-auto"
                      } ${
                        (msg.content?.includes('/about/') || msg.content?.includes('/card/')) ||
                        (msg.mediaUrl && (msg.mediaType === 'image' || msg.mediaType === 'video'))
                          ? "cursor-pointer hover:shadow-xl hover:scale-105" 
                          : ""
                      }`}
                      onClick={() => handleMessageClick(msg)}
                      title={
                        (msg.content?.includes('/about/') || msg.content?.includes('/card/'))
                          ? "Click to view experience"
                          : msg.mediaUrl && (msg.mediaType === 'image' || msg.mediaType === 'video')
                          ? "Click to view media"
                          : ""
                      }
                    >
                      {msg.mediaUrl && msg.mediaType === "image" && (
                        <img src={msg.mediaUrl} alt="Uploaded media" className="rounded-xl max-w-full mb-2" />
                      )}
                      {msg.mediaUrl && msg.mediaType === "video" && (
                        <video src={msg.mediaUrl} controls className="rounded-xl max-w-full mb-2" />
                      )}
                      {msg.mediaUrl && msg.mediaType === "audio" && (
                        <audio src={msg.mediaUrl} controls className="rounded-xl mb-2" />
                      )}
                      {msg.content && <p className="break-words">{msg.content}</p>}
                      
                      {/* Timestamp */}
                      {msg.timestamp && (
                        <div className={`text-xs mt-2 ${isMyMessage ? "text-blue-100" : "text-gray-400"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('az-AZ', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile picture for my messages */}
                  {isMyMessage && (
                    <div className="w-10 h-10 rounded-full border-2 border-white border-opacity-30 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      {typeof user === 'object' && user?.profileImage ? (
                        <img
                          src={user.profileImage || user.profileImageUrl || user.image || user.avatar || "https://via.placeholder.com/40"}
                          alt="Your Profile"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            console.log("Profile image failed to load:", e.target.src);
                            console.log("User object:", user);
                            console.log("Available image properties:", {
                              profileImage: user?.profileImage,
                              profileImageUrl: user?.profileImageUrl,
                              image: user?.image,
                              avatar: user?.avatar
                            });
                            // Hide the image and show initials instead
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ display: typeof user === 'object' && user?.profileImage ? 'none' : 'flex' }}
                      >
                        {typeof user === 'object' && user?.userName 
                          ? user.userName.charAt(0).toUpperCase()
                          : typeof user === 'string' 
                            ? user.charAt(0).toUpperCase()
                            : 'U'
                        }
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </div>


        {/* Fayl Preview */}
        {filePreview && (
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 p-3 glass rounded-xl">
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
                <p className="text-white font-medium truncate">{filePreview.name}</p>
                <p className="text-gray-300 text-sm">
                  {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-white transition-smooth"
              >
                <span className="text-xl">✖</span>
              </button>
            </div>
          </div>
        )}

        {/* Send Message */}
        <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center space-x-4 flex-shrink-0">
          {/* Media Upload Button */}
          <div className="relative">
            <button
              className={`p-3 glass rounded-full hover:shadow-hover transition-smooth text-white focus:outline-none ${
                file ? "bg-green-500 bg-opacity-50" : ""
              }`}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              title={file ? "File selected" : "Add media"}
            >
              <span className="text-xl">{isDropdownOpen ? "✖" : file ? "📎" : "➕"}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-48 glass rounded-xl p-3 shadow-2xl">
                <div className="flex flex-col space-y-2">
                  <button
                    className="flex items-center space-x-3 p-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-smooth text-white"
                    onClick={() => document.getElementById("image-upload").click()}
                  >
                    <HiOutlinePhotograph className="text-xl" /> <span>Upload Image</span>
                  </button>
                  <button
                    className="flex items-center space-x-3 p-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-smooth text-white"
                    onClick={() => document.getElementById("video-upload").click()}
                  >
                    <HiOutlineVideoCamera className="text-xl" /> <span>Upload Video</span>
                  </button>
                  <button
                    className="flex items-center space-x-3 p-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-smooth text-white"
                    onClick={() => document.getElementById("audio-upload").click()}
                  >
                    <HiOutlineVolumeUp className="text-xl" /> <span>Upload Audio</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Inputs */}
          <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
          <input type="file" id="video-upload" accept="video/*" className="hidden" onChange={handleFileChange} />
          <input type="file" id="audio-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full p-4 glass rounded-xl outline-none text-white placeholder-gray-300 focus:shadow-hover transition-smooth"
              placeholder={file ? `Type a message and send ${file.name}...` : "Type a message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage, file)}
            />
            {file && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-green-400 text-sm">📎</span>
              </div>
            )}
          </div>

          {/* Emoji Button */}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`p-3 glass rounded-full hover:shadow-hover transition-smooth text-white focus:outline-none ${
              showPicker ? "bg-purple-500 bg-opacity-50" : ""
            }`}
            title={showPicker ? "Close emoji picker" : "Add emoji"}
          >
            <span className="text-xl">😊</span>
          </button>
          {showPicker && (
            <div className="absolute bottom-16 right-4 z-20">
            <div className="glass rounded-xl p-2 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-semibold text-sm">Choose Emoji</h4>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✖
                </button>
              </div>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
            </div>
          )}

          {/* GIF Button */}
          <button
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              if (!gifs.length) fetchTrendingGifs();
            }}
            className="p-3 glass rounded-full hover:shadow-hover transition-smooth text-white focus:outline-none"
          >
            <span className="text-xl">🎥</span>
          </button>

          {showGifPicker && (
            <div className="absolute bottom-16 right-20 z-20 glass rounded-xl p-4 w-72 max-h-80 overflow-auto shadow-2xl">
              <h4 className="text-white font-semibold mb-3">Choose a GIF</h4>
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <img
                    key={gif.id}
                    src={gif.images.fixed_height.url}
                    alt="GIF"
                    className="w-full h-auto cursor-pointer rounded-lg hover:shadow-lg transition-smooth"
                    onClick={() => handleGifClick(gif.images.fixed_height.url)}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Voice Recording Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 glass rounded-full hover:shadow-hover transition-smooth text-white focus:outline-none ${
              isRecording ? "bg-red-500 bg-opacity-50" : ""
            }`}
          >
            <span className="text-xl">{isRecording ? "🛑" : "🎙️"}</span>
          </button>

          {/* Send Button */}
          <button 
            onClick={() => {
              sendMessage(newMessage, file);
              setFile(null);
              setFilePreview(null);
            }} 
            disabled={userLoading || !user}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-smooth focus:outline-none ${
              userLoading || !user 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-hover"
            }`}
          >
            {userLoading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

// Add custom scrollbar styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9333EA 0%, #4F46E5 100%);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #A855F7 0%, #6366F1 100%);
  }
`;
if (!document.head.querySelector('style[data-scrollbar]')) {
  styleSheet.setAttribute('data-scrollbar', 'true');
  document.head.appendChild(styleSheet);
}





