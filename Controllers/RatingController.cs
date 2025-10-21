using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace ExperienceProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RatingController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int? GetUserIdFromToken()
        {
            try
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
            catch
            {
                return null;
            }
        }

        // Get ratings for an experience
        [AllowAnonymous]
        [HttpGet("experience/{experienceId}")]
        public async Task<IActionResult> GetRatings(int experienceId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var ratings = await _context.ExperienceRatings
                    .Include(r => r.User)
                    .Where(r => r.ExperienceId == experienceId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var totalCount = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId)
                    .CountAsync();

                // Calculate averages
                var avgOverall = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId)
                    .AverageAsync(r => (double?)r.OverallRating) ?? 0;

                var avgLocation = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId && r.LocationRating.HasValue)
                    .AverageAsync(r => (double?)r.LocationRating) ?? 0;

                var avgValue = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId && r.ValueRating.HasValue)
                    .AverageAsync(r => (double?)r.ValueRating) ?? 0;

                var avgService = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId && r.ServiceRating.HasValue)
                    .AverageAsync(r => (double?)r.ServiceRating) ?? 0;

                var avgCleanliness = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId && r.CleanlinessRating.HasValue)
                    .AverageAsync(r => (double?)r.CleanlinessRating) ?? 0;

                var avgAccuracy = await _context.ExperienceRatings
                    .Where(r => r.ExperienceId == experienceId && r.AccuracyRating.HasValue)
                    .AverageAsync(r => (double?)r.AccuracyRating) ?? 0;

                return Ok(new
                {
                    ratings,
                    totalCount,
                    averages = new
                    {
                        overall = Math.Round(avgOverall, 1),
                        location = Math.Round(avgLocation, 1),
                        value = Math.Round(avgValue, 1),
                        service = Math.Round(avgService, 1),
                        cleanliness = Math.Round(avgCleanliness, 1),
                        accuracy = Math.Round(avgAccuracy, 1)
                    },
                    page,
                    pageSize
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching ratings: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch ratings" });
            }
        }

        // Submit or update rating
        [HttpPost("experience/{experienceId}")]
        public async Task<IActionResult> SubmitRating(int experienceId, [FromBody] RatingDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null) return Unauthorized();

                var experience = await _context.Experiences.FindAsync(experienceId);
                if (experience == null) return NotFound(new { message = "Experience not found" });

                var existingRating = await _context.ExperienceRatings
                    .FirstOrDefaultAsync(r => r.ExperienceId == experienceId && r.UserId == userId.Value);

                if (existingRating != null)
                {
                    // Update existing
                    existingRating.OverallRating = dto.OverallRating;
                    existingRating.LocationRating = dto.LocationRating;
                    existingRating.ValueRating = dto.ValueRating;
                    existingRating.ServiceRating = dto.ServiceRating;
                    existingRating.CleanlinessRating = dto.CleanlinessRating;
                    existingRating.AccuracyRating = dto.AccuracyRating;
                    existingRating.Review = dto.Review;
                    existingRating.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new
                    var rating = new ExperienceRating
                    {
                        ExperienceId = experienceId,
                        UserId = userId.Value,
                        OverallRating = dto.OverallRating,
                        LocationRating = dto.LocationRating,
                        ValueRating = dto.ValueRating,
                        ServiceRating = dto.ServiceRating,
                        CleanlinessRating = dto.CleanlinessRating,
                        AccuracyRating = dto.AccuracyRating,
                        Review = dto.Review
                    };
                    _context.ExperienceRatings.Add(rating);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Rating submitted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error submitting rating: {ex.Message}");
                return StatusCode(500, new { error = "Failed to submit rating" });
            }
        }

        // Mark rating as helpful
        [HttpPost("{ratingId}/helpful")]
        public async Task<IActionResult> MarkHelpful(int ratingId)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null) return Unauthorized();

                var rating = await _context.ExperienceRatings.FindAsync(ratingId);
                if (rating == null) return NotFound();

                var existing = await _context.RatingHelpfuls
                    .FirstOrDefaultAsync(rh => rh.RatingId == ratingId && rh.UserId == userId.Value);

                if (existing != null)
                {
                    _context.RatingHelpfuls.Remove(existing);
                    rating.HelpfulCount--;
                }
                else
                {
                    _context.RatingHelpfuls.Add(new RatingHelpful
                    {
                        RatingId = ratingId,
                        UserId = userId.Value
                    });
                    rating.HelpfulCount++;
                }

                await _context.SaveChangesAsync();
                return Ok(new { helpfulCount = rating.HelpfulCount });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error marking helpful: {ex.Message}");
                return StatusCode(500, new { error = "Failed to mark helpful" });
            }
        }
    }

    public class RatingDto
    {
        public int OverallRating { get; set; }
        public int? LocationRating { get; set; }
        public int? ValueRating { get; set; }
        public int? ServiceRating { get; set; }
        public int? CleanlinessRating { get; set; }
        public int? AccuracyRating { get; set; }
        public string? Review { get; set; }
    }
}

