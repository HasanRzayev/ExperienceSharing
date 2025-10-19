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
    public class TripController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TripController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all trips for current user
        [HttpGet("my-trips")]
        public async Task<IActionResult> GetMyTrips()
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trips = await _context.Trips
                    .Where(t => t.UserId == userId.Value)
                    .Include(t => t.TripExperiences)
                        .ThenInclude(te => te.Experience)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return Ok(trips);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching trips: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch trips" });
            }
        }

        // Get single trip by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrip(int id)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trip = await _context.Trips
                    .Include(t => t.TripExperiences)
                        .ThenInclude(te => te.Experience)
                            .ThenInclude(e => e.User)
                    .Include(t => t.TripExperiences)
                        .ThenInclude(te => te.Experience)
                            .ThenInclude(e => e.ImageUrls)
                    .Include(t => t.TripCollaborators)
                        .ThenInclude(tc => tc.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (trip == null)
                {
                    return NotFound(new { error = "Trip not found" });
                }

                // Check if user has access
                if (trip.UserId != userId.Value && !trip.TripCollaborators.Any(tc => tc.UserId == userId.Value))
                {
                    return Forbid();
                }

                return Ok(trip);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching trip: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch trip" });
            }
        }

        // Create new trip
        [HttpPost]
        public async Task<IActionResult> CreateTrip([FromBody] CreateTripDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trip = new Trip
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Destination = dto.Destination,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Budget = dto.Budget,
                    Currency = dto.Currency ?? "USD",
                    CoverImage = dto.CoverImage ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
                    Status = "Planning",
                    UserId = userId.Value,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Trips.Add(trip);
                await _context.SaveChangesAsync();

                return Ok(trip);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating trip: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create trip" });
            }
        }

        // Update trip
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrip(int id, [FromBody] CreateTripDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trip = await _context.Trips.FindAsync(id);
                if (trip == null)
                {
                    return NotFound(new { error = "Trip not found" });
                }

                if (trip.UserId != userId.Value)
                {
                    return Forbid();
                }

                trip.Title = dto.Title;
                trip.Description = dto.Description;
                trip.Destination = dto.Destination;
                trip.StartDate = dto.StartDate;
                trip.EndDate = dto.EndDate;
                trip.Budget = dto.Budget;
                if (!string.IsNullOrEmpty(dto.Currency))
                    trip.Currency = dto.Currency;
                if (!string.IsNullOrEmpty(dto.CoverImage))
                    trip.CoverImage = dto.CoverImage;
                if (!string.IsNullOrEmpty(dto.Status))
                    trip.Status = dto.Status;

                await _context.SaveChangesAsync();
                return Ok(trip);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating trip: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update trip" });
            }
        }

        // Delete trip
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trip = await _context.Trips.FindAsync(id);
                if (trip == null)
                {
                    return NotFound(new { error = "Trip not found" });
                }

                if (trip.UserId != userId.Value)
                {
                    return Forbid();
                }

                _context.Trips.Remove(trip);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Trip deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting trip: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete trip" });
            }
        }

        // Add experience to trip
        [HttpPost("{tripId}/experiences/{experienceId}")]
        public async Task<IActionResult> AddExperienceToTrip(int tripId, int experienceId, [FromBody] AddExperienceDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trip = await _context.Trips.FindAsync(tripId);
                if (trip == null)
                {
                    return NotFound(new { error = "Trip not found" });
                }

                if (trip.UserId != userId.Value)
                {
                    return Forbid();
                }

                var experience = await _context.Experiences.FindAsync(experienceId);
                if (experience == null)
                {
                    return NotFound(new { error = "Experience not found" });
                }

                var tripExperience = new TripExperience
                {
                    TripId = tripId,
                    ExperienceId = experienceId,
                    OrderIndex = dto.OrderIndex,
                    Notes = dto.Notes,
                    AddedAt = DateTime.UtcNow
                };

                _context.TripExperiences.Add(tripExperience);
                await _context.SaveChangesAsync();

                return Ok(tripExperience);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding experience to trip: {ex.Message}");
                return StatusCode(500, new { error = "Failed to add experience to trip" });
            }
        }

        // Remove experience from trip
        [HttpDelete("{tripId}/experiences/{experienceId}")]
        public async Task<IActionResult> RemoveExperienceFromTrip(int tripId, int experienceId)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var trip = await _context.Trips.FindAsync(tripId);
                if (trip == null)
                {
                    return NotFound(new { error = "Trip not found" });
                }

                if (trip.UserId != userId.Value)
                {
                    return Forbid();
                }

                var tripExperience = await _context.TripExperiences
                    .FirstOrDefaultAsync(te => te.TripId == tripId && te.ExperienceId == experienceId);

                if (tripExperience == null)
                {
                    return NotFound(new { error = "Experience not found in trip" });
                }

                _context.TripExperiences.Remove(tripExperience);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Experience removed from trip" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing experience from trip: {ex.Message}");
                return StatusCode(500, new { error = "Failed to remove experience from trip" });
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
    public class CreateTripDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Currency { get; set; }
        public string CoverImage { get; set; }
        public string Status { get; set; }
    }

    public class AddExperienceDto
    {
        public int OrderIndex { get; set; }
        public string Notes { get; set; }
    }
}

