using ExperienceProject.Data;
using ExperienceProject.Models;
using ExperienceProject.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace ExperienceProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Cloudinary _cloudinary;

        public StatusController(ApplicationDbContext context)
        {
            _context = context;
            Account account = new Account(
                "dj997ctyw",
                "278563758399669",
                "HliVZH4iQ8OjiZ_GptjlDeFuDxA");
            _cloudinary = new Cloudinary(account);
        }

        private int? GetUserIdFromToken()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader)) return null;

            var token = authHeader.Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
                return userId;

            return null;
        }

        // GET: api/Status - Get active statuses (not expired)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusResponseDto>>> GetStatuses()
        {
            var userId = GetUserIdFromToken();
            var now = DateTime.UtcNow;

            var statuses = await _context.Statuses
                .Where(s => s.ExpiresAt > now)
                .Include(s => s.User)
                .Include(s => s.Views)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = statuses.Select(s => new StatusResponseDto
            {
                Id = s.Id,
                UserId = s.UserId,
                Text = s.Text,
                ImageUrl = s.ImageUrl,
                VideoUrl = s.VideoUrl,
                ThumbnailUrl = s.ThumbnailUrl,
                CreatedAt = s.CreatedAt,
                ExpiresAt = s.ExpiresAt,
                User = s.User != null ? new UserResponseDto
                {
                    Id = s.User.Id,
                    FirstName = s.User.FirstName,
                    LastName = s.User.LastName,
                    ProfileImage = s.User.ProfileImage,
                    UserName = s.User.UserName
                } : null,
                ViewCount = s.Views?.Count ?? 0,
                IsViewed = userId.HasValue && s.Views != null && s.Views.Any(v => v.UserId == userId.Value)
            }).ToList();

            return Ok(result);
        }

        // GET: api/Status/my - Get my status
        [HttpGet("my")]
        public async Task<ActionResult<StatusResponseDto>> GetMyStatus()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var now = DateTime.UtcNow;
            var status = await _context.Statuses
                .Where(s => s.UserId == userId.Value && s.ExpiresAt > now)
                .Include(s => s.User)
                .Include(s => s.Views)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (status == null)
                return NotFound(new { message = "No active status found" });

            return Ok(new StatusResponseDto
            {
                Id = status.Id,
                UserId = status.UserId,
                Text = status.Text,
                ImageUrl = status.ImageUrl,
                VideoUrl = status.VideoUrl,
                ThumbnailUrl = status.ThumbnailUrl,
                CreatedAt = status.CreatedAt,
                ExpiresAt = status.ExpiresAt,
                User = status.User != null ? new UserResponseDto
                {
                    Id = status.User.Id,
                    FirstName = status.User.FirstName,
                    LastName = status.User.LastName,
                    ProfileImage = status.User.ProfileImage,
                    UserName = status.User.UserName
                } : null,
                ViewCount = status.Views?.Count ?? 0
            });
        }

        // POST: api/Status
        [HttpPost]
        public async Task<ActionResult<StatusResponseDto>> CreateStatus([FromForm] IFormFile? Image, [FromForm] IFormFile? Video, [FromForm] string? Text)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            if (Image == null && Video == null && string.IsNullOrEmpty(Text))
                return BadRequest(new { message = "At least one of Image, Video, or Text is required" });

            var status = new Status
            {
                UserId = userId.Value,
                Text = Text,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24) // 24 hours expiration
            };

            // Upload image if provided
            if (Image != null)
            {
                using (var stream = Image.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(Image.FileName, stream),
                        Folder = "status"
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        status.ImageUrl = uploadResult.SecureUrl.AbsoluteUri;
                    }
                }
            }

            // Upload video if provided
            if (Video != null)
            {
                using (var stream = Video.OpenReadStream())
                {
                    var uploadParams = new VideoUploadParams()
                    {
                        File = new FileDescription(Video.FileName, stream),
                        Folder = "status/videos"
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        status.VideoUrl = uploadResult.SecureUrl.AbsoluteUri;
                        
                        // Get video thumbnail
                        if (uploadResult.JsonObj["thumbnail_url"] != null)
                        {
                            status.ThumbnailUrl = uploadResult.JsonObj["thumbnail_url"].ToString();
                        }
                    }
                }
            }

            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId.Value);

            return Ok(new StatusResponseDto
            {
                Id = status.Id,
                UserId = status.UserId,
                Text = status.Text,
                ImageUrl = status.ImageUrl,
                VideoUrl = status.VideoUrl,
                ThumbnailUrl = status.ThumbnailUrl,
                CreatedAt = status.CreatedAt,
                ExpiresAt = status.ExpiresAt,
                User = user != null ? new UserResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    ProfileImage = user.ProfileImage,
                    UserName = user.UserName
                } : null
            });
        }

        // POST: api/Status/{id}/view - Mark status as viewed
        [HttpPost("{id}/view")]
        public async Task<IActionResult> ViewStatus(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var status = await _context.Statuses.FindAsync(id);
            if (status == null || status.ExpiresAt <= DateTime.UtcNow)
                return NotFound(new { message = "Status not found or expired" });

            // Check if already viewed
            var existingView = await _context.StatusViews
                .FirstOrDefaultAsync(sv => sv.StatusId == id && sv.UserId == userId.Value);

            if (existingView == null)
            {
                var view = new StatusView
                {
                    StatusId = id,
                    UserId = userId.Value,
                    ViewedAt = DateTime.UtcNow
                };
                _context.StatusViews.Add(view);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Status viewed" });
        }

        // GET: api/Status/{id}/viewers - Get viewers
        [HttpGet("{id}/viewers")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetViewers(int id)
        {
            var viewers = await _context.StatusViews
                .Where(sv => sv.StatusId == id)
                .Include(sv => sv.User)
                .Select(sv => sv.User)
                .ToListAsync();

            var result = viewers.Select(u => new UserResponseDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                ProfileImage = u.ProfileImage,
                UserName = u.UserName
            }).ToList();

            return Ok(result);
        }

        // DELETE: api/Status/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var status = await _context.Statuses.FindAsync(id);
            if (status == null)
                return NotFound(new { message = "Status not found" });

            if (status.UserId != userId.Value)
                return Forbid();

            _context.Statuses.Remove(status);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status deleted" });
        }
    }
}

