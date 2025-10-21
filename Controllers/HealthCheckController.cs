using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace ExperienceProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthCheckController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthCheckController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "OK",
                version = "2.0.2",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                features = new[]
                {
                    "SavedExperience",
                    "Collection",
                    "Rating",
                    "AIRecommendation"
                }
            });
        }

        [HttpGet("database")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                // Check if SavedExperiences table exists
                var hasSavedExperiences = await _context.SavedExperiences.AnyAsync();
                var hasCollections = await _context.Collections.AnyAsync();
                var hasRatings = await _context.ExperienceRatings.AnyAsync();

                return Ok(new
                {
                    status = "OK",
                    database = "Connected",
                    tables = new
                    {
                        SavedExperiences = "EXISTS",
                        Collections = "EXISTS",
                        ExperienceRatings = "EXISTS"
                    },
                    counts = new
                    {
                        savedExperiences = await _context.SavedExperiences.CountAsync(),
                        collections = await _context.Collections.CountAsync(),
                        ratings = await _context.ExperienceRatings.CountAsync()
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "ERROR",
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [Authorize]
        [HttpGet("auth-test")]
        public IActionResult TestAuth()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                var allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();

                return Ok(new
                {
                    status = "AUTHENTICATED",
                    userId = userId,
                    email = email,
                    claims = allClaims,
                    message = "Token is valid and user is authenticated!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "ERROR",
                    message = ex.Message
                });
            }
        }

        [HttpGet("token-debug")]
        public IActionResult TokenDebug()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    return Ok(new
                    {
                        status = "NO_AUTH_HEADER",
                        message = "No Authorization header found",
                        headers = Request.Headers.Select(h => new { h.Key, Value = h.Value.ToString() }).ToList()
                    });
                }

                var token = authHeader.Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                
                if (!handler.CanReadToken(token))
                {
                    return Ok(new
                    {
                        status = "INVALID_TOKEN_FORMAT",
                        message = "Token cannot be read",
                        tokenPreview = token.Substring(0, Math.Min(50, token.Length)) + "..."
                    });
                }

                var jwtToken = handler.ReadJwtToken(token);
                var claims = jwtToken.Claims.Select(c => new { c.Type, c.Value }).ToList();

                return Ok(new
                {
                    status = "TOKEN_READABLE",
                    message = "Token can be read but authentication might fail",
                    tokenPreview = token.Substring(0, 30) + "...",
                    issuer = jwtToken.Issuer,
                    audience = jwtToken.Audiences.FirstOrDefault(),
                    expires = jwtToken.ValidTo,
                    isExpired = jwtToken.ValidTo < DateTime.UtcNow,
                    claims = claims,
                    expectedIssuer = "ExperienceSharingApp",
                    expectedAudience = "ExperienceSharingUsers"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "ERROR",
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}

