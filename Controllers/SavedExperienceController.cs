using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace ExperienceProject.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    public class SavedExperienceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SavedExperienceController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int? GetUserIdFromToken()
        {
            try
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
            catch
            {
                return null;
            }
        }



        [HttpGet("my-saved")]
        public async Task<IActionResult> GetMySavedExperiences([FromQuery] int? collectionId = null)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var query = _context.SavedExperiences
                    .Include(se => se.Experience)
                        .ThenInclude(e => e!.User)
                    .Include(se => se.Experience)
                        .ThenInclude(e => e!.ImageUrls)
                    .Include(se => se.Collection)
                    .Where(se => se.UserId == userId.Value);

                if (collectionId.HasValue)
                {
                    query = query.Where(se => se.CollectionId == collectionId.Value);
                }

                var savedExperiences = await query
                    .OrderByDescending(se => se.SavedAt)
                    .ToListAsync();

                return Ok(new
                {
                    savedExperiences,
                    totalCount = savedExperiences.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching saved experiences: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch saved experiences" });
            }
        }

        // Save an experience
        [HttpPost("{experienceId}")]
        public async Task<IActionResult> SaveExperience(int experienceId, [FromBody] SaveExperienceDto? dto = null)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                // Check if experience exists
                var experience = await _context.Experiences.FindAsync(experienceId);
                if (experience == null)
                {
                    return NotFound(new { message = "Experience not found" });
                }

                // Check if already saved
                var existingSave = await _context.SavedExperiences
                    .FirstOrDefaultAsync(se => se.UserId == userId.Value && se.ExperienceId == experienceId);

                if (existingSave != null)
                {
                    return BadRequest(new { message = "Experience already saved" });
                }

                var savedExperience = new SavedExperience
                {
                    UserId = userId.Value,
                    ExperienceId = experienceId,
                    Notes = dto?.Notes,
                    CollectionId = dto?.CollectionId
                };

                _context.SavedExperiences.Add(savedExperience);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Experience saved successfully", savedExperience });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving experience: {ex.Message}");
                return StatusCode(500, new { error = "Failed to save experience" });
            }
        }

        // Unsave an experience
        [HttpDelete("{experienceId}")]
        public async Task<IActionResult> UnsaveExperience(int experienceId)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var savedExperience = await _context.SavedExperiences
                    .FirstOrDefaultAsync(se => se.UserId == userId.Value && se.ExperienceId == experienceId);

                if (savedExperience == null)
                {
                    return NotFound(new { message = "Saved experience not found" });
                }

                _context.SavedExperiences.Remove(savedExperience);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Experience unsaved successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error unsaving experience: {ex.Message}");
                return StatusCode(500, new { error = "Failed to unsave experience" });
            }
        }

        // Check if experience is saved
        [HttpGet("check/{experienceId}")]
        public async Task<IActionResult> CheckIfSaved(int experienceId)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var isSaved = await _context.SavedExperiences
                    .AnyAsync(se => se.UserId == userId.Value && se.ExperienceId == experienceId);

                return Ok(new { isSaved });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking saved status: {ex.Message}");
                return StatusCode(500, new { error = "Failed to check saved status" });
            }
        }

        // Update saved experience notes
        [HttpPut("{experienceId}/notes")]
        public async Task<IActionResult> UpdateNotes(int experienceId, [FromBody] UpdateNotesDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var savedExperience = await _context.SavedExperiences
                    .FirstOrDefaultAsync(se => se.UserId == userId.Value && se.ExperienceId == experienceId);

                if (savedExperience == null)
                {
                    return NotFound(new { message = "Saved experience not found" });
                }

                savedExperience.Notes = dto.Notes;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Notes updated successfully", savedExperience });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating notes: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update notes" });
            }
        }

        // Move to collection
        [HttpPut("{experienceId}/collection")]
        public async Task<IActionResult> MoveToCollection(int experienceId, [FromBody] MoveToCollectionDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var savedExperience = await _context.SavedExperiences
                    .FirstOrDefaultAsync(se => se.UserId == userId.Value && se.ExperienceId == experienceId);

                if (savedExperience == null)
                {
                    return NotFound(new { message = "Saved experience not found" });
                }

                // Verify collection ownership
                if (dto.CollectionId.HasValue)
                {
                    var collection = await _context.Collections
                        .FirstOrDefaultAsync(c => c.Id == dto.CollectionId.Value && c.UserId == userId.Value);
                    
                    if (collection == null)
                    {
                        return BadRequest(new { message = "Collection not found or unauthorized" });
                    }
                }

                savedExperience.CollectionId = dto.CollectionId;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Moved to collection successfully", savedExperience });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving to collection: {ex.Message}");
                return StatusCode(500, new { error = "Failed to move to collection" });
            }
        }
    }

    // DTOs
    public class SaveExperienceDto
    {
        public string? Notes { get; set; }
        public int? CollectionId { get; set; }
    }

    public class UpdateNotesDto
    {
        public string? Notes { get; set; }
    }

    public class MoveToCollectionDto
    {
        public int? CollectionId { get; set; }
    }
}

