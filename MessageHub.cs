using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using ExperienceProject.Models;
using ExperienceProject.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Experience.Dto;
using Experience.Models;
using System.Text.Json;
using System.Collections.Concurrent;

namespace ExperienceProject.Hubs
{
    public class MessageHub : Hub
    {
        private readonly ApplicationDbContext _context;

        private static ConcurrentDictionary<int, string> _userConnections = new ConcurrentDictionary<int, string>();

        public MessageHub(ApplicationDbContext context)
        {
            _context = context;
        }



        public async Task CallUser(int receiverId, bool isVideo)
        {
            int? callerId = GetUserId();
            if (callerId == null)
            {
                await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                return;
            }

            if (_userConnections.TryGetValue(receiverId, out var receiverConnectionId))
            {
                await Clients.Client(receiverConnectionId).SendAsync("IncomingCall", new { CallerId = callerId.Value, IsVideo = isVideo }); 
            }
        }

        public async Task AcceptCall(int callerId)
        {
            int? receiverId = GetUserId();
            if (receiverId == null)
            {
                await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                return;
            }

            if (_userConnections.TryGetValue(callerId, out var callerConnectionId))
            {
                await Clients.Client(callerConnectionId).SendAsync("CallAccepted", receiverId.Value);
            }
        }

        public async Task RejectCall(int callerId)
        {
            if (_userConnections.TryGetValue(callerId, out var callerConnectionId))
            {
                await Clients.Client(callerConnectionId).SendAsync("CallRejected");
            }
        }


        public async Task SendWebRTCOffer(int receiverId, string offer)
        {
            if (_userConnections.TryGetValue(receiverId, out var receiverConnectionId))
            {
                await Clients.Client(receiverConnectionId).SendAsync("ReceiveWebRTCOffer", offer);
            }
        }

        public async Task SendWebRTCAnswer(int callerId, string answer)
        {
            if (_userConnections.TryGetValue(callerId, out var callerConnectionId))
            {
                await Clients.Client(callerConnectionId).SendAsync("ReceiveWebRTCAnswer", answer);
            }
        }

        public async Task SendICECandidate(int receiverId, string candidate)
        {
            if (_userConnections.TryGetValue(receiverId, out var receiverConnectionId))
            {
                await Clients.Client(receiverConnectionId).SendAsync("ReceiveICECandidate", candidate);
            }
        }
        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();

            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("ErrorMessage", $"âš ï¸ User ID could not be determined for connectionId {Context.ConnectionId}");                                                                                                                                       
                await base.OnConnectedAsync();
                return;
            }

