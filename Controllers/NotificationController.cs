using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using Experience.Models;
using System.Security.Claims;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all notifications for the current user
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(50)
                    .Select(n => new
                    {
                        id = n.Id,
                        type = n.Type,
                        message = n.Message,
                        fromUser = n.FromUser != null ? new
                        {
                            id = n.FromUser.Id,
                            userName = n.FromUser.UserName,
                            firstName = n.FromUser.FirstName,
                            lastName = n.FromUser.LastName,
                            profileImage = n.FromUser.ProfileImage
                        } : null,
                        experienceId = n.ExperienceId,
                        commentId = n.CommentId,
                        statusId = n.StatusId,
                        isRead = n.IsRead,
                        createdAt = n.CreatedAt
                    })
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting notifications", error = ex.Message });
            }
        }

        // Mark notification as read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

                if (notification == null)
                {
                    return NotFound(new { message = "Notification not found" });
                }

                notification.IsRead = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating notification", error = ex.Message });
            }
        }

        // Mark all notifications as read
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating notifications", error = ex.Message });
            }
        }

        // Create notification
        [HttpPost]
        public async Task<IActionResult> CreateNotificationEndpoint([FromBody] NotificationRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Request body is null" });
                }

                if (request.UserId == 0)
                {
                    return BadRequest(new { message = "UserId is required" });
                }

                if (string.IsNullOrEmpty(request.Type))
                {
                    return BadRequest(new { message = "Type is required" });
                }

                if (string.IsNullOrEmpty(request.Message))
                {
                    return BadRequest(new { message = "Message is required" });
                }

                var notification = new Notification
                {
                    UserId = request.UserId,
                    Type = request.Type,
                    Message = request.Message,
                    FromUserId = request.FromUserId,
                    ExperienceId = request.ExperienceId,
                    CommentId = request.CommentId,
                    StatusId = request.StatusId,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new { id = notification.Id, message = "Notification created successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating notification: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                }
                
                // Eger database səhvi varsa, sadəcə log və return ok (notification optional-dir)
                if (ex.Message.Contains("Geçersiz") || ex.Message.Contains("Invalid"))
                {
                    Console.WriteLine("Notification table structure mismatch - skipping notification creation");
                    return Ok(new { message = "Notification skipped due to database structure mismatch" });
                }
                
                return StatusCode(500, new { message = "Error creating notification", error = ex.Message, details = ex.ToString() });
            }
        }

        // Create notification (helper method)
        public static async Task CreateNotification(
            ApplicationDbContext context,
            int toUserId,
            string type,
            string message,
            int? fromUserId = null,
            int? experienceId = null,
            int? commentId = null,
            int? statusId = null)
        {
            var notification = new Notification
            {
                UserId = toUserId,
                Type = type,
                Message = message,
                FromUserId = fromUserId,
                ExperienceId = experienceId,
                CommentId = commentId,
                StatusId = statusId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            context.Notifications.Add(notification);
            await context.SaveChangesAsync();
        }
    }

    public class NotificationRequest
    {
        public int UserId { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public int? FromUserId { get; set; }
        public int? ExperienceId { get; set; }
        public int? CommentId { get; set; }
        public int? StatusId { get; set; }
    }
}