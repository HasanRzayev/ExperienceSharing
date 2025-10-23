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

        // Join a device linking session
        public async Task JoinSession(string sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            Console.WriteLine($"Client {Context.ConnectionId} joined session {sessionId}");
        }

        // Leave a device linking session
        public async Task LeaveSession(string sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
            Console.WriteLine($"Client {Context.ConnectionId} left session {sessionId}");
        }

        // Confirm device link from QR scan
        public async Task ConfirmDeviceLink(string sessionId, int userId, string deviceName, string deviceType)
        {
            try
            {
                // Find the session
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(ds => ds.SessionId == sessionId && ds.IsActive);

                if (session == null)
                {
                    await Clients.Caller.SendAsync("DeviceLinkError", "Session not found or expired");
                    return;
                }

                if (session.ExpiresAt < DateTime.UtcNow)
                {
                    await Clients.Caller.SendAsync("DeviceLinkError", "Session has expired");
                    return;
                }

                if (session.IsConfirmed)
                {
                    await Clients.Caller.SendAsync("DeviceLinkError", "Session already confirmed");
                    return;
                }

                // Confirm the session
                session.IsConfirmed = true;
                await _context.SaveChangesAsync();

                // Notify all clients in the session
                await Clients.Group(sessionId).SendAsync("DeviceLinkConfirmed", new
                {
                    sessionId = sessionId,
                    userId = userId,
                    deviceName = deviceName,
                    deviceType = deviceType,
                    confirmedAt = DateTime.UtcNow
                });

                Console.WriteLine($"Device link confirmed for session {sessionId} by user {userId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error confirming device link: {ex.Message}");
                await Clients.Caller.SendAsync("DeviceLinkError", "Failed to confirm device link");
            }
        }

        // Send QR code data to session
        public async Task SendQRData(string sessionId, object qrData)
        {
            await Clients.Group(sessionId).SendAsync("QRDataGenerated", qrData);
        }

        // Notify session expiry
        public async Task NotifySessionExpiry(string sessionId)
        {
            await Clients.Group(sessionId).SendAsync("SessionExpired");
        }

        // Get device linking status
        public async Task GetDeviceLinkStatus(string sessionId)
        {
            try
            {
                var session = await _context.DeviceSessions
                    .FirstOrDefaultAsync(ds => ds.SessionId == sessionId && ds.IsActive);

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

                await Clients.Caller.SendAsync("DeviceLinkStatus", new { 
                    status = "waiting", 
                    expiresAt = session.ExpiresAt 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting device link status: {ex.Message}");
                await Clients.Caller.SendAsync("DeviceLinkError", "Failed to get device link status");
            }
        }

        // Override connection events
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
