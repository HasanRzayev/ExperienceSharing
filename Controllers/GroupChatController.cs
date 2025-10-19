using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GroupChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all group chats for current user
        [HttpGet("my-groups")]
        public async Task<IActionResult> GetMyGroups()
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var groups = await _context.GroupChats
                    .Where(g => g.Members.Any(m => m.UserId == userId.Value))
                    .Include(g => g.CreatedBy)
                    .Include(g => g.Members)
                        .ThenInclude(m => m.User)
                    .OrderByDescending(g => g.CreatedAt)
                    .ToListAsync();

                return Ok(groups);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching groups: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch groups" });
            }
        }

        // Create group chat
        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var group = new GroupChat
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    GroupImage = dto.GroupImage ?? "https://via.placeholder.com/200",
                    CreatedByUserId = userId.Value,
                    CreatedAt = DateTime.UtcNow
                };

                _context.GroupChats.Add(group);
                await _context.SaveChangesAsync();

                // Add creator as admin
                var creatorMember = new GroupMember
                {
                    GroupChatId = group.Id,
                    UserId = userId.Value,
                    Role = "Admin",
                    JoinedAt = DateTime.UtcNow
                };
                _context.GroupMembers.Add(creatorMember);

                // Add other members
                if (dto.MemberIds != null && dto.MemberIds.Any())
                {
                    foreach (var memberId in dto.MemberIds)
                    {
                        var member = new GroupMember
                        {
                            GroupChatId = group.Id,
                            UserId = memberId,
                            Role = "Member",
                            JoinedAt = DateTime.UtcNow
                        };
                        _context.GroupMembers.Add(member);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(group);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating group: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create group" });
            }
        }

        // Get group messages
        [HttpGet("{groupId}/messages")]
        public async Task<IActionResult> GetGroupMessages(int groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Check if user is member
                var isMember = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupChatId == groupId && gm.UserId == userId.Value);

                if (!isMember)
                {
                    return Forbid();
                }

                var messages = await _context.GroupMessages
                    .Where(m => m.GroupChatId == groupId)
                    .Include(m => m.Sender)
                    .Include(m => m.Reactions)
                        .ThenInclude(r => r.User)
                    .OrderByDescending(m => m.SentAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(messages.OrderBy(m => m.SentAt));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching group messages: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch messages" });
            }
        }

        // Send group message
        [HttpPost("{groupId}/messages")]
        public async Task<IActionResult> SendGroupMessage(int groupId, [FromBody] SendMessageDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var isMember = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupChatId == groupId && gm.UserId == userId.Value);

                if (!isMember)
                {
                    return Forbid();
                }

                var message = new GroupMessage
                {
                    GroupChatId = groupId,
                    SenderId = userId.Value,
                    Content = dto.Content,
                    MessageType = dto.MessageType ?? "text",
                    MediaUrl = dto.MediaUrl,
                    SentAt = DateTime.UtcNow
                };

                _context.GroupMessages.Add(message);
                await _context.SaveChangesAsync();

                return Ok(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending group message: {ex.Message}");
                return StatusCode(500, new { error = "Failed to send message" });
            }
        }

        // Add reaction to message
        [HttpPost("messages/{messageId}/reactions")]
        public async Task<IActionResult> AddReaction(int messageId, [FromBody] AddReactionDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Check if reaction already exists
                var existingReaction = await _context.MessageReactions
                    .FirstOrDefaultAsync(r => 
                        (r.MessageId == messageId || r.GroupMessageId == messageId) && 
                        r.UserId == userId.Value && 
                        r.Emoji == dto.Emoji);

                if (existingReaction != null)
                {
                    // Remove reaction if already exists
                    _context.MessageReactions.Remove(existingReaction);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Reaction removed" });
                }

                // Add new reaction
                var reaction = new MessageReaction
                {
                    GroupMessageId = dto.IsGroupMessage ? messageId : null,
                    MessageId = !dto.IsGroupMessage ? messageId : null,
                    UserId = userId.Value,
                    Emoji = dto.Emoji,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MessageReactions.Add(reaction);
                await _context.SaveChangesAsync();

                return Ok(reaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding reaction: {ex.Message}");
                return StatusCode(500, new { error = "Failed to add reaction" });
            }
        }

        private int? GetUserIdFromToken()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader))
            {
                return null;
            }

            var token = authHeader.Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            return null;
        }
    }

    // DTOs
    public class CreateGroupDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string GroupImage { get; set; }
        public List<int> MemberIds { get; set; }
    }

    public class SendMessageDto
    {
        public string Content { get; set; }
        public string MessageType { get; set; }
        public string MediaUrl { get; set; }
    }

    public class AddReactionDto
    {
        public string Emoji { get; set; }
        public bool IsGroupMessage { get; set; }
    }
}

