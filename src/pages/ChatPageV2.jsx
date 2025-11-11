import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaUsers, FaUser, FaPlus, FaSearch, FaPaperPlane, FaTimes, FaEllipsisV, FaInfoCircle, FaSignOutAlt, FaTrash, FaBan, FaBroom, FaCheckSquare, FaCheck } from 'react-icons/fa';
import { HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineVolumeUp } from "react-icons/hi";
import EmojiPicker from "emoji-picker-react";
import { HubConnectionBuilder } from '@microsoft/signalr';
import { ensureMicRecorder } from '../utils/ensureMicRecorder';

const normalizeId = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null') return null;
  return str;
};

const getUserId = (userLike) =>
  userLike?.id ?? userLike?.Id ?? userLike?.userId ?? userLike?.UserId ?? userLike?.ID ?? null;

const getSenderId = (messageLike) =>
  messageLike?.senderId ??
  messageLike?.SenderId ??
  messageLike?.senderID ??
  messageLike?.SenderID ??
  messageLike?.senderUserId ??
  messageLike?.SenderUserId ??
  messageLike?.fromUserId ??
  messageLike?.FromUserId ??
  messageLike?.sender?.id ??
  messageLike?.sender?.Id ??
  messageLike?.sender?.userId ??
  messageLike?.sender?.UserId ??
  messageLike?.Sender?.Id ??
  messageLike?.Sender?.ID ??
  null;

const getReceiverId = (messageLike) =>
  messageLike?.receiverId ??
  messageLike?.ReceiverId ??
  messageLike?.receiverID ??
  messageLike?.ReceiverID ??
  messageLike?.receiverUserId ??
  messageLike?.ReceiverUserId ??
  messageLike?.toUserId ??
  messageLike?.ToUserId ??
  messageLike?.receiver?.id ??
  messageLike?.receiver?.Id ??
  messageLike?.receiver?.userId ??
  messageLike?.receiver?.UserId ??
  messageLike?.Receiver?.Id ??
  messageLike?.Receiver?.ID ??
  null;

const normalizeUserRecord = (userLike) => {
  if (!userLike || typeof userLike !== 'object') {
    const normalizedId = normalizeId(userLike);
    const numericId = typeof userLike === 'number' ? userLike : Number(normalizedId);
    const fallbackId = Number.isNaN(numericId) ? (normalizedId ?? userLike ?? null) : numericId;
    const finalId = fallbackId !== null && fallbackId !== undefined ? fallbackId : null;
    return finalId !== null
      ? {
          id: finalId,
          Id: finalId,
          userId: finalId,
          UserId: finalId,
          username: null,
          userName: null,
          UserName: null,
        }
      : null;
  }

  const rawId =
    userLike.id ??
    userLike.Id ??
    userLike.userId ??
    userLike.UserId ??
    userLike.ID ??
    null;
  const normalizedId = normalizeId(rawId);
  const numericId = typeof rawId === 'number' ? rawId : Number(normalizedId);
  const fallbackId = Number.isNaN(numericId) ? (normalizedId ?? rawId ?? null) : numericId;

  const userName =
    userLike.userName ??
    userLike.UserName ??
    userLike.username ??
    userLike.Username ??
    null;

  return {
    ...userLike,
    id: fallbackId,
    Id: fallbackId,
    userId: fallbackId,
    UserId: fallbackId,
    userName,
    UserName: userName ?? userLike.UserName ?? userLike.userName,
    username: userName ?? userLike.username,
  };
};

