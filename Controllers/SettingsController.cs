using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get user settings
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Bio,
                user.Website,
                user.PhoneNumber,
                user.BirthDate,
                user.Gender,
                user.Country,
                user.ProfileImage,
                user.CreatedAt
            });
        }

        // Update profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Bio = request.Bio;
            user.Website = request.Website;
            user.PhoneNumber = request.PhoneNumber;
            user.BirthDate = request.BirthDate;
            user.Gender = request.Gender;
            user.Country = request.Country;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }

        // Get privacy settings
        [HttpGet("privacy")]
        public async Task<IActionResult> GetPrivacySettings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.IsPrivate,
                user.AllowComments,
                user.AllowTags,
                user.AllowMentions,
                user.ShowActivityStatus
            });
        }

        // Update privacy settings
        [HttpPut("privacy")]
        public async Task<IActionResult> UpdatePrivacySettings([FromBody] UpdatePrivacyRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            user.IsPrivate = request.IsPrivate;
            user.AllowComments = request.AllowComments;
            user.AllowTags = request.AllowTags;
            user.AllowMentions = request.AllowMentions;
            user.ShowActivityStatus = request.ShowActivityStatus;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Privacy settings updated successfully" });
        }

        // Get notification settings
        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotificationSettings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.EmailNotifications,
                user.PushNotifications
            });
        }

        // Update notification settings
        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotificationSettings([FromBody] UpdateNotificationRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            user.EmailNotifications = request.EmailNotifications;
            user.PushNotifications = request.PushNotifications;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification settings updated successfully" });
        }

        // Get account settings
        [HttpGet("account")]
        public async Task<IActionResult> GetAccountSettings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.UserName,
                user.Email,
                user.Language,
                user.TwoFactorEnabled,
                user.CreatedAt,
                user.LastLoginAt
            });
        }

        // Update account settings
        [HttpPut("account")]
        public async Task<IActionResult> UpdateAccountSettings([FromBody] UpdateAccountRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            user.UserName = request.UserName;
            user.Email = request.Email;
            user.Language = request.Language;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account settings updated successfully" });
        }

        // Change password
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            // Here you would verify the old password and hash the new one
            // For now, just update the password hash (simplified)
            user.PasswordHash = request.NewPassword; // In production, use proper hashing

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            return null;
        }
    }

    public class UpdateProfileRequest
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        public string Bio { get; set; }
        public string Website { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? BirthDate { get; set; }
        public string Gender { get; set; }
        public string Country { get; set; }
    }

    public class UpdatePrivacyRequest
    {
        public bool IsPrivate { get; set; }
        public bool AllowComments { get; set; }
        public bool AllowTags { get; set; }
        public bool AllowMentions { get; set; }
        public bool ShowActivityStatus { get; set; }
    }

    public class UpdateNotificationRequest
    {
        public bool EmailNotifications { get; set; }
        public bool PushNotifications { get; set; }
    }

    public class UpdateAccountRequest
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string Language { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required]
        public string OldPassword { get; set; }
        [Required]
        public string NewPassword { get; set; }
    }
}
