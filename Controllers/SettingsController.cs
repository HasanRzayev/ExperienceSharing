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
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized();

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound();

                // Log the request data
                Console.WriteLine($"Updating profile for user {userId}:");
                Console.WriteLine($"FirstName: {request.FirstName}");
                Console.WriteLine($"LastName: {request.LastName}");
                Console.WriteLine($"Bio: {request.Bio}");
                Console.WriteLine($"Website: {request.Website}");
                Console.WriteLine($"PhoneNumber: {request.PhoneNumber}");
                Console.WriteLine($"BirthDate: {request.BirthDate}");
                Console.WriteLine($"Gender: {request.Gender}");
                Console.WriteLine($"Country: {request.Country}");

                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.Bio = request.Bio;
                user.Website = request.Website;
                user.PhoneNumber = request.PhoneNumber;
                user.BirthDate = request.BirthDate;
                user.Gender = request.Gender;
                user.Country = request.Country;

                var result = await _context.SaveChangesAsync();
                Console.WriteLine($"SaveChangesAsync result: {result}");

                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating profile: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error updating profile", error = ex.Message });
            }
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

        // Get interaction settings
        [HttpGet("interaction")]
        public async Task<IActionResult> GetInteractionSettings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var settings = await _context.InteractionSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                // Create default settings if none exist
                settings = new InteractionSettings
                {
                    UserId = userId.Value,
                    AllowMessages = true,
                    AllowStoryReplies = true,
                    AllowTags = true,
                    AllowMentions = true,
                    AllowComments = true,
                    AllowSharing = true,
                    RestrictedAccounts = "[]",
                    HiddenWords = "[]"
                };
                _context.InteractionSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                settings.AllowMessages,
                settings.AllowStoryReplies,
                settings.AllowTags,
                settings.AllowMentions,
                settings.AllowComments,
                settings.AllowSharing,
                restrictedAccounts = System.Text.Json.JsonSerializer.Deserialize<string[]>(settings.RestrictedAccounts ?? "[]"),
                hiddenWords = System.Text.Json.JsonSerializer.Deserialize<string[]>(settings.HiddenWords ?? "[]")
            });
        }

        // Update interaction settings
        [HttpPut("interaction")]
        public async Task<IActionResult> UpdateInteractionSettings([FromBody] UpdateInteractionRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var settings = await _context.InteractionSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                settings = new InteractionSettings { UserId = userId.Value };
                _context.InteractionSettings.Add(settings);
            }

            settings.AllowMessages = request.AllowMessages;
            settings.AllowStoryReplies = request.AllowStoryReplies;
            settings.AllowTags = request.AllowTags;
            settings.AllowMentions = request.AllowMentions;
            settings.AllowComments = request.AllowComments;
            settings.AllowSharing = request.AllowSharing;
            settings.RestrictedAccounts = System.Text.Json.JsonSerializer.Serialize(request.RestrictedAccounts ?? new string[0]);
            settings.HiddenWords = System.Text.Json.JsonSerializer.Serialize(request.HiddenWords ?? new string[0]);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Interaction settings updated successfully" });
        }

        // Get content settings
        [HttpGet("content")]
        public async Task<IActionResult> GetContentSettings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var settings = await _context.ContentSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                settings = new ContentSettings
                {
                    UserId = userId.Value,
                    MutedAccounts = "[]",
                    ShowLikeCounts = true,
                    ShowShareCounts = true,
                    ContentFilter = "all",
                    AutoArchive = false
                };
                _context.ContentSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                settings.ShowLikeCounts,
                settings.ShowShareCounts,
                settings.ContentFilter,
                settings.AutoArchive,
                mutedAccounts = System.Text.Json.JsonSerializer.Deserialize<string[]>(settings.MutedAccounts ?? "[]")
            });
        }

        // Update content settings
        [HttpPut("content")]
        public async Task<IActionResult> UpdateContentSettings([FromBody] UpdateContentRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var settings = await _context.ContentSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                settings = new ContentSettings { UserId = userId.Value };
                _context.ContentSettings.Add(settings);
            }

            settings.ShowLikeCounts = request.ShowLikeCounts;
            settings.ShowShareCounts = request.ShowShareCounts;
            settings.ContentFilter = request.ContentFilter;
            settings.AutoArchive = request.AutoArchive;
            settings.MutedAccounts = System.Text.Json.JsonSerializer.Serialize(request.MutedAccounts ?? new string[0]);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Content settings updated successfully" });
        }

        // Get app settings
        [HttpGet("app")]
        public async Task<IActionResult> GetAppSettings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var settings = await _context.AppSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                settings = new AppSettings
                {
                    UserId = userId.Value,
                    Language = "en",
                    Theme = "light",
                    AutoDownload = false,
                    WebsitePermissions = true,
                    AccessibilityMode = false
                };
                _context.AppSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                settings.Language,
                settings.Theme,
                settings.AutoDownload,
                settings.WebsitePermissions,
                settings.AccessibilityMode
            });
        }

        // Update app settings
        [HttpPut("app")]
        public async Task<IActionResult> UpdateAppSettings([FromBody] UpdateAppRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var settings = await _context.AppSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                settings = new AppSettings { UserId = userId.Value };
                _context.AppSettings.Add(settings);
            }

            settings.Language = request.Language;
            settings.Theme = request.Theme;
            settings.AutoDownload = request.AutoDownload;
            settings.WebsitePermissions = request.WebsitePermissions;
            settings.AccessibilityMode = request.AccessibilityMode;

            await _context.SaveChangesAsync();

            return Ok(new { message = "App settings updated successfully" });
        }

        // Get account tools
        [HttpGet("tools")]
        public async Task<IActionResult> GetAccountTools()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var tools = await _context.AccountTools.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tools == null)
            {
                tools = new AccountTools
                {
                    UserId = userId.Value,
                    AccountType = "personal",
                    AnalyticsEnabled = false,
                    InsightsEnabled = false,
                    ProfessionalTools = false
                };
                _context.AccountTools.Add(tools);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                tools.AccountType,
                tools.AnalyticsEnabled,
                tools.InsightsEnabled,
                tools.ProfessionalTools
            });
        }

        // Update account tools
        [HttpPut("tools")]
        public async Task<IActionResult> UpdateAccountTools([FromBody] UpdateAccountToolsRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var tools = await _context.AccountTools.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tools == null)
            {
                tools = new AccountTools { UserId = userId.Value };
                _context.AccountTools.Add(tools);
            }

            tools.AccountType = request.AccountType;
            tools.AnalyticsEnabled = request.AnalyticsEnabled;
            tools.InsightsEnabled = request.InsightsEnabled;
            tools.ProfessionalTools = request.ProfessionalTools;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account tools updated successfully" });
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

    public class UpdateInteractionRequest
    {
        public bool AllowMessages { get; set; }
        public bool AllowStoryReplies { get; set; }
        public bool AllowTags { get; set; }
        public bool AllowMentions { get; set; }
        public bool AllowComments { get; set; }
        public bool AllowSharing { get; set; }
        public string[] RestrictedAccounts { get; set; }
        public string[] HiddenWords { get; set; }
    }

    public class UpdateContentRequest
    {
        public bool ShowLikeCounts { get; set; }
        public bool ShowShareCounts { get; set; }
        public string ContentFilter { get; set; }
        public bool AutoArchive { get; set; }
        public string[] MutedAccounts { get; set; }
    }

    public class UpdateAppRequest
    {
        public string Language { get; set; }
        public string Theme { get; set; }
        public bool AutoDownload { get; set; }
        public bool WebsitePermissions { get; set; }
        public bool AccessibilityMode { get; set; }
    }

    public class UpdateAccountToolsRequest
    {
        public string AccountType { get; set; }
        public bool AnalyticsEnabled { get; set; }
        public bool InsightsEnabled { get; set; }
        public bool ProfessionalTools { get; set; }
    }
}
