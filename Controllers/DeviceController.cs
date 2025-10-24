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

        public DeviceController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserIdFromHeader()
        {
            // First try to get from JWT token - check different claim names
            var userIdClaim = User.FindFirst("nameidentifier")?.Value ?? 
                             User.FindFirst("sub")?.Value ?? 
                             User.FindFirst("user_id")?.Value ??
                             User.FindFirst("id")?.Value;
                             
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }

            // Fallback to header
            var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
            if (int.TryParse(userIdHeader, out int userIdFromHeader))
            {
                return userIdFromHeader;
            }
            
            return 0;
        }

        // Public endpoint for generating QR code for login (no auth required)
        [HttpPost("generate-login-qr-public")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateLoginQRCodePublic()
        {
            try
            {
                var sessionId = Guid.NewGuid().ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(5); // 5 minute expiry

                var deviceSession = new DeviceSession
                {
                    SessionId = sessionId,
                    UserId = 0, // Will be set when user scans QR
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

                return Ok(new { qrData = qrData, expiresIn = 300 });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating login QR code", error = ex.Message });
            }
        }

        // Public endpoint for confirming login (mobile app sends userId)
        [HttpPost("confirm-login")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmLogin([FromBody] ConfirmLoginRequest request)
        {
            try
            {
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(s => s.SessionId == request.SessionId && s.IsActive);

                if (session == null || session.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Invalid or expired session" });
                }

                // Update session with user ID
                session.UserId = request.UserId;

                // Generate JWT token for the new device
                var token = GenerateJWTToken(request.UserId, request.UserName, request.Email);

                // Mark session as confirmed
                session.IsConfirmed = true;
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Login successful", 
                    token = token,
                    user = new {
                        id = request.UserId,
                        username = request.UserName,
                        email = request.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error confirming login", error = ex.Message });
            }
        }

        private string GenerateJWTToken(int userId, string userName, string email)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-secret-key-that-is-at-least-32-characters-long"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, userName),
                new Claim(ClaimTypes.Email, email)
            };

            var token = new JwtSecurityToken(
                issuer: "ExperienceProject",
                audience: "ExperienceProject",
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
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
    }
}
