using Microsoft.AspNetCore.SignalR;
using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace ExperienceProject.Hubs
{
    public class DeviceLinkHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public DeviceLinkHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinSession(string sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{sessionId}");
        }

        public async Task LeaveSession(string sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session_{sessionId}");
        }

        public async Task ConfirmDeviceLink(string sessionId, string deviceId, string deviceName, string deviceType, string deviceInfo)
        {
            try
            {
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.IsActive);

                if (session == null || session.ExpiresAt < DateTime.UtcNow)
                {
                    await Clients.Group($"session_{sessionId}").SendAsync("DeviceLinkError", "Invalid or expired session");
                    return;
                }

                if (session.IsConfirmed)
                {
                    await Clients.Group($"session_{sessionId}").SendAsync("DeviceLinkError", "Session already confirmed");
                    return;
                }

                // Mark session as confirmed
                session.IsConfirmed = true;
                await _context.SaveChangesAsync();

                // Create device link
                var deviceLink = new DeviceLink
                {
                    UserId = session.UserId,
                    DeviceId = deviceId,
                    DeviceName = deviceName,
                    DeviceType = deviceType,
                    DeviceInfo = deviceInfo,
                    LinkedAt = DateTime.UtcNow,
                    LastSeenAt = DateTime.UtcNow,
                    IsActive = true,
                    IsTrusted = false
                };

                _context.DeviceLinks.Add(deviceLink);
                await _context.SaveChangesAsync();

                // Notify all clients in the session
                await Clients.Group($"session_{sessionId}").SendAsync("DeviceLinkConfirmed", new
                {
                    deviceId = deviceLink.Id,
                    deviceName = deviceName,
                    deviceType = deviceType,
                    linkedAt = deviceLink.LinkedAt
                });
            }
            catch (Exception ex)
            {
                await Clients.Group($"session_{sessionId}").SendAsync("DeviceLinkError", $"Error: {ex.Message}");
            }
        }

        public async Task SendQRData(string sessionId, object qrData)
        {
            await Clients.Group($"session_{sessionId}").SendAsync("QRDataReceived", qrData);
        }

        public async Task NotifySessionExpiry(string sessionId)
        {
            await Clients.Group($"session_{sessionId}").SendAsync("SessionExpired");
        }

        public async Task GetDeviceLinkStatus(string sessionId)
        {
            try
            {
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(s => s.SessionId == sessionId);

                if (session == null)
                {
                    await Clients.Caller.SendAsync("DeviceLinkStatus", new { status = "not_found" });
                    return;
                }

                if (session.ExpiresAt < DateTime.UtcNow)
                {
                    await Clients.Caller.SendAsync("DeviceLinkStatus", new { status = "expired" });
                    return;
                }

                if (session.IsConfirmed)
                {
                    await Clients.Caller.SendAsync("DeviceLinkStatus", new { status = "confirmed" });
                    return;
                }

                await Clients.Caller.SendAsync("DeviceLinkStatus", new { status = "pending" });
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("DeviceLinkError", $"Error: {ex.Message}");
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Clean up any sessions when client disconnects
            await base.OnDisconnectedAsync(exception);
        }
    }
}
