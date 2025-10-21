using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExperienceProject.Services;
using System.Security.Claims;

namespace ExperienceProject.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AIRecommendationController : ControllerBase
    {
        private readonly AIRecommendationService _aiService;

        public AIRecommendationController(AIRecommendationService aiService)
        {
            _aiService = aiService;
        }

        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }

        // Get personalized recommendations
        [HttpGet("for-you")]
        public async Task<IActionResult> GetRecommendations([FromQuery] int count = 10)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var recommendations = await _aiService.GetPersonalizedRecommendations(userId.Value, count);

                return Ok(new
                {
                    recommendations,
                    totalCount = recommendations.Count,
                    message = "Powered by AI 🤖"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recommendations: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get recommendations" });
            }
        }
    }
}

