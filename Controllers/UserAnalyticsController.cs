using Experience.Models;
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
    public class UserAnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserAnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-stats")]
        public async Task<IActionResult> GetMyStats()
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Get user's experiences
                var experiences = await _context.Experiences
                    .Where(e => e.UserId == userId.Value)
                    .ToListAsync();

                // Get total likes on user's experiences
                var totalLikes = await _context.Likes
                    .Where(l => experiences.Select(e => e.Id).Contains(l.ExperienceId))
                    .CountAsync();

                // Get total comments on user's experiences
                var totalComments = await _context.Comments
                    .Where(c => experiences.Select(e => e.Id).Contains(c.ExperienceId))
                    .CountAsync();

                // Get followers count
                var followersCount = await _context.Follows
                    .CountAsync(f => f.FollowedId == userId.Value);

                // Get following count
                var followingCount = await _context.Follows
                    .CountAsync(f => f.FollowerId == userId.Value);

                // Get most liked experience
                var mostLikedExperience = await _context.Experiences
                    .Where(e => e.UserId == userId.Value)
                    .Select(e => new
                    {
                        e.Id,
                        e.Title,
                        e.Location,
                        e.Date,
                        LikesCount = _context.Likes.Count(l => l.ExperienceId == e.Id)
                    })
                    .OrderByDescending(e => e.LikesCount)
                    .FirstOrDefaultAsync();

                // Get monthly stats (last 6 months)
                var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
                var monthlyStats = await _context.Experiences
                    .Where(e => e.UserId == userId.Value && e.Date >= sixMonthsAgo)
                    .GroupBy(e => new { e.Date.Year, e.Date.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Count = g.Count()
                    })
                    .OrderBy(s => s.Year).ThenBy(s => s.Month)
                    .ToListAsync();

                return Ok(new
                {
                    totalExperiences = experiences.Count,
                    totalLikes,
                    totalComments,
                    followersCount,
                    followingCount,
                    mostLikedExperience,
                    monthlyStats,
                    averageRating = experiences.Any() ? experiences.Average(e => e.Rating) : 0,
                    engagementRate = experiences.Count > 0 
                        ? ((totalLikes + totalComments) / (double)experiences.Count) 
                        : 0
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching user analytics: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch analytics" });
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

