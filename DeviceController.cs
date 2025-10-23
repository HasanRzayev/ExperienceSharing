using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Cryptography;
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

        // Get user ID from JWT token
        private int GetUserIdFromHeader()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                try
                {
                    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    var jsonToken = handler.ReadJwtToken(token);
                    var userIdClaim = jsonToken.Claims.FirstOrDefault(x => x.Type == "nameid");
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                    {
                        return userId;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing JWT token: {ex.Message}");
                }
            }
            return 0;
        }

        // Generate unique session ID
        private string GenerateSessionId()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var bytes = new byte[32];
                rng.GetBytes(bytes);
                return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
            }
        }

        // Generate QR code data for device linking
        [HttpPost("generate-qr")]
        public async Task<IActionResult> GenerateQRCode([FromBody] GenerateQRRequest request)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Clean up expired sessions
                var expiredSessions = await _context.DeviceSessions
                    .Where(ds => ds.ExpiresAt < DateTime.UtcNow)
                    .ToListAsync();
                
                if (expiredSessions.Any())
                {
                    _context.DeviceSessions.RemoveRange(expiredSessions);
                    await _context.SaveChangesAsync();
                }

                // Generate new session
                var sessionId = GenerateSessionId();
                var session = new DeviceSession
                {
                    SessionId = sessionId,
                    UserId = userId,
                    DeviceName = request.DeviceName ?? "Unknown Device",
                    DeviceType = request.DeviceType ?? "unknown",
                    DeviceInfo = request.DeviceInfo ?? "",
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(10), // 10 minutes expiry
                    IsConfirmed = false,
                    IsActive = true
                };

                _context.DeviceSessions.Add(session);
                await _context.SaveChangesAsync();

                // Generate QR code data
                var qrData = new
                {
                    sessionId = sessionId,
                    userId = userId,
                    timestamp = DateTime.UtcNow.Ticks,
                    action = "device_link"
                };

                return Ok(new
                {
                    sessionId = sessionId,
                    qrData = qrData,
                    expiresAt = session.ExpiresAt,
                    message = "QR code generated successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating QR code: {ex.Message}");
                return StatusCode(500, new { message = "Failed to generate QR code" });
            }
        }

        // Confirm device link from QR scan
        [HttpPost("confirm-link")]
        public async Task<IActionResult> ConfirmDeviceLink([FromBody] ConfirmLinkRequest request)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Find the session
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(ds => ds.SessionId == request.SessionId && ds.IsActive);

                if (session == null)
                {
                    return NotFound(new { message = "Session not found or expired" });
                }

                if (session.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Session has expired" });
                }

                if (session.IsConfirmed)
                {
                    return BadRequest(new { message = "Session already confirmed" });
                }

                // Confirm the session
                session.IsConfirmed = true;
                await _context.SaveChangesAsync();

                // Create device link
                var deviceId = GenerateSessionId(); // Generate unique device ID
                var deviceLink = new DeviceLink
                {
                    UserId = userId,
                    DeviceId = deviceId,
                    DeviceName = request.DeviceName ?? "Linked Device",
                    DeviceType = request.DeviceType ?? "unknown",
                    DeviceInfo = request.DeviceInfo ?? "",
                    LastIPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    LinkedAt = DateTime.UtcNow,
                    LastSeenAt = DateTime.UtcNow,
                    IsActive = true,
                    IsTrusted = false
                };

                _context.DeviceLinks.Add(deviceLink);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    deviceId = deviceId,
                    message = "Device linked successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error confirming device link: {ex.Message}");
                return StatusCode(500, new { message = "Failed to confirm device link" });
            }
        }

        // Get user's linked devices
        [HttpGet("linked-devices")]
        public async Task<IActionResult> GetLinkedDevices()
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var devices = await _context.DeviceLinks
                    .Where(dl => dl.UserId == userId && dl.IsActive)
                    .OrderByDescending(dl => dl.LastSeenAt)
                    .Select(dl => new
                    {
                        id = dl.Id,
                        deviceId = dl.DeviceId,
                        deviceName = dl.DeviceName,
                        deviceType = dl.DeviceType,
                        deviceInfo = dl.DeviceInfo,
                        lastSeenAt = dl.LastSeenAt,
                        linkedAt = dl.LinkedAt,
                        isTrusted = dl.IsTrusted,
                        lastIPAddress = dl.LastIPAddress
                    })
                    .ToListAsync();

                return Ok(new { devices = devices });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting linked devices: {ex.Message}");
                return StatusCode(500, new { message = "Failed to get linked devices" });
            }
        }

        // Unlink a device
        [HttpDelete("unlink/{deviceId}")]
        public async Task<IActionResult> UnlinkDevice(string deviceId)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var device = await _context.DeviceLinks
                    .FirstOrDefaultAsync(dl => dl.DeviceId == deviceId && dl.UserId == userId);

                if (device == null)
                {
                    return NotFound(new { message = "Device not found" });
                }

                device.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Device unlinked successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error unlinking device: {ex.Message}");
                return StatusCode(500, new { message = "Failed to unlink device" });
            }
        }

        // Update device trust status
        [HttpPut("trust/{deviceId}")]
        public async Task<IActionResult> UpdateDeviceTrust(string deviceId, [FromBody] UpdateTrustRequest request)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var device = await _context.DeviceLinks
                    .FirstOrDefaultAsync(dl => dl.DeviceId == deviceId && dl.UserId == userId);

                if (device == null)
                {
                    return NotFound(new { message = "Device not found" });
                }

                device.IsTrusted = request.IsTrusted;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Device trust status updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating device trust: {ex.Message}");
                return StatusCode(500, new { message = "Failed to update device trust" });
            }
        }
    }

    // Request models
    public class GenerateQRRequest
    {
        public string DeviceName { get; set; }
        public string DeviceType { get; set; }
        public string DeviceInfo { get; set; }
    }

    public class ConfirmLinkRequest
    {
        public string SessionId { get; set; }
        public string DeviceName { get; set; }
        public string DeviceType { get; set; }
        public string DeviceInfo { get; set; }
    }

    public class UpdateTrustRequest
    {
        public bool IsTrusted { get; set; }
    }
}
