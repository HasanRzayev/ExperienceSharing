using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all upcoming events
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingEvents([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var now = DateTime.UtcNow;
                var events = await _context.Events
                    .Where(e => e.EventDate >= now)
                    .Include(e => e.CreatedBy)
                    .Include(e => e.Attendees)
                        .ThenInclude(a => a.User)
                    .OrderBy(e => e.EventDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var totalCount = await _context.Events.CountAsync(e => e.EventDate >= now);

                return Ok(new
                {
                    events,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    currentPage = page
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching events: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch events" });
            }
        }

        // Get my events
        [HttpGet("my-events")]
        public async Task<IActionResult> GetMyEvents()
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var events = await _context.Events
                    .Where(e => e.Attendees.Any(a => a.UserId == userId.Value) || e.CreatedByUserId == userId.Value)
                    .Include(e => e.CreatedBy)
                    .Include(e => e.Attendees)
                        .ThenInclude(a => a.User)
                    .OrderBy(e => e.EventDate)
                    .ToListAsync();

                return Ok(events);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching my events: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch events" });
            }
        }

        // Create event
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var newEvent = new Event
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Location = dto.Location,
                    Address = dto.Address,
                    EventDate = dto.EventDate,
                    EndDate = dto.EndDate,
                    CoverImage = dto.CoverImage ?? "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
                    MaxAttendees = dto.MaxAttendees,
                    Price = dto.Price,
                    Currency = dto.Currency ?? "USD",
                    Category = dto.Category ?? "Meetup",
                    CreatedByUserId = userId.Value,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Events.Add(newEvent);
                await _context.SaveChangesAsync();

                // Creator automatically becomes attendee
                var attendee = new EventAttendee
                {
                    EventId = newEvent.Id,
                    UserId = userId.Value,
                    Status = "Going",
                    RSVPDate = DateTime.UtcNow
                };

                _context.EventAttendees.Add(attendee);
                await _context.SaveChangesAsync();

                return Ok(newEvent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating event: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create event" });
            }
        }

        // RSVP to event
        [HttpPost("{eventId}/rsvp")]
        public async Task<IActionResult> RSVP(int eventId, [FromBody] RSVPDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var existingRSVP = await _context.EventAttendees
                    .FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId.Value);

                if (existingRSVP != null)
                {
                    existingRSVP.Status = dto.Status;
                    existingRSVP.RSVPDate = DateTime.UtcNow;
                }
                else
                {
                    var attendee = new EventAttendee
                    {
                        EventId = eventId,
                        UserId = userId.Value,
                        Status = dto.Status,
                        RSVPDate = DateTime.UtcNow
                    };
                    _context.EventAttendees.Add(attendee);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "RSVP updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating RSVP: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update RSVP" });
            }
        }

        private int? GetUserIdFromToken()
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
    }

    // DTOs
    public class CreateEventDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public string Address { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string CoverImage { get; set; }
        public int MaxAttendees { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public string Category { get; set; }
    }

    public class RSVPDto
    {
        public string Status { get; set; } // Going, Interested, NotGoing
    }
}

