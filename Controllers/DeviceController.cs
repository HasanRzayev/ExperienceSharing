using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Claims;

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
            var userIdClaim = Request.Headers["X-User-Id"].FirstOrDefault();
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return 0;
        }

        [HttpPost("generate-login-qr")]
        public async Task<IActionResult> GenerateQRCode()
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized("User ID not found in headers");
                }

                var sessionId = Guid.NewGuid().ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(5); // 5 minute expiry

                var deviceSession = new DeviceSession
                {
                    SessionId = sessionId,
                    UserId = userId,
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
                    userId = userId,
                    expiresAt = expiresAt,
                    action = "link_device"
                };

                return Ok(new { qrData = qrData, expiresIn = 300 });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating QR code", error = ex.Message });
            }
        }

        [HttpPost("confirm-link")]
        public async Task<IActionResult> ConfirmDeviceLink([FromBody] ConfirmDeviceLinkRequest request)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized("User ID not found in headers");
                }

                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(s => s.SessionId == request.SessionId && s.IsActive);

                if (session == null || session.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest("Invalid or expired session");
                }

                if (session.IsConfirmed)
                {
                    return BadRequest("Session already confirmed");
                }

                // Mark session as confirmed
                session.IsConfirmed = true;
                await _context.SaveChangesAsync();

                // Create device link
                var deviceLink = new DeviceLink
                {
                    UserId = userId,
                    DeviceId = request.DeviceId,
                    DeviceName = request.DeviceName,
                    DeviceType = request.DeviceType,
                    DeviceInfo = request.DeviceInfo,
                    LastIPAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
                    LinkedAt = DateTime.UtcNow,
                    LastSeenAt = DateTime.UtcNow,
                    IsActive = true,
                    IsTrusted = false
                };

                _context.DeviceLinks.Add(deviceLink);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Device linked successfully", deviceId = deviceLink.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error confirming device link", error = ex.Message });
            }
        }

        [HttpGet("linked-devices")]
        public async Task<IActionResult> GetLinkedDevices()
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized("User ID not found in headers");
                }

                var devices = await _context.DeviceLinks
                    .Where(d => d.UserId == userId && d.IsActive)
                    .OrderByDescending(d => d.LastSeenAt)
                    .Select(d => new
                    {
                        id = d.Id,
                        deviceId = d.DeviceId,
                        deviceName = d.DeviceName,
                        deviceType = d.DeviceType,
                        deviceInfo = d.DeviceInfo,
                        lastIPAddress = d.LastIPAddress,
                        linkedAt = d.LinkedAt,
                        lastSeenAt = d.LastSeenAt,
                        isTrusted = d.IsTrusted
                    })
                    .ToListAsync();

                return Ok(devices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching linked devices", error = ex.Message });
            }
        }

        [HttpDelete("unlink/{deviceId}")]
        public async Task<IActionResult> UnlinkDevice(int deviceId)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized("User ID not found in headers");
                }

                var device = await _context.DeviceLinks
                    .FirstOrDefaultAsync(d => d.Id == deviceId && d.UserId == userId);

                if (device == null)
                {
                    return NotFound("Device not found");
                }

                device.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Device unlinked successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error unlinking device", error = ex.Message });
            }
        }

        [HttpPut("trust/{deviceId}")]
        public async Task<IActionResult> UpdateDeviceTrust(int deviceId, [FromBody] UpdateTrustRequest request)
        {
            try
            {
                var userId = GetUserIdFromHeader();
                if (userId == 0)
                {
                    return Unauthorized("User ID not found in headers");
                }

                var device = await _context.DeviceLinks
                    .FirstOrDefaultAsync(d => d.Id == deviceId && d.UserId == userId);

                if (device == null)
                {
                    return NotFound("Device not found");
                }

                device.IsTrusted = request.IsTrusted;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Device trust status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating device trust", error = ex.Message });
            }
        }
    }

    public class ConfirmDeviceLinkRequest
    {
        public string SessionId { get; set; }
        public string DeviceId { get; set; }
        public string DeviceName { get; set; }
        public string DeviceType { get; set; }
        public string DeviceInfo { get; set; }
    }

    public class UpdateTrustRequest
    {
        public bool IsTrusted { get; set; }
    }
}
