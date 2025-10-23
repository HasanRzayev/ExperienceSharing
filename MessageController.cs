using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Models;
using ExperienceProject.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using Experience.Dto;
using Experience.Models;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MessagesController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetUserIdFromHeader()
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader))
            {
                return 0;
            }

            var token = authHeader.Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return 0;
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing token: {ex.Message}");
            return 0;
        }
    }
    [HttpDelete("admin/delete/{messageId}")]
    public async Task<IActionResult> DeleteMessageById(int messageId)
    {
        var message = await _context.Messages.FindAsync(messageId);
        if (message == null)
        {
            return NotFound("Message not found.");
        }

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();

        return Ok("Message deleted successfully.");
    }


    [HttpDelete("delete/{receiverId}")]
    public async Task<IActionResult> DeleteMessages(int receiverId)
    {
        var userId = GetUserIdFromHeader();

        var messages = await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == receiverId) ||
                        (m.SenderId == receiverId && m.ReceiverId == userId))
            .ToListAsync();

        if (!messages.Any())
        {
            return NotFound("No messages found.");
        }

        _context.Messages.RemoveRange(messages);
        await _context.SaveChangesAsync();

        return Ok("Messages deleted successfully.");
    }
    [HttpGet("isBlocked/{userId}")]
    public async Task<IActionResult> IsUserBlocked(int userId)
    {
        var currentUserId = GetUserIdFromHeader();

        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => b.UserId == currentUserId && b.BlockedUserId == userId);

        return Ok(new { isBlocked });
    }

    [HttpDelete("unblock/{userId}")]
    public async Task<IActionResult> UnblockUser(int userId)
    {
        var currentUserId = GetUserIdFromHeader();

        var blockEntry = await _context.BlockedUsers
            .FirstOrDefaultAsync(b => b.UserId == currentUserId && b.BlockedUserId == userId);

        if (blockEntry == null)
        {
            return NotFound("User is not blocked.");
        }

        _context.BlockedUsers.Remove(blockEntry);
        await _context.SaveChangesAsync();

        return Ok("User unblocked successfully.");
    }

    [HttpPost("block/{userId}")]
    public async Task<IActionResult> BlockUser(int userId)
    {
        Console.WriteLine($"BlockUser called with userId: {userId}");
        
        var currentUserId = GetUserIdFromHeader();
        Console.WriteLine($"Parsed currentUserId: {currentUserId}");
        
        if (currentUserId == 0)
        {
            Console.WriteLine("Current user ID is 0, returning Unauthorized");
            return Unauthorized(new { message = "User ID not found in token" });
        }

        if (currentUserId == userId)
        {
            Console.WriteLine("User trying to block themselves");
            return BadRequest(new { message = "You cannot block yourself." });
        }

        try
        {
            Console.WriteLine($"Checking if user {userId} is already blocked by {currentUserId}");
            
            var existingBlock = await _context.BlockedUsers
                .FirstOrDefaultAsync(b => b.UserId == currentUserId && b.BlockedUserId == userId);

            if (existingBlock != null)
            {
                Console.WriteLine("User is already blocked");
                return BadRequest(new { message = "User is already blocked." });
            }

            Console.WriteLine($"Creating new block entry for user {userId}");
            
            var block = new BlockedUser
            {
                UserId = currentUserId,
                BlockedUserId = userId
            };

            _context.BlockedUsers.Add(block);
            await _context.SaveChangesAsync();

            Console.WriteLine("User blocked successfully");
            return Ok(new { message = "User blocked successfully." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error blocking user: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "Failed to block user" });
        }
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearChat()
    {
        var userId = GetUserIdFromHeader();

        var messages = await _context.Messages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .ToListAsync();

        if (!messages.Any())
        {
            return NotFound("No messages found.");
        }

        _context.Messages.RemoveRange(messages);
        await _context.SaveChangesAsync();

        return Ok("Chat cleared successfully.");
    }
    [HttpGet]
    public async Task<IActionResult> GetMessages()
    {
        var userId = GetUserIdFromHeader();

        var messages = await _context.Messages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderBy(m => m.Timestamp)
            .Include(m => m.Sender)   // Gï¿½nd?rici m?lumatlar?
            .Include(m => m.Receiver) // Al?c? m?lumatlar?
            .Select(m => new
            {
                Id = m.Id,
                Content = m.Content,
                MediaType = m.MediaType,
                Timestamp = m.Timestamp,
                Sender = new
                {
                    m.Sender.Id,
                    m.Sender.FirstName,
                    m.Sender.LastName,
                    m.Sender.UserName,
                    m.Sender.ProfileImage
                },
                Receiver = new
                {
                    m.Receiver.Id,
                    m.Receiver.FirstName,
                    m.Receiver.LastName,
                    m.Receiver.UserName,
                    m.Receiver.ProfileImage
                }
            })
            .ToListAsync();

        return Ok(messages);
    }
    [HttpGet("admin")]
    public async Task<IActionResult> GetMessagesForAdmin(int page = 1, int pageSize = 10, string? search = null)
    {
        var query = _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .OrderBy(m => m.Timestamp)
            .AsQueryable();

        // Axtar?? (search) filteri
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(m => m.Content.Contains(search));
        }

        // S?hif?l?m? t?tbiq et
        var messages = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                Id = m.Id,
                Content = m.Content,
                MediaType = m.MediaType,
                Timestamp = m.Timestamp,
                Sender = new
                {
                    m.Sender.Id,
                    m.Sender.FirstName,
                    m.Sender.LastName,
                    m.Sender.UserName,
                    m.Sender.ProfileImage
                },
                Receiver = new
                {
                    m.Receiver.Id,
                    m.Receiver.FirstName,
                    m.Receiver.LastName,
                    m.Receiver.UserName,
                    m.Receiver.ProfileImage
                }
            })
            .ToListAsync();

        return Ok(messages);
    }



    [HttpGet("{receiverId}")]
    public async Task<IActionResult> GetMessagesWithUser(int receiverId)
    {
        var userId = GetUserIdFromHeader();

        var messages = await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == receiverId) ||
                        (m.SenderId == receiverId && m.ReceiverId == userId))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return Ok(messages);
    }

    [HttpGet("conversation/{receiverId}")]
    public async Task<IActionResult> GetConversation(int receiverId)
    {
        var userId = GetUserIdFromHeader();
        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        // Check if user is blocked
        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => (b.UserId == userId && b.BlockedUserId == receiverId) ||
                          (b.UserId == receiverId && b.BlockedUserId == userId));

        if (isBlocked)
        {
            return BadRequest(new { message = "You cannot view messages with this user. One of you has blocked the other." });
        }

        var messages = await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == receiverId) ||
                        (m.SenderId == receiverId && m.ReceiverId == userId))
            .OrderBy(m => m.Timestamp)
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Select(m => new
            {
                Id = m.Id,
                Content = m.Content,
                MediaType = m.MediaType,
                MediaUrl = m.MediaUrl,
                Timestamp = m.Timestamp,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Sender = new
                {
                    m.Sender.Id,
                    m.Sender.FirstName,
                    m.Sender.LastName,
                    m.Sender.UserName,
                    m.Sender.ProfileImage
                },
                Receiver = new
                {
                    m.Receiver.Id,
                    m.Receiver.FirstName,
                    m.Receiver.LastName,
                    m.Receiver.UserName,
                    m.Receiver.ProfileImage
                }
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpDelete("conversation/{receiverId}")]
    public async Task<IActionResult> DeleteConversation(int receiverId)
    {
        Console.WriteLine($"DeleteConversation called with receiverId: {receiverId}");
        
        var userId = GetUserIdFromHeader();
        Console.WriteLine($"Parsed userId: {userId}");
        
        if (userId == 0)
        {
            Console.WriteLine("User ID is 0, returning Unauthorized");
            return Unauthorized(new { message = "User ID not found in token" });
        }

        try
        {
            Console.WriteLine($"Looking for messages between user {userId} and receiver {receiverId}");
            
            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == receiverId) ||
                            (m.SenderId == receiverId && m.ReceiverId == userId))
                .ToListAsync();

            Console.WriteLine($"Found {messages.Count} messages to delete");

            if (!messages.Any())
            {
                Console.WriteLine("No messages found, returning NotFound");
                return NotFound(new { message = "No messages found" });
            }

            _context.Messages.RemoveRange(messages);
            await _context.SaveChangesAsync();

            Console.WriteLine("Messages deleted successfully");
            return Ok(new { message = "Conversation deleted successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting conversation: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "Failed to delete conversation" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] MessageDTO messageDto)
    {
        var userId = GetUserIdFromHeader(); // Token'dan SenderId al
        if (userId == 0)
        {
            return Unauthorized();
        }

        // Check if user is blocked
        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => (b.UserId == userId && b.BlockedUserId == messageDto.ReceiverId) ||
                          (b.UserId == messageDto.ReceiverId && b.BlockedUserId == userId));

        if (isBlocked)
        {
            return BadRequest(new { message = "You cannot send messages to this user. One of you has blocked the other." });
        }

        var message = new Message
        {
            SenderId = userId, // Token'dan gelen ID
            ReceiverId = messageDto.ReceiverId,
            Content = messageDto.Content,
            MediaUrl = messageDto.MediaUrl,
            MediaType = messageDto.MediaType,
            Timestamp = DateTime.UtcNow
        };

        if (ModelState.IsValid)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return Ok(message);
        }

        return BadRequest(ModelState);
    }

}
