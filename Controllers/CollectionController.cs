using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using ExperienceProject.Models;
using System.Security.Claims;

namespace ExperienceProject.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CollectionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CollectionController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }

        // Get my collections
        [HttpGet("my-collections")]
        public async Task<IActionResult> GetMyCollections()
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var collections = await _context.Collections
                    .Include(c => c.SavedExperiences)
                        .ThenInclude(se => se.Experience)
                        .ThenInclude(e => e!.ImageUrls)
                    .Where(c => c.UserId == userId.Value)
                    .OrderByDescending(c => c.UpdatedAt)
                    .ToListAsync();

                var collectionsWithCounts = collections.Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.CoverImage,
                    c.IsPublic,
                    c.CreatedAt,
                    c.UpdatedAt,
                    ExperienceCount = c.SavedExperiences.Count,
                    // Use first experience image as cover if no cover image
                    ThumbnailImage = c.CoverImage ?? c.SavedExperiences
                        .FirstOrDefault()?.Experience?.ImageUrls?.FirstOrDefault()?.Url
                });

                return Ok(new
                {
                    collections = collectionsWithCounts,
                    totalCount = collections.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching collections: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch collections" });
            }
        }

        // Get collection by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCollection(int id)
        {
            try
            {
                var userId = GetUserIdFromToken();
                
                var collection = await _context.Collections
                    .Include(c => c.User)
                    .Include(c => c.SavedExperiences)
                        .ThenInclude(se => se.Experience)
                        .ThenInclude(e => e!.User)
                    .Include(c => c.SavedExperiences)
                        .ThenInclude(se => se.Experience)
                        .ThenInclude(e => e!.ImageUrls)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (collection == null)
                {
                    return NotFound(new { message = "Collection not found" });
                }

                // Check permissions
                if (!collection.IsPublic && collection.UserId != userId)
                {
                    return Forbid();
                }

                return Ok(collection);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching collection: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch collection" });
            }
        }

        // Create collection
        [HttpPost]
        public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var collection = new Collection
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    CoverImage = dto.CoverImage,
                    IsPublic = dto.IsPublic,
                    UserId = userId.Value
                };

                _context.Collections.Add(collection);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Collection created successfully", collection });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating collection: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create collection" });
            }
        }

        // Update collection
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCollection(int id, [FromBody] UpdateCollectionDto dto)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var collection = await _context.Collections.FindAsync(id);
                if (collection == null)
                {
                    return NotFound(new { message = "Collection not found" });
                }

                if (collection.UserId != userId.Value)
                {
                    return Forbid();
                }

                collection.Name = dto.Name ?? collection.Name;
                collection.Description = dto.Description ?? collection.Description;
                collection.CoverImage = dto.CoverImage ?? collection.CoverImage;
                collection.IsPublic = dto.IsPublic ?? collection.IsPublic;
                collection.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Collection updated successfully", collection });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating collection: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update collection" });
            }
        }

        // Delete collection
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCollection(int id)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var collection = await _context.Collections
                    .Include(c => c.SavedExperiences)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (collection == null)
                {
                    return NotFound(new { message = "Collection not found" });
                }

                if (collection.UserId != userId.Value)
                {
                    return Forbid();
                }

                // Remove collection reference from saved experiences
                foreach (var savedExp in collection.SavedExperiences)
                {
                    savedExp.CollectionId = null;
                }

                _context.Collections.Remove(collection);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Collection deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting collection: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete collection" });
            }
        }

        // Get public collections (browse)
        [AllowAnonymous]
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicCollections([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var collections = await _context.Collections
                    .Include(c => c.User)
                    .Include(c => c.SavedExperiences)
                        .ThenInclude(se => se.Experience)
                        .ThenInclude(e => e!.ImageUrls)
                    .Where(c => c.IsPublic && c.SavedExperiences.Count > 0)
                    .OrderByDescending(c => c.UpdatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var totalCount = await _context.Collections
                    .Where(c => c.IsPublic && c.SavedExperiences.Count > 0)
                    .CountAsync();

                var collectionsWithDetails = collections.Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.CreatedAt,
                    c.UpdatedAt,
                    Owner = new { c.User!.Id, c.User.UserName, c.User.ProfileImage },
                    ExperienceCount = c.SavedExperiences.Count,
                    ThumbnailImage = c.CoverImage ?? c.SavedExperiences
                        .FirstOrDefault()?.Experience?.ImageUrls?.FirstOrDefault()?.Url,
                    PreviewImages = c.SavedExperiences
                        .Take(4)
                        .Select(se => se.Experience?.ImageUrls?.FirstOrDefault()?.Url)
                        .Where(url => url != null)
                        .ToList()
                });

                return Ok(new
                {
                    collections = collectionsWithDetails,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching public collections: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch public collections" });
            }
        }
    }

    // DTOs
    public class CreateCollectionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImage { get; set; }
        public bool IsPublic { get; set; } = true;
    }

    public class UpdateCollectionDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? CoverImage { get; set; }
        public bool? IsPublic { get; set; }
    }
}

