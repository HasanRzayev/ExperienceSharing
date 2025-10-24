using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("GetProfile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Get user from database
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new
                {
                    id = user.Id,
                    userName = user.UserName,
                    email = user.Email,
                    fullName = $"{user.FirstName} {user.LastName}",
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    profileImage = user.ProfileImage,
                    country = user.Country
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting profile", error = ex.Message });
            }
        }
    }
}