            // User bazada varmÄ±? (Bunu yoxlamaq Ã¼Ã§Ã¼n)
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId.Value);
            if (!userExists)
            {
                await Clients.Caller.SendAsync("ErrorMessage", $"âŒ User with ID {userId.Value} does not exist.");
                return;
            }

            // KÃ¶hnÉ™ ConnectionId-ni silirik
            if (_userConnections.TryGetValue(userId.Value, out var oldConnectionId))
            {
                _userConnections.TryRemove(userId.Value, out _);
            }

            // Yeni ConnectionId-ni É™lavÉ™ edirik
            _userConnections[userId.Value] = Context.ConnectionId;

            // Frontend-É™ mÉ™lumat gÃ¶ndÉ™ririk
            await Clients.Caller.SendAsync("ConnectionInfo", userId.Value, Context.ConnectionId);

            await base.OnConnectedAsync();
        }



        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                _userConnections.TryRemove(userId.Value, out _);
            }
            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(MessageDTO message)
        {
            try
            {
                if (message == null)
                    throw new HubException("Message object is null.");

                if (string.IsNullOrEmpty(message.Content) && string.IsNullOrEmpty(message.MediaUrl))
                    throw new HubException("Message must have content or media.");

                var newMessage = new Message
                {
                    SenderId = message.SenderId,
                    ReceiverId = message.ReceiverId,
                    Content = message.Content,
                    MediaUrl = message.MediaUrl,
                    MediaType = message.MediaType,
                    Timestamp = DateTime.UtcNow
                };

                _context.Messages.Add(newMessage);
                await _context.SaveChangesAsync();

                // Receiver Ã¼Ã§Ã¼n connectionId-ni tapÄ±rÄ±q
                if (_userConnections.TryGetValue(message.ReceiverId, out var receiverConnectionId))
                {
                    Console.WriteLine($"âœ… Sending message to Receiver {message.ReceiverId} with ConnectionId: {receiverConnectionId}");   
                    await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", newMessage);
                }
                //else
                //{
                //    Console.WriteLine($"âš ï¸ Receiver {message.ReceiverId} is not connected.");
                //    await Clients.Caller.SendAsync("ErrorMessage", $"Receiver {message.ReceiverId} is not connected.");
                //}

                // Sender Ã¼Ã§Ã¼n connectionId-ni tapÄ±rÄ±q
                if (_userConnections.TryGetValue(message.SenderId, out var senderConnectionId))
                {
                    Console.WriteLine($"âœ… Sending message to Sender {message.SenderId} with ConnectionId: {senderConnectionId}");
                    await Clients.Client(senderConnectionId).SendAsync("ReceiveMessage", newMessage);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in SendMessage: {ex.Message}");
                // XÉ™tanÄ± frontend-É™ gÃ¶ndÉ™ririk
                await Clients.Caller.SendAsync("ErrorMessage", $"Error in SendMessage: {ex.Message}");
            }
        }

        private int? GetUserId()
        {
            var httpContext = Context.GetHttpContext();
            var token = httpContext?.Request.Query["access_token"];

            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("âŒ No token provided in query string.");
                return null;
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

                return int.TryParse(userIdClaim, out var userId) ? userId : null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Token parse error: {ex.Message}");
                return null;
            }
        }




        public async Task AddComment(int experienceId, CommentDto commentDTO, string token)
        {
            try
            {
                // JWT tokenini oxuyuruq
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(userIdClaim, out var userId))
                {
                    await Clients.Caller.SendAsync("Error", "Invalid user token");
                    return;
                }

                // Experience tapÄ±lÄ±r
                var experience = await _context.Experiences.FindAsync(experienceId);
                if (experience == null)
                {
                    await Clients.Caller.SendAsync("Error", "Experience not found");
                    return;
                }


                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    await Clients.Caller.SendAsync("Error", "User not found");
                    return;
                }

                // Yeni ÅŸÉ™rh yaradÄ±lÄ±r
                var comment = new Comment
                {
                    Content = commentDTO.Content,
                    UserId = userId,
                    ExperienceId = experienceId,
                    CreatedAt = DateTime.UtcNow,
                    ParentCommentId = commentDTO.ParentCommentId,
                    User = user // **Burada user É™lavÉ™ olunur!**
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                // **DÃ¼zgÃ¼n JSON formatÄ±nda gÃ¶ndÉ™ririk**
                var commentResponse = new
                {
                    comment.Id,
                    comment.Content,
                    comment.UserId,
                    User = new
                    {
                        comment.User.Id,
                        comment.User.FirstName,
                        comment.User.LastName,
                                comment.User.ProfileImage // Burada profil ÅŸÉ™klini É™lavÉ™ edirik

                    },
                    comment.CreatedAt,
                    comment.ParentCommentId
                };

                // ÅžÉ™rh real-time olaraq gÃ¶ndÉ™rilir
                await Clients.Group($"Experience_{experienceId}").SendAsync("ReceiveComment", commentResponse);
            }
            catch (Exception ex)
            {
                // XÉ™tanÄ±n log edilmÉ™si
                await Clients.Caller.SendAsync("Error", new { message = "Failed to add comment", details = ex.Message });
            }
        }




        public async Task JoinExperienceGroup(int experienceId)
        {
            try
            {
                if (experienceId <= 0)
                {
                    await Clients.Caller.SendAsync("ReceiveError", "âŒ Invalid Experience ID");
                    return;
                }

                Console.WriteLine($"âœ… User {Context.ConnectionId} is joining group: Experience_{experienceId}");

                await Groups.AddToGroupAsync(Context.ConnectionId, $"Experience_{experienceId}");

                await Clients.Caller.SendAsync("ReceiveSuccess", $"âœ… Joined Experience_{experienceId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in JoinExperienceGroup: {ex.Message}");
                await Clients.Caller.SendAsync("ReceiveError", $"âŒ Server error: {ex.Message}");
            }
        }

        public async Task ReactToComment(int commentId, bool isLike, string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Invalid user token");
                return;
            }

            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null)
            {
                await Clients.Caller.SendAsync("ReceiveError", "Comment not found");
                return;
            }

            var existingReaction = await _context.CommentReactions
                .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

            if (existingReaction != null)
            {
                // ðŸ"¹ Eyni reaksiyanÄ± yenidÉ™n basarsa, reaksiyanÄ± sil
                if (existingReaction.IsLike == isLike)
                {
                    _context.CommentReactions.Remove(existingReaction);
                }
                else
                {
                    existingReaction.IsLike = isLike;
                }
            }
            else
            {
                var reaction = new CommentReaction
                {
                    CommentId = commentId,
                    UserId = userId,
                    IsLike = isLike
                };
                _context.CommentReactions.Add(reaction);
            }

            // ðŸ"¹ YenilÉ™nmiÅŸ like vÉ™ dislike saylarÄ±nÄ± hesabla
            comment.LikesCount = await _context.CommentReactions.CountAsync(r => r.CommentId == commentId && r.IsLike);
            comment.DislikesCount = await _context.CommentReactions.CountAsync(r => r.CommentId == commentId && !r.IsLike);

            await _context.SaveChangesAsync();

            // ðŸ"¹ Frontend-É™ yenilÉ™nmiÅŸ mÉ™lumatlarÄ± gÃ¶ndÉ™r
            await Clients.All.SendAsync("UpdateReaction", new Dictionary<string, object>
{
    { "CommentId", commentId },
    { "LikesCount", _context.CommentReactions.Count(r => r.CommentId == commentId && r.IsLike) },
    { "DislikesCount", _context.CommentReactions.Count(r => r.CommentId == commentId && !r.IsLike) }
});



        }


        public async Task LeaveExperienceGroup(int experienceId)
        {
            try
            {
                if (experienceId <= 0)
                {
                    await Clients.Caller.SendAsync("ReceiveError", "âŒ Invalid Experience ID");
                    return;
                }

                Console.WriteLine($"â„¹ï¸ User {Context.ConnectionId} is leaving group: Experience_{experienceId}");

                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Experience_{experienceId}");

                await Clients.Caller.SendAsync("ReceiveSuccess", $"â„¹ï¸ Left Experience_{experienceId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in LeaveExperienceGroup: {ex.Message}");
                await Clients.Caller.SendAsync("ReceiveError", $"âŒ Server error: {ex.Message}");
            }
        }

        // Group Chat Functions
        public async Task SendGroupMessage(GroupMessageDTO message)
        {
            try
            {
                if (message == null)
                    throw new HubException("Message object is null.");

                if (string.IsNullOrEmpty(message.Content) && string.IsNullOrEmpty(message.MediaUrl))
                    throw new HubException("Message must have content or media.");

                var newMessage = new GroupMessage
                {
                    GroupChatId = message.GroupChatId,
                    SenderId = message.SenderId,
                    Content = message.Content,
                    MediaUrl = message.MediaUrl,
                    MessageType = message.MessageType ?? "text",
                    SentAt = DateTime.UtcNow
                };

                _context.GroupMessages.Add(newMessage);
                await _context.SaveChangesAsync();

                // Send to all group members
                await Clients.Group($"Group_{message.GroupChatId}").SendAsync("ReceiveGroupMessage", newMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in SendGroupMessage: {ex.Message}");
                await Clients.Caller.SendAsync("ErrorMessage", $"Error in SendGroupMessage: {ex.Message}");
            }
        }

        public async Task JoinGroup(int groupId)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                    return;
                }

                // Check if user is member of the group
                var isMember = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupChatId == groupId && gm.UserId == userId.Value);

                if (!isMember)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "You are not a member of this group.");
                    return;
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, $"Group_{groupId}");
                await Clients.Caller.SendAsync("GroupJoined", groupId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in JoinGroup: {ex.Message}");
                await Clients.Caller.SendAsync("ErrorMessage", $"Error joining group: {ex.Message}");
            }
        }

        public async Task LeaveGroup(int groupId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Group_{groupId}");
                await Clients.Caller.SendAsync("GroupLeft", groupId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in LeaveGroup: {ex.Message}");
                await Clients.Caller.SendAsync("ErrorMessage", $"Error leaving group: {ex.Message}");
            }
        }

        // Message Reactions
        public async Task AddMessageReaction(int messageId, string emoji, bool isGroupMessage)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                    return;
                }

                // Check if reaction already exists
                var existingReaction = await _context.MessageReactions
                    .FirstOrDefaultAsync(r =>
                        (r.MessageId == messageId || r.GroupMessageId == messageId) &&
                        r.UserId == userId.Value &&
                        r.Emoji == emoji);

                if (existingReaction != null)
                {
                    // Remove reaction if already exists
                    _context.MessageReactions.Remove(existingReaction);
                    await _context.SaveChangesAsync();
                    
                    if (isGroupMessage)
                    {
                        await Clients.Group($"Group_{existingReaction.GroupMessageId}").SendAsync("ReactionRemoved", messageId, emoji, userId.Value);
                    }
                    else
                    {
                        await Clients.All.SendAsync("ReactionRemoved", messageId, emoji, userId.Value);
                    }
                    return;
                }

                // Add new reaction
                var reaction = new MessageReaction
                {
                    GroupMessageId = isGroupMessage ? messageId : null,
                    MessageId = !isGroupMessage ? messageId : null,
                    UserId = userId.Value,
                    Emoji = emoji,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MessageReactions.Add(reaction);
                await _context.SaveChangesAsync();

                if (isGroupMessage)
                {
                    await Clients.Group($"Group_{messageId}").SendAsync("ReactionAdded", messageId, emoji, userId.Value);
                }
                else
                {
                    await Clients.All.SendAsync("ReactionAdded", messageId, emoji, userId.Value);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in AddMessageReaction: {ex.Message}");
                await Clients.Caller.SendAsync("ErrorMessage", $"Error adding reaction: {ex.Message}");
            }
        }

        // Typing Indicators
        public async Task StartTyping(int receiverId, bool isGroup = false, int? groupId = null)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                    return;
                }

                if (isGroup && groupId.HasValue)
                {
                    await Clients.Group($"Group_{groupId.Value}").SendAsync("UserStartedTyping", userId.Value);
                }
                else
                {
                    if (_userConnections.TryGetValue(receiverId, out var receiverConnectionId))
                    {
                        await Clients.Client(receiverConnectionId).SendAsync("UserStartedTyping", userId.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in StartTyping: {ex.Message}");
            }
        }

        public async Task StopTyping(int receiverId, bool isGroup = false, int? groupId = null)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                    return;
                }

                if (isGroup && groupId.HasValue)
                {
                    await Clients.Group($"Group_{groupId.Value}").SendAsync("UserStoppedTyping", userId.Value);
                }
                else
                {
                    if (_userConnections.TryGetValue(receiverId, out var receiverConnectionId))
                    {
                        await Clients.Client(receiverConnectionId).SendAsync("UserStoppedTyping", userId.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in StopTyping: {ex.Message}");
            }
        }

        // Message Status
        public async Task MarkAsRead(int messageId, bool isGroupMessage = false)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                    return;
                }

                if (isGroupMessage)
                {
                    var groupMessage = await _context.GroupMessages.FindAsync(messageId);
                    if (groupMessage != null)
                    {
                        await Clients.Group($"Group_{groupMessage.GroupChatId}").SendAsync("MessageRead", messageId, userId.Value);
                    }
                }
                else
                {
                    var message = await _context.Messages.FindAsync(messageId);
                    if (message != null)
                    {
                        if (_userConnections.TryGetValue(message.SenderId, out var senderConnectionId))
                        {
                            await Clients.Client(senderConnectionId).SendAsync("MessageRead", messageId, userId.Value);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in MarkAsRead: {ex.Message}");
            }
        }

        public async Task MarkAsDelivered(int messageId, bool isGroupMessage = false)
        {
            try
            {
                var userId = GetUserId();
                if (!userId.HasValue)
                {
                    await Clients.Caller.SendAsync("ErrorMessage", "User ID not found.");
                    return;
                }

                if (isGroupMessage)
                {
                    var groupMessage = await _context.GroupMessages.FindAsync(messageId);
                    if (groupMessage != null)
                    {
                        await Clients.Group($"Group_{groupMessage.GroupChatId}").SendAsync("MessageDelivered", messageId, userId.Value);
                    }
                }
                else
                {
                    var message = await _context.Messages.FindAsync(messageId);
                    if (message != null)
                    {
                        if (_userConnections.TryGetValue(message.SenderId, out var senderConnectionId))
                        {
                            await Clients.Client(senderConnectionId).SendAsync("MessageDelivered", messageId, userId.Value);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"âŒ Error in MarkAsDelivered: {ex.Message}");
            }
        }

    }
}