const normalizeMessageRecord = (messageLike) => {
  if (!messageLike || typeof messageLike !== 'object') return messageLike;

  const rawId =
    messageLike.id ??
    messageLike.Id ??
    messageLike.messageId ??
    messageLike.MessageId ??
    messageLike.tempId ??
    messageLike.TempId ??
    null;

  const senderIdRaw = getSenderId(messageLike);
  const receiverIdRaw = getReceiverId(messageLike);
  const senderIdNormalized = normalizeId(senderIdRaw);
  const receiverIdNormalized = normalizeId(receiverIdRaw);

  const timestamp =
    messageLike.timestamp ??
    messageLike.Timestamp ??
    messageLike.sentAt ??
    messageLike.SentAt ??
    messageLike.createdAt ??
    messageLike.CreatedAt ??
    null;

  const content = messageLike.content ?? messageLike.Content ?? '';
  const mediaUrl = messageLike.mediaUrl ?? messageLike.MediaUrl ?? null;
  const mediaType = messageLike.mediaType ?? messageLike.MediaType ?? null;

  const isDeliveredRaw =
    messageLike.isDelivered ??
    messageLike.IsDelivered ??
    messageLike.delivered ??
    false;
  const isReadRaw =
    messageLike.isRead ??
    messageLike.IsRead ??
    messageLike.read ??
    false;

  const senderProfileImage =
    messageLike.senderProfileImage ??
    messageLike.SenderProfileImage ??
    messageLike.sender?.profileImage ??
    messageLike.sender?.ProfileImage ??
    messageLike.sender?.avatar ??
    messageLike.sender?.Avatar ??
    null;

  const senderName =
    messageLike.senderName ??
    messageLike.SenderName ??
    messageLike.sender?.userName ??
    messageLike.sender?.UserName ??
    messageLike.sender?.username ??
    messageLike.sender?.Username ??
    messageLike.sender?.fullName ??
    messageLike.sender?.FullName ??
    messageLike.sender?.firstName ??
    messageLike.sender?.FirstName ??
    null;

  const senderRawObject = messageLike.sender ?? messageLike.Sender ?? null;
  const normalizedSender = senderRawObject
    ? {
        ...senderRawObject,
        id: normalizeId(getUserId(senderRawObject)) ?? senderIdNormalized,
        userName:
          senderRawObject.userName ??
          senderRawObject.UserName ??
          senderRawObject.username ??
          senderRawObject.Username ??
          senderName,
        profileImage:
          senderRawObject.profileImage ??
          senderRawObject.ProfileImage ??
          senderRawObject.avatar ??
          senderRawObject.Avatar ??
          senderProfileImage,
      }
    : senderIdNormalized || senderName || senderProfileImage
    ? {
        id: senderIdNormalized,
        userName: senderName,
        profileImage: senderProfileImage,
      }
    : null;

  const id = rawId ?? `temp-${Date.now()}`;

  return {
    ...messageLike,
    id,
    Id: id,
    senderId: senderIdNormalized,
    SenderId: senderIdNormalized,
    receiverId: receiverIdNormalized,
    ReceiverId: receiverIdNormalized,
    timestamp,
    Timestamp: timestamp,
    content,
    Content: content,
    mediaUrl,
    MediaUrl: mediaUrl,
    mediaType,
    MediaType: mediaType,
    isDelivered: !!isDeliveredRaw,
    IsDelivered: !!isDeliveredRaw,
    isRead: !!isReadRaw,
    IsRead: !!isReadRaw,
    senderProfileImage,
    SenderProfileImage: senderProfileImage,
    senderName,
    SenderName: senderName,
    sender: normalizedSender,
  };
};

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
  const location = useLocation();
  const token = Cookies.get('token');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null); // Current user state
  const [currentUserId, setCurrentUserId] = useState(null);
  const decodeUserIdFromToken = (jwtToken) => {
    if (!jwtToken || typeof jwtToken !== 'string') return null;
    const parts = jwtToken.split('.');
    if (parts.length < 2) return null;
    try {
      const payloadRaw = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
      const decodedPayload = atob(payloadRaw);
      const payload = JSON.parse(decodedPayload);
      const claim =
        payload?.nameid ??
        payload?.NameId ??
        payload?.sub ??
        payload?.id ??
        payload?.Id ??
        payload?.userId ??
        payload?.UserId ??
        null;
      return claim ?? null;
    } catch (err) {
      console.warn('[ChatPageV2] Failed to decode token payload', err);
      return null;
    }
  };

  useEffect(() => {
    if (!token) {
      setCurrentUserId(null);
      return;
    }
    const decoded = decodeUserIdFromToken(token);
    if (decoded !== null && decoded !== undefined) {
      const normalized = normalizeId(decoded);
      setCurrentUserId(normalized);
    }
  }, [token]);

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
  // Unread message counts for each user
  const [unreadCounts, setUnreadCounts] = useState({});
  // Last message timestamp for each user (for sorting)
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  
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

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';
  const signalRUrl = process.env.REACT_APP_SIGNALR_HUB_URL || 'https://experiencesharingbackend.runasp.net/api/hubs/message';
  const [connection, setConnection] = useState(null);
  const [connectionReady, setConnectionReady] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(() => {
    const stateTarget = location.state?.targetUserId;
    if (stateTarget) return stateTarget;
    const params = new URLSearchParams(location.search || '');
    return params.get('userId') || params.get('user');
  });

  useEffect(() => {
    const stateTarget = location.state?.targetUserId;
    const params = new URLSearchParams(location.search || '');
    const queryTarget = params.get('userId') || params.get('user');
    const nextTarget = stateTarget ?? queryTarget ?? null;
    if (
      (nextTarget === null && pendingUserId !== null) ||
      (nextTarget !== null && String(nextTarget) !== String(pendingUserId))
    ) {
      setPendingUserId(nextTarget);
    }
  }, [location, pendingUserId]);
  // Enable hub marking so reads are sent to backend if available
  const enableHubMarking = true;

  // Keep latest values to avoid stale closures inside SignalR handlers
  const userRef = useRef(null);
  const selectedChatRef = useRef(null);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  // Client-side overrides to prevent polling from wiping delivery/read state
  const [deliveredIds, setDeliveredIds] = useState(new Set());
  const [readIds, setReadIds] = useState(new Set());
  // Ref'ler closure sorununu önlemek için
  const readIdsRef = useRef(new Set());
  const deliveredIdsRef = useRef(new Set());
  const updateUnreadCountsRef = useRef(null);
  
  // readIds ve deliveredIds set'lerini ref'lere de senkronize et
  useEffect(() => {
    readIdsRef.current = readIds;
  }, [readIds]);
  
  useEffect(() => {
    deliveredIdsRef.current = deliveredIds;
  }, [deliveredIds]);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const raw = response.data;
      const normalizedUser = normalizeUserRecord(raw);
      if (normalizedUser) {
        setUser(normalizedUser);
        const normalized = normalizeId(getUserId(normalizedUser));
        if (normalized) setCurrentUserId(normalized);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    let isMounted = true;
    ensureMicRecorder()
      .then((MicRecorderCtor) => {
        if (!isMounted) return;
        const newRecorder = new MicRecorderCtor({ bitRate: 128 });
        setRecorder(newRecorder);
      })
      .catch((error) => {
        console.error('Failed to load mic recorder:', error);
      });

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => console.log("Microphone permission granted"))
      .catch(() => console.log("Microphone access denied"));
    
    fetchUsers();
    fetchGroups();
    fetchAvailableUsers();
    fetchCurrentUser(); // Fetch current user

    // Minimal SignalR for read/delivered updates
    const conn = new HubConnectionBuilder()
      .withUrl(signalRUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        console.log('[ChatPageV2] SignalR connected', { state: conn.state, connectionId: conn.connectionId });
        setConnection(conn);
        setConnectionReady(true);
      })
      .catch((e) => console.warn('SignalR connect failed (ChatPageV2):', e));

    conn.on('MessagesRead', async (payload) => {
      try {
        console.log('[ChatPageV2] ⚡⚡⚡ MessagesRead event received! ⚡⚡⚡', payload);
        console.log('[ChatPageV2] Payload type:', typeof payload, 'Payload keys:', Object.keys(payload || {}));
        console.log('[ChatPageV2] Direct access:', {
          'payload.receiverId': payload?.receiverId,
          'payload.messageIds': payload?.messageIds,
          'payload.readAt': payload?.readAt,
          'payload.ReceiverId': payload?.ReceiverId,
          'payload.MessageIds': payload?.MessageIds,
          'payload.ReadAt': payload?.ReadAt
        });
        
        // Her iki formatı da destekle (PascalCase ve camelCase)
        // SignalR genellikle camelCase formatında gönderir
        const ReceiverId = payload?.receiverId ?? payload?.ReceiverId ?? null;
        const MessageIds = payload?.messageIds ?? payload?.MessageIds ?? null;
        const ReadAt = payload?.readAt ?? payload?.ReadAt ?? null;
        const currentUserObj = userRef.current || user;
        const currentUserId = normalizeId(getUserId(currentUserObj));
        
        console.log('[ChatPageV2] MessagesRead event parsed', { 
          MessageIds, 
          ReceiverId, 
          ReadAt,
          currentUserId,
          userRefCurrent: userRef.current,
          userState: user,
          MessageIdsIsArray: Array.isArray(MessageIds),
          MessageIdsLength: Array.isArray(MessageIds) ? MessageIds.length : 0,
          MessageIdsArray: Array.isArray(MessageIds) ? MessageIds : 'NOT ARRAY',
          readIdsBefore: Array.from(readIdsRef.current)
        });
        
        // Payload'dan direkt okuma (fallback garantisi için)
        // Önce normal parse, sonra direkt access, sonra bracket notation
        let finalMessageIds = MessageIds ?? payload?.messageIds ?? payload?.MessageIds ?? (payload && payload['messageIds']) ?? (payload && payload['MessageIds']) ?? null;
        let finalReceiverId = ReceiverId ?? payload?.receiverId ?? payload?.ReceiverId ?? (payload && payload['receiverId']) ?? (payload && payload['ReceiverId']) ?? null;
        let finalReadAt = ReadAt ?? payload?.readAt ?? payload?.ReadAt ?? (payload && payload['readAt']) ?? (payload && payload['ReadAt']) ?? null;
        
        if (!finalMessageIds && payload) {
          console.warn('[ChatPageV2] Parse failed, trying all access methods');
          // Tüm olası formatları dene
          finalMessageIds = payload.messageIds || payload.MessageIds || payload['messageIds'] || payload['MessageIds'] || null;
          finalReceiverId = payload.receiverId || payload.ReceiverId || payload['receiverId'] || payload['ReceiverId'] || null;
          finalReadAt = payload.readAt || payload.ReadAt || payload['readAt'] || payload['ReadAt'] || null;
          console.log('[ChatPageV2] Direct access result:', {
            finalMessageIds,
            finalReceiverId,
            finalReadAt,
            payloadKeys: Object.keys(payload || {})
          });
        }
        
        // MessageIds varsa, sadece o mesajları güncelle
        if (finalMessageIds && Array.isArray(finalMessageIds) && finalMessageIds.length > 0) {
          const messageIdSet = new Set(finalMessageIds.map(id => String(id)));
          console.log('[ChatPageV2] ✅ MessageIds found! Updating readIds with MessageIds:', Array.from(messageIdSet));
          
          // Önce readIds set'ini güncelle (hem state hem de ref)
          // ÖNEMLİ: ID'leri hem string hem number olarak ekle (eşleşme sorununu önlemek için)
          setReadIds(prev => {
            const s = new Set(prev);
            finalMessageIds.forEach(id => {
              const idStr = String(id);
              const idNum = Number(id);
              // Hem string hem number olarak ekle
              s.add(idStr);
              if (!isNaN(idNum)) {
                s.add(String(idNum));
              }
              readIdsRef.current.add(idStr); // Ref'i de direkt güncelle
              if (!isNaN(idNum)) {
                readIdsRef.current.add(String(idNum)); // Number formatını da ekle
              }
            });
            console.log('[ChatPageV2] ✅ Updated readIds:', Array.from(s));
            console.log('[ChatPageV2] ✅ Updated readIdsRef:', Array.from(readIdsRef.current));
            return s;
          });
          
          // HEMEN badge'i güncelle - tüm kullanıcılar için
          console.log('[ChatPageV2] MessagesRead event: Immediately updating badges');
          const currentUserForBadge = userRef.current || user;
          const currentUserIdForBadgeRaw = getUserId(currentUserForBadge);
          const currentUserIdForBadge = normalizeId(currentUserIdForBadgeRaw);
          
          // Önce kullanıcıları API'den çek (users state'i boş olabilir)
          try {
            const usersResponse = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const usersListForBadge = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            
            console.log('[ChatPageV2] Badge update check:', {
              currentUserIdForBadge,
              usersFromAPI: usersListForBadge.length,
              usersStateLength: users.length,
              availableUsersLength: availableUsers.length
            });
            
            if (currentUserIdForBadge && usersListForBadge.length > 0) {
              console.log('[ChatPageV2] Starting badge updates for', usersListForBadge.length, 'users');
              // Her kullanıcı için badge'i hemen güncelle
              Promise.all(usersListForBadge.map(async (contactUser) => {
                console.log(`[ChatPageV2] Processing badge update for user ${contactUser.id}`);
                try {
                  const msgResponse = await axios.get(`${apiBaseUrl}/Messages/conversation/${contactUser.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const messages = Array.isArray(msgResponse.data) ? msgResponse.data : [];
                  const contactUserIdNormalized = normalizeId(
                    getUserId(contactUser) ?? contactUser?.id ?? contactUser?.userId
                  );
                  
                  // Bu kullanıcıdan bana gelen ve okunmamış mesajları say
                  const fromContactToMe = messages.filter(m => {
                    const senderNormalized = normalizeId(getSenderId(m));
                    const receiverNormalized = normalizeId(getReceiverId(m));
                    return (
                      contactUserIdNormalized &&
                      senderNormalized === contactUserIdNormalized &&
                      currentUserIdForBadge &&
                      receiverNormalized === currentUserIdForBadge
                    );
                  });
                
                  const readIdsArray = Array.from(readIdsRef.current);
                  
                  // Bu kullanıcıdan bana gelen ve OKUNMUŞ mesajları say (readIdsRef kontrolü ile)
                  const readFromContact = fromContactToMe.filter(m => {
                    const isRead = m.IsRead ?? m.isRead ?? false;
                    const msgId = String(m.Id ?? m.id ?? '');
                    const msgIdNum = Number(msgId);
                    
                    // 6 farklı formatta kontrol
                    const check1 = readIdsRef.current.has(msgId);
                    const check2 = readIdsRef.current.has(String(msgIdNum));
                    const check3 = !isNaN(msgIdNum) && readIdsRef.current.has(msgIdNum);
                    const check4 = readIdsArray.some(refId => String(refId) === msgId);
                    const check5 = readIdsArray.some(refId => String(refId) === String(msgIdNum));
                    const check6 = readIdsArray.some(refId => refId === msgIdNum);
                    
                    const isReadFromRef = check1 || check2 || check3 || check4 || check5 || check6;
                    
                    return isRead || isReadFromRef;
                  });
                  
                  // Okunmamış mesaj sayısı = Toplam - Okunmuş
                  const unreadCount = fromContactToMe.length - readFromContact.length;
                  
                  // Detaylı debug log
                  console.log(`[ChatPageV2] MessagesRead: Badge calculation for user ${contactUser.id}`, {
                    totalMessages: messages.length,
                    fromContactToMe: fromContactToMe.length,
                    readFromContact: readFromContact.length,
                    unreadCount,
                    readIdsRefSize: readIdsRef.current.size,
                    readIdsRefArray: readIdsArray,
                    sampleMessages: fromContactToMe.slice(0, 5).map(m => {
                      const msgId = String(m.Id ?? m.id ?? '');
                      const msgIdNum = Number(msgId);
                      const isRead = m.IsRead ?? m.isRead ?? false;
                      const check1 = readIdsRef.current.has(msgId);
                      const check2 = readIdsRef.current.has(String(msgIdNum));
                      const check3 = !isNaN(msgIdNum) && readIdsRef.current.has(msgIdNum);
                      const check4 = readIdsArray.some(refId => String(refId) === msgId);
                      const check5 = readIdsArray.some(refId => String(refId) === String(msgIdNum));
                      const check6 = readIdsArray.some(refId => refId === msgIdNum);
                      return {
                        id: m.Id ?? m.id,
                        idStr: msgId,
                        idNum: msgIdNum,
                        isRead,
                        checks: { check1, check2, check3, check4, check5, check6 },
                        isReadFromRef: check1 || check2 || check3 || check4 || check5 || check6,
                        finalIsRead: isRead || (check1 || check2 || check3 || check4 || check5 || check6),
                        counted: !(isRead || (check1 || check2 || check3 || check4 || check5 || check6))
                      };
                    })
                  });
                  
                  // Badge'i güncelle
                  setUnreadCounts(prev => {
                    const updated = { ...prev };
                    updated[contactUser.id] = unreadCount;
                    console.log(`[ChatPageV2] ✅ Badge updated for user ${contactUser.id}: ${unreadCount} (prev: ${prev[contactUser.id] || 0})`);
                    return updated;
                  });
              } catch (err) {
                console.error(`Error updating badge for user ${contactUser.id}:`, err);
              }
              })).then(() => {
                console.log('[ChatPageV2] ✅ All badge updates completed');
              }).catch(err => {
                console.error('[ChatPageV2] ❌ Error in badge updates:', err);
              });
            } else {
              console.warn('[ChatPageV2] ⚠️ Badge update skipped:', {
                hasCurrentUserId: !!currentUserIdForBadge,
                hasUsersList: usersListForBadge.length > 0,
                usersFromAPI: usersListForBadge.length
              });
            }
          } catch (usersErr) {
            console.error('[ChatPageV2] ❌ Error fetching users for badge update:', usersErr);
          }
          
        // Sonra mesajları güncelle
        // Not: currentUserId undefined olabilir, bu yüzden senderId kontrolünü skip ediyoruz
        // Sadece MessageIds set'indeki tüm mesajları güncelle
        const currentUserIdNormalizedLocal = currentUserIdForBadge;
        const currentUserIdRawLocal = currentUserIdForBadgeRaw;
        setMessages(prev => {
          const updated = prev.map(m => {
            const msgId = String(m.id ?? m.Id);
            if (!messageIdSet.has(msgId)) {
              return normalizeMessageRecord(m);
            }
            
            const msgSenderIdRaw = getSenderId(m);
            const msgSenderIdNormalized = normalizeId(msgSenderIdRaw);
            
            // currentUserId undefined ise tüm mesajları güncelle
            // currentUserId varsa sadece kendi mesajlarımızı güncelle
            const shouldUpdate =
              !currentUserIdNormalizedLocal ||
              (msgSenderIdNormalized && msgSenderIdNormalized === currentUserIdNormalizedLocal);
            
            if (shouldUpdate) {
              console.log('[ChatPageV2] ✅ Marking message as read:', msgId, { 
                msgSenderId: msgSenderIdRaw, 
                currentUserId: currentUserIdRawLocal,
                finalReceiverId,
                shouldUpdate
              });
              return normalizeMessageRecord({ 
                ...m, 
                IsRead: true, 
                isRead: true, 
                ReadAt: finalReadAt || m.ReadAt || m.readAt || new Date().toISOString() 
              });
            }
            return normalizeMessageRecord(m);
          });
          
          const updatedReadMessages = updated.filter(m => {
            const msgId = String(m.id ?? m.Id);
            return messageIdSet.has(msgId);
          });
          
          console.log('[ChatPageV2] ✅ Updated messages count:', updatedReadMessages.length);
          console.log('[ChatPageV2] ✅ Updated messages:', updatedReadMessages.map(m => ({ 
            id: m.id ?? m.Id, 
            IsRead: m.IsRead, 
            isRead: m.isRead 
          })));
          
          // Unread count'u güncelle (mesajlar okundu)
          // Bu event benim gönderdiğim mesajların okunduğunu bildiriyor
          // Ama badge'de gösterdiğimiz: Bana gelen okunmamış mesajlar
          // Sorun: readIdsRef güncelleniyor ama badge yeniden hesaplanmıyor
          // Çözüm: İlgili kullanıcı için badge'i yeniden hesapla
          
          // finalReceiverId = mesajları okuyan kişi (mesajları gönderdiğim kişi)
          // Eğer finalReceiverId benim id'im ise, bu mesajları ben gönderdim demektir
          // Bu durumda badge'de bir değişiklik olmaz çünkü badge bana gelen mesajları gösteriyor
          // Ama eğer başka bir kullanıcıdan bana gelen mesajlar okunmuşsa, badge'i güncelle
          
          // Badge güncellemesi yukarıda yapılıyor (readIdsRef güncellendikten HEMEN SONRA)
          
          return updated.map(normalizeMessageRecord);
        });
        } else {
          // Eski format için (ReceiverId ile)
        const currentUser = userRef.current || user;
        const currentUserIdNormalized = normalizeId(getUserId(currentUser));
          setMessages(prev => {
            const messageIdsToMark = [];
            const updated = prev.map(m => {
            const sIdNormalized = normalizeId(getSenderId(m));
            const rIdNormalized = normalizeId(getReceiverId(m));
            const receiverNormalized = normalizeId(ReceiverId);
            if (
              currentUserIdNormalized &&
              sIdNormalized === currentUserIdNormalized &&
              rIdNormalized &&
              receiverNormalized &&
              rIdNormalized === receiverNormalized
            ) {
                const msgId = String(m.id ?? m.Id);
                messageIdsToMark.push(msgId);
                readIdsRef.current.add(msgId); // Ref'i de direkt güncelle
                return normalizeMessageRecord({ ...m, IsRead: true, isRead: true, ReadAt: ReadAt || m.ReadAt || m.readAt || new Date().toISOString() });
              }
              return normalizeMessageRecord(m);
            });
            // readIds set'ini güncelle (hem state hem de ref)
            if (messageIdsToMark.length > 0) {
              setReadIds(prev => {
                const s = new Set(prev);
                messageIdsToMark.forEach(id => {
                  s.add(id);
                  readIdsRef.current.add(id); // Ref'i de direkt güncelle
                });
                console.log('[ChatPageV2] Updated readIds (old format):', Array.from(s));
                return s;
              });
            }
            return updated.map(normalizeMessageRecord);
          });
        }
      } catch (err) {
        console.error('[ChatPageV2] Error handling MessagesRead:', err);
      }
    });

    conn.on('MessageRead', (payload) => {
      try {
        const { MessageId, ReadAt } = payload || {};
        if (!MessageId) return;
        console.log('[ChatPageV2] MessageRead event', payload);
        const msgIdStr = String(MessageId);
        setReadIds(prev => { 
          const s = new Set(prev); 
          s.add(msgIdStr);
          readIdsRef.current.add(msgIdStr); // Ref'i de direkt güncelle
          return s; 
        });
        setMessages(prev => prev.map(m => {
          if (String(m.id ?? m.Id) === msgIdStr) {
            return normalizeMessageRecord({ ...m, IsRead: true, isRead: true, ReadAt: ReadAt || m.ReadAt || m.readAt });
          }
          return normalizeMessageRecord(m);
        }));
      } catch {}
    });

    // ReceiveMessage echo: when I send via API, backend also broadcasts; use it to mark delivered/read
    conn.on('ReceiveMessage', (messageData) => {
      try {
        const normalizedIncoming = normalizeMessageRecord(messageData || {});
        const currentUser = userRef.current || user;
        const currentUserIdNormalized = normalizeId(getUserId(currentUser));
        const incomingSenderIdRaw = getSenderId(normalizedIncoming);
        const incomingReceiverIdRaw = getReceiverId(normalizedIncoming);
        const incomingSenderIdNormalized = normalizeId(incomingSenderIdRaw);
        const incomingReceiverIdNormalized = normalizeId(incomingReceiverIdRaw);
        console.log('[ChatPageV2] ReceiveMessage', {
          id: normalizedIncoming?.id,
          senderId: incomingSenderIdRaw,
          receiverId: incomingReceiverIdRaw,
          isDelivered: normalizedIncoming?.IsDelivered ?? normalizedIncoming?.isDelivered,
          isRead: normalizedIncoming?.IsRead ?? normalizedIncoming?.isRead,
          currentUserId: currentUserIdNormalized
        });
        // If this echo is my message, update local message flags
        if (currentUserIdNormalized && incomingSenderIdNormalized === currentUserIdNormalized) {
          setMessages(prev => {
            let updated = false;
            let next = prev.map(existing => {
              const normalizedExisting = normalizeMessageRecord(existing);
              const existingSenderIdNormalized = normalizeId(getSenderId(normalizedExisting));
              const existingReceiverIdNormalized = normalizeId(getReceiverId(normalizedExisting));
              const samePair =
                existingSenderIdNormalized &&
                existingReceiverIdNormalized &&
                existingSenderIdNormalized === incomingSenderIdNormalized &&
                existingReceiverIdNormalized === incomingReceiverIdNormalized;
              const sameContent = (normalizedExisting.content || '') === (normalizedIncoming.content || '');
              if (!updated && samePair && sameContent) {
                updated = true;
                return normalizeMessageRecord({
                  ...normalizedExisting,
                  id: normalizedIncoming.id ?? normalizedExisting.id,
                  Id: normalizedIncoming.id ?? normalizedExisting.Id,
                  IsDelivered: normalizedIncoming.IsDelivered ?? normalizedIncoming.isDelivered ?? true,
                  isDelivered: normalizedIncoming.IsDelivered ?? normalizedIncoming.isDelivered ?? true,
                  IsRead: normalizedIncoming.IsRead ?? normalizedIncoming.isRead ?? normalizedExisting.IsRead ?? normalizedExisting.isRead ?? false,
                  isRead: normalizedIncoming.IsRead ?? normalizedIncoming.isRead ?? normalizedExisting.IsRead ?? normalizedExisting.isRead ?? false,
                  ReadAt: normalizedIncoming.ReadAt ?? normalizedIncoming.readAt ?? normalizedExisting.ReadAt ?? normalizedExisting.readAt ?? null,
                  timestamp: normalizedIncoming.timestamp ?? normalizedIncoming.sentAt ?? normalizedExisting.timestamp
                });
              }
              return normalizedExisting;
            });
            if (!updated) {
              for (let i = next.length - 1; i >= 0; i--) {
                const m = next[i];
                const existingSenderIdNormalized = normalizeId(getSenderId(m));
                const existingReceiverIdNormalized = normalizeId(getReceiverId(m));
                const samePair =
                  existingSenderIdNormalized &&
                  existingReceiverIdNormalized &&
                  existingSenderIdNormalized === incomingSenderIdNormalized &&
                  existingReceiverIdNormalized === incomingReceiverIdNormalized;
                if (samePair) {
                  next = next.map((msg, idx) =>
                    idx === i
                      ? normalizeMessageRecord({ ...msg, IsDelivered: true, isDelivered: true })
                      : normalizeMessageRecord(msg)
                  );
                  updated = true;
                  break;
                }
              }
            }
            return next.map(normalizeMessageRecord);
          });
          if (normalizedIncoming?.id !== undefined && normalizedIncoming?.id !== null) {
            const msgIdStr = String(normalizedIncoming.id);
            setDeliveredIds(prev => { 
              const s = new Set(prev); 
              s.add(msgIdStr);
              deliveredIdsRef.current.add(msgIdStr); // Ref'i de direkt güncelle
              return s; 
            });
          }
          
          // Son mesaj zamanını güncelle (mesaj geldiğinde veya gönderildiğinde)
          const msgTimestamp = normalizedIncoming?.timestamp ?? normalizedIncoming?.Timestamp ?? normalizedIncoming?.sentAt;
          if (msgTimestamp && selectedChat?.id) {
            const msgTime = new Date(msgTimestamp).getTime();
            if (msgTime > 0) {
              setLastMessageTimes(prev => {
                const updated = { ...prev };
                // Mesajı gönderen veya alan kişinin ID'sini bul
                const otherUserId =
                  incomingSenderIdNormalized === currentUserIdNormalized
                    ? incomingReceiverIdRaw
                    : incomingSenderIdRaw;
                if (otherUserId) {
                  updated[otherUserId] = msgTime;
                }
                return updated;
              });
            }
          }
        }
      } catch {}
    });

    return () => {
      isMounted = false;
      try { conn.stop(); } catch {}
    };
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/Followers/messaging-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Users data from API:', response.data);
      console.log('First user example:', response.data?.[0]);
      const usersList = response.data || [];
      setUsers(usersList);
      
      // Current user'ı al (bir kere)
      let currentUser = null;
      try {
        const userResponse = await axios.get(`${apiBaseUrl}/Users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        currentUser = userResponse.data;
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
      
      // Her kullanıcı için okunmamış mesaj sayısını ve son mesaj tarihini hesapla
      const counts = {};
      const lastTimes = {};
      
      if (currentUser) {
        await Promise.all(usersList.map(async (contactUser) => {
          try {
            const msgResponse = await axios.get(`${apiBaseUrl}/Messages/conversation/${contactUser.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const messages = Array.isArray(msgResponse.data) ? msgResponse.data : [];
            
            // Son mesaj tarihini bul (en son mesajlaştığın zaman)
            let lastMessageTime = 0;
            if (messages.length > 0) {
              messages.forEach(m => {
                const msgTime = new Date(m.timestamp ?? m.Timestamp ?? 0).getTime();
                if (msgTime > lastMessageTime) {
                  lastMessageTime = msgTime;
                }
              });
            }
            lastTimes[contactUser.id] = lastMessageTime;
            
            // Bu kullanıcıdan bana gelen ve OKUNMAMIŞ (read: false) mesajları say
            // ÖNEMLİ: Sadece contactUser'dan bana (currentUser) gelen mesajları say, benim gönderdiğim mesajları sayma!
            // Sadece IsRead: false olan mesajları say (okunmamış mesajlar)
            const contactUserIdNormalized = normalizeId(
              contactUser?.id ?? contactUser?.userId ?? contactUser?.Id ?? contactUser?.UserId
            );
            const currentUserIdNormalized = normalizeId(getUserId(currentUser));

            const unreadMessages = messages.filter(m => {
              const senderIdNormalized = normalizeId(getSenderId(m));
              const receiverIdNormalized = normalizeId(getReceiverId(m));
              const isRead = m.IsRead ?? m.isRead ?? false;
              const msgId = String(m.Id ?? m.id ?? '');
              
              // Kontrol 1: Bu kullanıcıdan (contactUser) bana (currentUser) gelen mesajlar mı?
              // Yani senderId === contactUser.id VE receiverId === currentUser.id
              // ÖNEMLİ: Benim gönderdiğim mesajları (senderId === currentUser.id) sayma!
              const isFromContactToMe =
                contactUserIdNormalized &&
                currentUserIdNormalized &&
                senderIdNormalized === contactUserIdNormalized &&
                receiverIdNormalized === currentUserIdNormalized;
              
              if (!isFromContactToMe) {
                // Bu mesaj bana gönderilmiş değil veya ben gönderdim, sayma
                return false;
              }
              
              // Kontrol 2: Mesaj okunmamış mı? (IsRead: false)
              // readIdsRef'te varsa zaten okunmuş demektir (sayma)
              // Daha sağlam kontrol: hem Set.has() hem de array.includes() kullan
              const msgIdNum = Number(msgId);
              const readIdsArray = Array.from(readIdsRef.current);
              
              const isReadFromRef1 = readIdsRef.current.has(msgId);
              const isReadFromRef2 = readIdsRef.current.has(String(msgIdNum));
              const isReadFromRef3 = !isNaN(msgIdNum) && readIdsRef.current.has(msgIdNum);
              const isReadFromRef4 = readIdsArray.some(refId => String(refId) === msgId);
              const isReadFromRef5 = readIdsArray.some(refId => String(refId) === String(msgIdNum));
              const isReadFromRef6 = readIdsArray.some(refId => refId === msgIdNum);
              
              const isReadFromRef = isReadFromRef1 || isReadFromRef2 || isReadFromRef3 || 
                                    isReadFromRef4 || isReadFromRef5 || isReadFromRef6;
              
              // SADECE okunmamış mesajları say (IsRead: false VE readIdsRef'te yok)
              const isReadStatus = isRead || isReadFromRef;
              const isUnread = !isReadStatus;
              
              return isUnread;
            });
            
            const unreadCount = unreadMessages.length;
            
            // Debug: Detaylı log (her zaman göster)
            const fromContactToMe = messages.filter(m => {
              const senderNormalized = normalizeId(getSenderId(m));
              const receiverNormalized = normalizeId(getReceiverId(m));
              return (
                contactUserIdNormalized &&
                currentUserIdNormalized &&
                senderNormalized === contactUserIdNormalized &&
                receiverNormalized === currentUserIdNormalized
              );
            });
            
            // Okunmuş mesajları say: API'den gelen IsRead değeri VE readIdsRef kontrolü
            // ÖNEMLİ: Hem büyük hem küçük harfli property'leri kontrol et
            const readFromContact = fromContactToMe.filter(m => {
              // Hem IsRead hem isRead property'lerini kontrol et
              const isReadUpper = m.IsRead === true;
              const isReadLower = m.isRead === true;
              const isRead = isReadUpper || isReadLower;
              
              const msgId = String(m.Id ?? m.id ?? '');
              
              // DEBUG: Her mesajın IsRead durumunu log'la
              if (fromContactToMe.length <= 10) {
                console.log(`[ChatPageV2] Checking message ${msgId} for user ${contactUser.id}:`, {
                  id: m.Id ?? m.id,
                  IsRead: m.IsRead,
                  isRead: m.isRead,
                  isReadUpper,
                  isReadLower,
                  finalIsRead: isRead
                });
              }
              
              // Eğer API'den IsRead: true geliyorsa direkt okunmuş say
              if (isRead) {
                return true;
              }
              
              // API'den IsRead: false geliyorsa readIdsRef'te var mı kontrol et
              const msgIdNum = Number(msgId);
              const readIdsArray = Array.from(readIdsRef.current);
              
              // 6 farklı formatta kontrol
              const check1 = readIdsRef.current.has(msgId);
              const check2 = readIdsRef.current.has(String(msgIdNum));
              const check3 = !isNaN(msgIdNum) && readIdsRef.current.has(msgIdNum);
              const check4 = readIdsArray.some(refId => String(refId) === msgId);
              const check5 = readIdsArray.some(refId => String(refId) === String(msgIdNum));
              const check6 = readIdsArray.some(refId => refId === msgIdNum);
              
              const isReadFromRef = check1 || check2 || check3 || check4 || check5 || check6;
              
              // Okunmuş = IsRead: true VEYA readIdsRef'te var
              return isReadFromRef;
            });
            
            // Debug: readIdsRef kontrolünü detaylı test et
            const readIdsRefArray = Array.from(readIdsRef.current);
            const sampleMessages = fromContactToMe.slice(0, 10).map(m => {
              const msgId = String(m.Id ?? m.id ?? '');
              const msgIdNum = Number(msgId);
              const isRead = m.IsRead ?? m.isRead ?? false;
              
              // Tüm olası ID formatlarını kontrol et
              const check1 = readIdsRef.current.has(msgId);
              const check2 = readIdsRef.current.has(String(msgIdNum));
              const check3 = readIdsRef.current.has(msgIdNum);
              const check4 = msgIdNum && readIdsRef.current.has(String(msgIdNum));
              const check5 = readIdsRefArray.includes(msgId);
              const check6 = readIdsRefArray.includes(String(msgIdNum));
              
              const isReadFromRef = check1 || check2 || check3 || check4 || check5 || check6;
              
              return {
                id: m.Id ?? m.id,
                idType: typeof (m.Id ?? m.id),
                idStr: msgId,
                idNum: msgIdNum,
                isRead,
                checks: { check1, check2, check3, check4, check5, check6 },
                isReadFromRef,
                finalIsRead: isRead || isReadFromRef,
                counted: !(isRead || isReadFromRef),
                inReadIdsArray: readIdsRefArray.some(refId => String(refId) === msgId || String(refId) === String(msgIdNum) || refId === msgIdNum)
              };
            });
            
            // ÖNEMLİ: Badge sadece okunmamış mesajları göstermeli
            // readFromContact: read olarak algılanan mesajlar
            // actualUnreadCount: okunmamış mesajlar (fromContactToMe - readFromContact)
            const actualUnreadCount = fromContactToMe.length - readFromContact.length;
            
            // DETAYLI DEBUG: Her mesajın durumunu kontrol et
            const messageDetails = fromContactToMe.map(m => {
              const msgId = String(m.Id ?? m.id ?? '');
              const msgIdNum = Number(msgId);
              const isRead = m.IsRead ?? m.isRead ?? false;
              const readAt = m.ReadAt ?? m.readAt ?? null;
              
              // ReadAt varsa mesaj okunmuş say (backend IsRead döndürmüyor olsa bile)
              const isReadFromReadAt = !!readAt;
              
              const readIdsArray = Array.from(readIdsRef.current);
              
              // 6 farklı formatta kontrol
              const check1 = readIdsRef.current.has(msgId);
              const check2 = readIdsRef.current.has(String(msgIdNum));
              const check3 = !isNaN(msgIdNum) && readIdsRef.current.has(msgIdNum);
              const check4 = readIdsArray.some(refId => String(refId) === msgId);
              const check5 = readIdsArray.some(refId => String(refId) === String(msgIdNum));
              const check6 = readIdsArray.some(refId => refId === msgIdNum);
              
              const isReadFromRef = check1 || check2 || check3 || check4 || check5 || check6;
              
              // Final read durumu: IsRead VEYA ReadAt VEYA readIdsRef'te var
              const finalIsRead = isRead || isReadFromReadAt || isReadFromRef;
              
              return {
                id: m.Id ?? m.id,
                idStr: msgId,
                idNum: msgIdNum,
                isRead,
                readAt,
                isReadFromReadAt,
                checks: { check1, check2, check3, check4, check5, check6 },
                isReadFromRef,
                finalIsRead,
                isUnread: !finalIsRead
              };
            });
            
            // DETAYLI LOG: Her mesajın durumunu göster
            console.log(`[ChatPageV2] ════════════════════════════════════════════════════════`);
            console.log(`[ChatPageV2] Unread calculation for user ${contactUser.id}:`);
            console.log(`[ChatPageV2] Total messages: ${messages.length}`);
            console.log(`[ChatPageV2] From contact to me: ${fromContactToMe.length}`);
            console.log(`[ChatPageV2] Read from contact (old method): ${readFromContact.length}`);
            console.log(`[ChatPageV2] readIdsRef size: ${readIdsRef.current.size}`);
            console.log(`[ChatPageV2] readIdsRef array:`, Array.from(readIdsRef.current));
            
            // YENİ YÖNTEM: messageDetails'ten direkt okunmamış mesajları say
            // ÖNEMLİ: Hem IsRead hem readIdsRef kontrolü yapılıyor
            const unreadFromDetails = messageDetails.filter(msg => {
              // Mesaj okunmamış ise true döndür (isUnread: true)
              const isUnread = msg.isUnread === true;
              
              // DEBUG: Her mesajın durumunu log'la
              if (messageDetails.length <= 10) {
                console.log(`[ChatPageV2]   Checking message ${msg.idStr}:`, {
                  id: msg.id,
                  idStr: msg.idStr,
                  isRead: msg.isRead,
                  isReadFromRef: msg.isReadFromRef,
                  finalIsRead: msg.finalIsRead,
                  isUnread: msg.isUnread,
                  willBeCounted: isUnread
                });
              }
              
              return isUnread;
            });
            const finalUnreadCount = unreadFromDetails.length;
            
            console.log(`[ChatPageV2] Message details (${messageDetails.length} messages):`);
            messageDetails.forEach((msg, idx) => {
              console.log(`[ChatPageV2]   Message ${idx + 1} (ID: ${msg.id}):`, {
                idStr: msg.idStr,
                idNum: msg.idNum,
                isRead: msg.isRead,
                readAt: msg.readAt,
                isReadFromReadAt: msg.isReadFromReadAt,
                isReadFromRef: msg.isReadFromRef,
                finalIsRead: msg.finalIsRead,
                isUnread: msg.isUnread,
                checks: msg.checks
              });
            });
            
            console.log(`[ChatPageV2] Unread messages from details: ${unreadFromDetails.length}`);
            console.log(`[ChatPageV2] Old actualUnreadCount: ${actualUnreadCount}`);
            console.log(`[ChatPageV2] New finalUnreadCount: ${finalUnreadCount}`);
            console.log(`[ChatPageV2] ════════════════════════════════════════════════════════`);
            
            // Badge'i güncelle - messageDetails'ten direkt okunmamış mesajları say
            counts[contactUser.id] = finalUnreadCount;
          } catch (err) {
            console.error(`Error fetching unread count for user ${contactUser.id}:`, err);
            counts[contactUser.id] = 0;
            lastTimes[contactUser.id] = 0;
          }
        }));
      }
      
      setUnreadCounts(counts);
      setLastMessageTimes(lastTimes);
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
      console.log('[ChatPageV2] fetchUserMessages called', { userId, readIdsRefSize: readIdsRef.current.size, deliveredIdsRefSize: deliveredIdsRef.current.size });
      const response = await axios.get(`${apiBaseUrl}/Messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = Array.isArray(response.data) ? response.data : [];
      console.log('[ChatPageV2] fetchUserMessages response', { listLength: list.length, readIdsRefSize: readIdsRef.current.size });
      // Mevcut mesajları koru (SignalR event'lerinden gelen güncellemeleri kaybetmemek için)
      setMessages(prev => {
        console.log('[ChatPageV2] fetchUserMessages prev messages count', prev.length);
        const prevNormalized = prev.map(normalizeMessageRecord);
        const prevMap = new Map();
        prevNormalized.forEach(m => {
          const idRaw = m.id ?? m.Id;
          const idStrNormalized = normalizeId(idRaw);
          const idStr = idStrNormalized ?? (idRaw !== undefined && idRaw !== null ? String(idRaw) : null);
          if (idStr && idStr !== 'undefined' && idStr !== 'null') {
            prevMap.set(idStr, m);
          }
        });

        const normalizedList = list.map(normalizeMessageRecord);

        const merged = normalizedList.map(m => {
          const readAt = m.ReadAt ?? m.readAt ?? null;
          const isReadFromApi = (m.IsRead ?? m.isRead) || !!readAt;
          const isDeliveredFromApi = (m.IsDelivered ?? m.isDelivered) || isReadFromApi; // read implies delivered
          const idAny = m.Id ?? m.id;
          const idStrNormalized = normalizeId(idAny);
          const idStr = idStrNormalized ?? (idAny !== undefined && idAny !== null ? String(idAny) : null);
          if (!idStr) {
            return normalizeMessageRecord({
              ...m,
              IsDelivered: isDeliveredFromApi,
              IsRead: isReadFromApi,
              ReadAt: readAt,
            });
          }

          // SignalR event'lerinden gelen güncellemeleri önceliklendir (readIds/deliveredIds set'inden)
          // Ref'leri kullanarak güncel değerleri al (closure sorununu önlemek için)
          const isReadFromSet = readIdsRef.current.has(idStr);
          const isDeliveredFromSet = deliveredIdsRef.current.has(idStr);

          // Eğer mevcut mesajda SignalR event'lerinden gelen read/delivered bilgisi varsa, onu koru
          const existingMsg = prevMap.get(idStr);

          // ÖNCELİK: readIds set'indeyse kesinlikle read olmalı (en önemli kontrol!)
          let finalIsRead = false;
          let finalIsDelivered = false;

          if (isReadFromSet) {
            // readIds set'indeyse kesinlikle read ve delivered olmalı
            finalIsRead = true;
            finalIsDelivered = true;
            console.log('[ChatPageV2] fetchUserMessages: Message in readIds set', { idStr, finalIsRead, finalIsDelivered });
          } else if (isDeliveredFromSet) {
            // deliveredIds set'indeyse delivered olmalı ama read değil
            finalIsDelivered = true;
            finalIsRead = (existingMsg?.IsRead ?? existingMsg?.isRead ?? false) || !!isReadFromApi;
          } else {
            // Set'lerde yoksa, mevcut mesajın değerini koru veya API'den gelen değeri kullan
            finalIsRead = (existingMsg?.IsRead ?? existingMsg?.isRead ?? false) || !!isReadFromApi;
            finalIsDelivered = (existingMsg?.IsDelivered ?? existingMsg?.isDelivered ?? false) || !!isDeliveredFromApi;
          }

          return normalizeMessageRecord({
            ...m,
            // SignalR event'lerinden gelen güncellemeleri önceliklendir
            IsDelivered: finalIsDelivered,
            IsRead: finalIsRead,
            ReadAt: readAt || existingMsg?.ReadAt || existingMsg?.readAt || null,
          });
        });

        // Yeni mesajları ekle veya mevcut mesajları güncelle
        const finalMap = new Map();
        merged.forEach(newMsg => {
          const idRaw = newMsg.id ?? newMsg.Id;
          const idStrNormalized = normalizeId(idRaw);
          const idStr = idStrNormalized ?? (idRaw !== undefined && idRaw !== null ? String(idRaw) : null);
          if (idStr && idStr !== 'undefined' && idStr !== 'null') {
            finalMap.set(idStr, normalizeMessageRecord(newMsg));
          }
        });

        // Mevcut mesajlardan yeni listede olmayanları da ekle (eğer readIds set'indeyse koru)
        prevNormalized.forEach(existingMsg => {
          const idRaw = existingMsg.id ?? existingMsg.Id;
          const idStrNormalized = normalizeId(idRaw);
          const idStr = idStrNormalized ?? (idRaw !== undefined && idRaw !== null ? String(idRaw) : null);
          if (idStr && idStr !== 'undefined' && idStr !== 'null' && !finalMap.has(idStr)) {
            // Eğer readIds set'indeyse, mesajı koru (silme)
            if (readIdsRef.current.has(idStr) || deliveredIdsRef.current.has(idStr)) {
              finalMap.set(idStr, normalizeMessageRecord(existingMsg));
            }
          }
        });

        // Timestamp'e göre sırala
        const sorted = Array.from(finalMap.values()).sort((a, b) => {
          const timeA = new Date(a.timestamp ?? a.Timestamp ?? 0).getTime();
          const timeB = new Date(b.timestamp ?? b.Timestamp ?? 0).getTime();
          return timeA - timeB;
        });

        const normalizedSorted = sorted.map(normalizeMessageRecord);

        // ÖNEMLİ: Chat açıldığında, bu kullanıcıdan bana gelen mesajların ID'lerini readIdsRef'e ekle
        // Bu, backend henüz güncellemese bile badge'i hemen günceller
        const currentUser = userRef.current || user;
        if (currentUser && userId && normalizedSorted.length > 0) {
          const currentUserIdNormalized = normalizeId(getUserId(currentUser));
          const targetUserIdNormalized = normalizeId(userId);
          // Bu kullanıcıdan (userId) bana (currentUser) gelen mesajları bul
          const fromUserToMe = normalizedSorted.filter(m => {
            const senderIdNormalized = normalizeId(getSenderId(m));
            const receiverIdNormalized = normalizeId(getReceiverId(m));
            return (
              senderIdNormalized === targetUserIdNormalized &&
              receiverIdNormalized === currentUserIdNormalized
            );
          });
          
          // Bu mesajların ID'lerini readIdsRef'e ekle
          if (fromUserToMe.length > 0) {
            const messageIdsToAdd = fromUserToMe
              .map(m => String(m.Id ?? m.id))
              .filter(id => id && id !== 'undefined' && id !== 'null');
            
            if (messageIdsToAdd.length > 0) {
              console.log('[ChatPageV2] fetchUserMessages: Adding message IDs to readIdsRef', { 
                userId, 
                messageIds: messageIdsToAdd,
                count: messageIdsToAdd.length,
                currentUserId: currentUser.id
              });
              
              let addedCount = 0;
              messageIdsToAdd.forEach(id => {
                if (!readIdsRef.current.has(id)) {
                  readIdsRef.current.add(id);
                  addedCount++;
                }
              });
              
              if (addedCount > 0) {
                console.log('[ChatPageV2] fetchUserMessages: Added', addedCount, 'new message IDs to readIdsRef');
                
                // readIds state'ini de güncelle
                setReadIds(prev => {
                  const s = new Set(prev);
                  messageIdsToAdd.forEach(id => s.add(id));
                  return s;
                });
                
                // Badge'leri hemen güncelle (eğer updateUnreadCounts fonksiyonu varsa)
                if (updateUnreadCountsRef.current) {
                  setTimeout(() => {
                    updateUnreadCountsRef.current();
                  }, 100);
                }
              }
            }
          }
        }
        
        // Debug: readIds set'indeki mesajların IsRead değerlerini kontrol et
        normalizedSorted.forEach(msg => {
          const msgIdStr = String(msg.id ?? msg.Id);
          if (readIdsRef.current.has(msgIdStr)) {
            console.log('[ChatPageV2] fetchUserMessages: Message should be read', { 
              id: msgIdStr, 
              IsRead: msg.IsRead, 
              isRead: msg.isRead,
              inReadIdsSet: true 
            });
          }
        });
        
        return normalizedSorted;
      });
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
      const list = Array.isArray(response.data) ? response.data.map(normalizeMessageRecord) : [];
      setMessages(list);
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };

  const handleSelectUser = async (contactUser) => {
    setSelectedChat(contactUser);
    setChatType('user');
    
    // ÖNEMLİ: Chat açıldığında, bu kullanıcıdan bana gelen mesajların ID'lerini readIdsRef'e ekle
    // Bu, backend henüz güncellemese bile badge'i hemen günceller
    try {
      const currentUser = userRef.current || user;
      const currentUserIdNormalized = normalizeId(getUserId(currentUser));
      const selectedUserIdNormalized = normalizeId(getUserId(contactUser) ?? contactUser?.id);
      console.log('[ChatPageV2] handleSelectUser: Adding messages to readIdsRef', {
        selectedUserId: contactUser.id,
        currentUserId: currentUser?.id,
        userRefCurrent: userRef.current,
        userState: user
      });
      if (currentUserIdNormalized) {
        const msgResponse = await axios.get(`${apiBaseUrl}/Messages/conversation/${contactUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const messages = Array.isArray(msgResponse.data) ? msgResponse.data : [];
        
        // Bu kullanıcıdan (user) bana (currentUser) gelen mesajları bul
        const fromUserToMe = messages.filter(m => {
          const senderIdNormalized = normalizeId(getSenderId(m));
          const receiverIdNormalized = normalizeId(getReceiverId(m));
          return (
            senderIdNormalized === selectedUserIdNormalized &&
            receiverIdNormalized === currentUserIdNormalized
          );
        });
        
        // Bu mesajların ID'lerini readIdsRef'e ekle
        if (fromUserToMe.length > 0) {
          const messageIdsToAdd = fromUserToMe.map(m => String(m.Id ?? m.id)).filter(id => id && id !== 'undefined' && id !== 'null');
          console.log('[ChatPageV2] Adding message IDs to readIdsRef on chat open', { 
            userId: contactUser.id, 
            messageIds: messageIdsToAdd,
            count: messageIdsToAdd.length
          });
          
          setReadIds(prev => {
            const s = new Set(prev);
            messageIdsToAdd.forEach(id => {
              s.add(id);
              readIdsRef.current.add(id);
            });
            return s;
          });
        }
      }
    } catch (err) {
      console.error('[ChatPageV2] Error marking messages as read on chat open:', err);
    }
    
    fetchUserMessages(contactUser.id);
    
    // Unread count'u sıfırla (chat açıldığında)
    setUnreadCounts(prev => {
      const updated = { ...prev };
      updated[contactUser.id] = 0;
      return updated;
    });
    
    // Mark read / delivered when opening the chat
    try {
      if (enableHubMarking && connectionReady && connection && connection.state === 'Connected') {
        console.log('[ChatPageV2] Invoking mark calls on select user', { userId: contactUser.id });
        connection.invoke('MarkMessagesAsRead', contactUser.id).catch((e) => console.warn('MarkMessagesAsRead failed', e));
        connection.invoke('MarkConversationAsDelivered', contactUser.id).catch((e) => console.warn('MarkConversationAsDelivered failed', e));
      } else {
        console.log('[ChatPageV2] Deferring mark read/delivered until connection is ready');
      }
      // REST fallback to mark read if hub method is unavailable
      axios.post(`${apiBaseUrl}/Messages/mark-read/${contactUser.id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => fetchUserMessages(contactUser.id))
        .catch(() => {});
    } catch (e) { console.warn('Mark invocations error', e); }
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

  useEffect(() => {
    if (!pendingUserId) return;
    if (!Array.isArray(users) || users.length === 0) return;
    const matchedUser = users.find((u) => String(u.id) === String(pendingUserId));
    if (matchedUser) {
      handleSelectUser(matchedUser);
      setPendingUserId(null);
      if (location.state?.targetUserId || location.search) {
        navigate('/chatpage', { replace: true, state: {} });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUserId, users]);

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
        const senderRaw = getUserId(user) ?? user?.id;
        const receiverRaw = selectedChat.id;
        const messagePayload = {
          senderId: senderRaw,
          SenderId: senderRaw,
          receiverId: receiverRaw,
          ReceiverId: receiverRaw,
          content: newMessage.trim(),
          mediaUrl: fileUrl,
          mediaType: mediaType,
          timestamp: new Date().toISOString()
        };

        if (connectionReady && connection && connection.state === 'Connected') {
          // Prefer SignalR so delivery (✓✓) çalışsın
          console.log('[ChatPageV2] Invoking SendMessage via SignalR', { to: selectedChat.id });
          await connection.invoke('SendMessage', messagePayload);
          // Optimistic add
          const tempMessage = {
            ...messagePayload,
            id: `temp-${Date.now()}`,
            IsDelivered: false,
            IsRead: false
          };
          setMessages(prev => {
            const normalizedPrev = prev.map(normalizeMessageRecord);
            return [...normalizedPrev, normalizeMessageRecord(tempMessage)];
          });
          
          // Son mesaj zamanını güncelle (mesaj gönderildiğinde)
          const now = Date.now();
          setLastMessageTimes(prev => ({ ...prev, [selectedChat.id]: now }));
        } else {
          // Fallback REST
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
          const tempMessage = {
            id: `temp-${Date.now()}`,
            senderId: user?.id,
            SenderId: user?.id,
            receiverId: selectedChat.id,
            ReceiverId: selectedChat.id,
            content: newMessage.trim(),
            mediaUrl: fileUrl,
            mediaType: mediaType,
            timestamp: new Date().toISOString(),
            IsDelivered: false,
            IsRead: false
          };
          setMessages(prev => {
            const normalizedPrev = prev.map(normalizeMessageRecord);
            return [...normalizedPrev, normalizeMessageRecord(tempMessage)];
          });
          
          // Son mesaj zamanını güncelle (mesaj gönderildiğinde)
          const now = Date.now();
          setLastMessageTimes(prev => ({ ...prev, [selectedChat.id]: now }));
          
          fetchUserMessages(selectedChat.id);
        }
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
        setMessages(prev => {
          const normalizedPrev = prev.map(normalizeMessageRecord);
          const optimistic = normalizeMessageRecord({
            id: `temp-${Date.now()}`,
            senderId: user?.id,
            SenderId: user?.id,
            sender: { id: user?.id, userName: user?.userName, profileImage: user?.profileImage },
            content: newMessage.trim(),
            mediaUrl: fileUrl,
            mediaType: mediaType,
            timestamp: new Date().toISOString()
          });
          return [...normalizedPrev, optimistic];
        });
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
        // Opportunistic mark as read while viewing
        try {
          if (enableHubMarking && connectionReady && connection && connection.state === 'Connected') {
            connection.invoke('MarkMessagesAsRead', selectedChat.id).catch((e) => console.warn('MarkMessagesAsRead failed', e));
          }
        } catch {}
        // REST fallback
        axios.post(`${apiBaseUrl}/Messages/mark-read/${selectedChat.id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
          .then(() => fetchUserMessages(selectedChat.id))
          .catch(() => {});
      } else if (chatType === 'group') {
        fetchGroupMessages(selectedChat.id);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [selectedChat, chatType, connection, connectionReady]);

  // If connection becomes ready after a user was selected, mark read/delivered once
  useEffect(() => {
    if (enableHubMarking && connectionReady && selectedChat && chatType === 'user') {
      try {
        connection.invoke('MarkMessagesAsRead', selectedChat.id).catch(() => {});
        connection.invoke('MarkConversationAsDelivered', selectedChat.id).catch(() => {});
        console.log('[ChatPageV2] Invoked mark read/delivered after connection ready');
      } catch {}
    }
  }, [connectionReady]);
  
  // Periyodik olarak unread count'ları güncelle (her 15 saniyede bir)
  useEffect(() => {
    if (!user?.id) return;
    
    const updateUnreadCounts = async () => {
      try {
        const usersList = users.length > 0 ? users : availableUsers;
        if (usersList.length === 0) return;
        
        const counts = {};
        await Promise.all(usersList.map(async (contactUser) => {
          try {
            const msgResponse = await axios.get(`${apiBaseUrl}/Messages/conversation/${contactUser.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const messages = Array.isArray(msgResponse.data) ? msgResponse.data : [];
            
            // Son mesaj tarihini bul
            let lastMessageTime = 0;
            messages.forEach(m => {
              const msgTime = new Date(m.timestamp ?? m.Timestamp ?? 0).getTime();
              if (msgTime > lastMessageTime) {
                lastMessageTime = msgTime;
              }
            });
            if (lastMessageTime > 0) {
              setLastMessageTimes(prev => ({ ...prev, [contactUser.id]: lastMessageTime }));
            }
            
            // Bu kullanıcıdan bana gelen mesajları filtrele
            const contactUserIdNormalized = normalizeId(
              contactUser?.id ?? contactUser?.userId ?? contactUser?.Id ?? contactUser?.UserId
            );
            const currentUserIdNormalized = normalizeId(getUserId(user));
            const fromContactToMe = messages.filter(m => {
              const senderIdNormalized = normalizeId(getSenderId(m));
              const receiverIdNormalized = normalizeId(getReceiverId(m));
              // ÖNEMLİ: Sadece contactUser'dan bana (user) gelen mesajları say, benim gönderdiğim mesajları sayma!
              return (
                contactUserIdNormalized &&
                currentUserIdNormalized &&
                senderIdNormalized === contactUserIdNormalized &&
                receiverIdNormalized === currentUserIdNormalized
              );
            });
            
            // ÖNEMLİ: Eğer bu kullanıcının chat'i açıksa (selectedChat), mesajları readIdsRef'e ekle
            // Bu, badge hesaplamasının doğru çalışmasını sağlar
            const currentSelectedChat = selectedChatRef.current || selectedChat;
            if (currentSelectedChat && currentSelectedChat.id === contactUser.id && fromContactToMe.length > 0) {
              const messageIdsToAdd = fromContactToMe
                .map(m => String(m.Id ?? m.id))
                .filter(id => id && id !== 'undefined' && id !== 'null');
              
              messageIdsToAdd.forEach(id => {
                if (!readIdsRef.current.has(id)) {
                  readIdsRef.current.add(id);
                }
              });
              
              // readIds state'ini de güncelle
              if (messageIdsToAdd.length > 0) {
                setReadIds(prev => {
                  const s = new Set(prev);
                  messageIdsToAdd.forEach(id => s.add(id));
                  return s;
                });
              }
            }
            
            // Bu kullanıcıdan bana gelen ve OKUNMUŞ mesajları say (readIdsRef kontrolü ile)
            const readFromContact = fromContactToMe.filter(m => {
              const isRead = m.IsRead ?? m.isRead ?? false;
              const msgId = String(m.Id ?? m.id ?? '');
              const msgIdNum = Number(msgId);
              const readIdsArray = Array.from(readIdsRef.current);
              
              // 6 farklı formatta kontrol
              const isReadFromRef1 = readIdsRef.current.has(msgId);
              const isReadFromRef2 = readIdsRef.current.has(String(msgIdNum));
              const isReadFromRef3 = !isNaN(msgIdNum) && readIdsRef.current.has(msgIdNum);
              const isReadFromRef4 = readIdsArray.some(refId => String(refId) === msgId);
              const isReadFromRef5 = readIdsArray.some(refId => String(refId) === String(msgIdNum));
              const isReadFromRef6 = readIdsArray.some(refId => refId === msgIdNum);
              
              const isReadFromRef = isReadFromRef1 || isReadFromRef2 || isReadFromRef3 || 
                                    isReadFromRef4 || isReadFromRef5 || isReadFromRef6;
              
              return isRead || isReadFromRef;
            });
            
            // Okunmamış mesaj sayısı = Toplam - Okunmuş
            const unreadCount = fromContactToMe.length - readFromContact.length;
            
            counts[contactUser.id] = unreadCount;
          } catch (err) {
            counts[contactUser.id] = unreadCounts[contactUser.id] || 0;
          }
        }));
        
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error updating unread counts:', error);
      }
    };
    
    // updateUnreadCounts fonksiyonunu ref'e kaydet (fetchUserMessages'tan çağırabilmek için)
    updateUnreadCountsRef.current = updateUnreadCounts;
    
    // İlk yüklemede ve her 15 saniyede bir güncelle
    updateUnreadCounts();
    const interval = setInterval(updateUnreadCounts, 15000);
    
    return () => {
      clearInterval(interval);
      updateUnreadCountsRef.current = null;
    };
  }, [users, availableUsers, user?.id, token]);

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
                    // WhatsApp tarzı sıralama: Önce okunmamış mesajı olanlar (en çok okunmamış mesajı olanlar), sonra en son mesajlaştığın kişiler
                    [...users].sort((a, b) => {
                      const unreadA = unreadCounts[a.id] || 0;
                      const unreadB = unreadCounts[b.id] || 0;
                      const lastTimeA = lastMessageTimes[a.id] || 0;
                      const lastTimeB = lastMessageTimes[b.id] || 0;
                      
                      // 1. Önce okunmamış mesajı olanlar (en çok okunmamış mesajı olanlar en üstte)
                      if (unreadA > 0 && unreadB === 0) return -1;
                      if (unreadA === 0 && unreadB > 0) return 1;
                      
                      // 2. İkisi de okunmamış mesajı varsa veya ikisi de yoksa, en son mesajlaştığın kişiyi üste al
                      if (unreadA > 0 && unreadB > 0) {
                        // İkisi de okunmamış mesajı varsa: önce unread sayısı (azalan), sonra son mesaj zamanı (azalan)
                        if (unreadA !== unreadB) return unreadB - unreadA;
                        return lastTimeB - lastTimeA;
                      }
                      
                      // İkisi de okunmamış mesajı yoksa: sadece son mesaj zamanına göre sırala (azalan)
                      return lastTimeB - lastTimeA;
                    }).map((user) => {
                      // Extract user properties with fallbacks
                      const displayName = user.firstName || user.firstname || user.Username || user.username || user.userName || user.name || 'User';
                      const username = user.userName || user.username || user.Username || 'user';
                      const profileImg = user.profileImage || user.ProfileImage || user.profile_image;
                      const unreadCount = unreadCounts[user.id] || 0;
                      
                      return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedChat?.id === user.id && chatType === 'user' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                        } ${unreadCount > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                                src={profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff`;
                                }}
                              />
                              {/* Unread badge - kırmızı nokta */}
                              {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 border-2 border-white dark:border-gray-800">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                              )}
                          </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-800 dark:text-white'}`}>
                                  {displayName}
                                </h3>
                              </div>
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
                        const effectiveCurrentUserId =
                          currentUserId ?? normalizeId(getUserId(user));
                        const currentUserIdNormalized = effectiveCurrentUserId;
                        const messageSenderIdNormalized = normalizeId(getSenderId(msg));
                        const isOwnMessage =
                          msg.isMine === true ||
                          (msg.IsFromCurrentUser !== undefined
                            ? !!msg.IsFromCurrentUser
                            : currentUserIdNormalized !== null &&
                              messageSenderIdNormalized !== null &&
                              currentUserIdNormalized === messageSenderIdNormalized);
                        try {
                          if (isOwnMessage) {
                            const idAny = msg.Id ?? msg.id;
                            const idStr = String(idAny);
                            const d = (msg.IsDelivered ?? msg.isDelivered) || deliveredIdsRef.current.has(idStr);
                            const r = (msg.IsRead ?? msg.isRead) || readIdsRef.current.has(idStr);
                            console.log('[ChatPageV2] Render tick', { idx: index, id: msg.id, isOwnMessage, delivered: d, read: r });
                          }
                        } catch {}

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
                                  className={`rounded-2xl px-4 py-3 shadow-md ${
                                    isOwnMessage
                                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                      : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border border-gray-200/60 dark:border-gray-700/60 backdrop-blur'
                                  } max-w-[520px]`}
                                  style={{ wordBreak: 'break-word' }}
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
                                  <div className={`flex items-center gap-2 mt-2 ${isOwnMessage ? 'text-purple-100' : 'text-gray-500'}`}>
                                    <span>
                                      {new Date(msg.sentAt || msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {isOwnMessage && (
                                      <span className="ml-1 select-none" style={{ fontSize: '14px', fontWeight: 700 }}>
                                        {(() => {
                                          const idAny = msg.Id ?? msg.id;
                                          const idStr = String(idAny);
                                          // ÖNCELİK: readIdsRef set'ini kontrol et (en önemli!)
                                          const inReadIdsSet = readIdsRef.current.has(idStr);
                                          const inDeliveredIdsSet = deliveredIdsRef.current.has(idStr);
                                          const msgIsRead = msg.IsRead ?? msg.isRead ?? false;
                                          const msgIsDelivered = msg.IsDelivered ?? msg.isDelivered ?? false;
                                          
                                          // readIds set'indeyse kesinlikle read olmalı
                                          const isReadAny = inReadIdsSet || msgIsRead;
                                          const isDeliveredAny = inReadIdsSet || inDeliveredIdsSet || msgIsDelivered;
                                          
                                          // Debug log (sadece kendi mesajlarımız için)
                                          if (index < 5) { // İlk 5 mesaj için log
                                            console.log('[ChatPageV2] Render tick check', { 
                                              id: idStr, 
                                              inReadIdsSet, 
                                              msgIsRead, 
                                              isReadAny,
                                              inDeliveredIdsSet,
                                              msgIsDelivered,
                                              isDeliveredAny 
                                            });
                                          }
                                          
                                          if (isReadAny) return (<span style={{ color: '#34B7F1', fontSize: '14px', fontWeight: 700 }}>✓✓</span>);
                                          if (isDeliveredAny) return (<span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 700 }}>✓✓</span>);
                                          return (<span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700 }}>✓</span>);
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

