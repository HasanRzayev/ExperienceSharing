using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public DeviceController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Generate QR code for login (no auth required - desktop is not logged in)
        [HttpPost("generate-login-qr")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateLoginQR()
        {
            try
            {
                var sessionId = Guid.NewGuid().ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(5); // 5 minute expiry

                var deviceSession = new DeviceSession
                {
                    SessionId = sessionId,
                    UserId = 0, // Will be set when mobile scans QR
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt,
                    IsConfirmed = false,
                    IsActive = true
                };

                _context.DeviceSessions.Add(deviceSession);
                await _context.SaveChangesAsync();

                var qrData = new
                {
                    sessionId = sessionId,
                    expiresAt = expiresAt,
                    action = "login_device"
                };

                return Ok(new { 
                    sessionId = sessionId,
                    qrData = qrData, 
                    expiresIn = 300 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating login QR code", error = ex.Message });
            }
        }

        // Confirm login from mobile device (mobile is logged in with token)
        [HttpPost("confirm-login")]
        [Authorize] // Mobile must be logged in
        public async Task<IActionResult> ConfirmLogin([FromBody] ConfirmLoginRequest request)
        {
            try
            {
                // Get user ID from token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(s => s.SessionId == request.SessionId && s.IsActive);

                if (session == null || session.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Invalid or expired session" });
                }

                if (session.IsConfirmed)
                {
                    return BadRequest(new { message = "Session already confirmed" });
                }

                // Update session with user ID from mobile token
                session.UserId = userId;
                session.IsConfirmed = true;
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Login confirmed successfully",
                    sessionId = session.SessionId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error confirming login", error = ex.Message });
            }
        }

        // Check if session is confirmed (polling endpoint - desktop checks)
        [HttpGet("check-session/{sessionId}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckSession(string sessionId)
        {
            try
            {
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.IsActive);

                if (session == null)
                {
                    return NotFound(new { message = "Session not found" });
                }

                if (session.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Session expired" });
                }

                if (session.IsConfirmed && session.UserId > 0)
                {
                    // Generate JWT token for desktop
                    var token = GenerateJWTToken(session.UserId);

                    return Ok(new { 
                        confirmed = true,
                        token = token,
                        userId = session.UserId
                    });
                }

                return Ok(new { confirmed = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error checking session", error = ex.Message });
            }
        }

        private string GenerateJWTToken(int userId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class ConfirmLoginRequest
    {
        public string SessionId { get; set; }
    }
}
