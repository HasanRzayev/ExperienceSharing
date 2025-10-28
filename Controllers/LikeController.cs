using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExperienceProject.Controllers
{
    [Route("api/Like")]
    [ApiController]
    public class LikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> LikeExperience(int id)
        {
            try
            {
                await _context.SaveChangesAsync();
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Token'da kullanıcı ID'si bulunamadı." });
                }

                Console.WriteLine($"User ID: {userId}, Experience ID: {id}");

                var experience = await _context.Experiences.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
                if (experience == null)
                {
                    return NotFound(new { message = "Deneyim bulunamadı." });
                }


                Console.WriteLine("Deneyim bulundu. Like/unlike işlemine devam ediliyor...");

                var existingLike = await _context.Likes.FirstOrDefaultAsync(l => l.UserId == userId.Value && l.ExperienceId == id);
                if (existingLike != null)
                {
                    _context.Likes.Remove(existingLike);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Like başarıyla kaldırıldı." });
                }

                var like = new Like { UserId = userId.Value, ExperienceId = id };
                _context.Likes.Add(like);

                var user = await _context.Users.FindAsync(userId.Value);
                var notification = new Notification
                {
                    UserId = experience.UserId,
                    Type = "like",
                    Message = $"{user?.FirstName} {user?.LastName} liked your experience '{experience.Title}'",
                    FromUserId = userId.Value,
                    ExperienceId = id,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Like başarıyla eklendi." });
              
                }
                catch (DbUpdateException ex)
                {
                    Console.WriteLine("Veritabanına kaydetme işlemi sırasında bir hata oluştu: " + ex.InnerException?.Message);
                    return StatusCode(500, new { message = "Bir hata oluştu.", details = ex.InnerException?.Message });
                
                Console.WriteLine($"Hata: {ex.Message}");
                return StatusCode(500, new { message = "Bir hata oluştu.", details = ex.Message });
            }
        }


        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetLikeStatus(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var isLiked = await _context.Likes.AnyAsync(l => l.UserId == userId.Value && l.ExperienceId == id);
            return Ok(new { isLiked });
        }

        [HttpGet("user/{userId}/liked-experiences")]
        public async Task<IActionResult> GetUserLikedExperiences(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                Console.WriteLine($"Fetching liked experiences for user {userId}, page {page}, pageSize {pageSize}");
                
                var likedExperiences = await _context.Likes
                    .Where(l => l.UserId == userId)
                    .Include(l => l.Experience)
                        .ThenInclude(e => e.User)
                    .Include(l => l.Experience)
                        .ThenInclude(e => e.ImageUrls)
                    .OrderByDescending(l => l.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(l => l.Experience)
                    .ToListAsync();

                var totalCount = await _context.Likes.CountAsync(l => l.UserId == userId);

                Console.WriteLine($"Found {likedExperiences.Count} liked experiences for user {userId}");

                return Ok(new
                {
                    experiences = likedExperiences,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    currentPage = page
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching liked experiences: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch liked experiences", details = ex.Message });
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
}
