using Experience.Models;
using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==================== STATS ====================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalExperiences = await _context.Experiences.CountAsync();
                var totalComments = await _context.Comments.CountAsync();
                var totalLikes = await _context.Likes.CountAsync();
                var totalFollows = await _context.Follows.CountAsync();
                var totalTags = await _context.Tags.CountAsync();

                return Ok(new
                {
                    totalUsers,
                    totalExperiences,
                    totalComments,
                    totalLikes,
                    totalFollows,
                    totalTags
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching stats: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch statistics" });
            }
        }

        // ==================== USERS ====================
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 1000, [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Users.AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => 
                        u.FirstName.Contains(search) || 
                        u.LastName.Contains(search) || 
                        u.Email.Contains(search) || 
                        u.UserName.Contains(search));
                }

                var total = await query.CountAsync();
                var users = await query
                    .OrderBy(u => u.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = users,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching users: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch users" });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            try
            {
                var user = new User
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    UserName = dto.UserName,
                    ProfileImage = dto.ProfileImage ?? "https://via.placeholder.com/150",
                    Country = dto.Country ?? "Unknown",
                    PasswordHash = HashPassword("Password123!")
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating user: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create user" });
            }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] CreateUserDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { error = "User not found" });

                user.FirstName = dto.FirstName;
                user.LastName = dto.LastName;
                user.Email = dto.Email;
                user.UserName = dto.UserName;
                if (!string.IsNullOrEmpty(dto.ProfileImage))
                    user.ProfileImage = dto.ProfileImage;
                if (!string.IsNullOrEmpty(dto.Country))
                    user.Country = dto.Country;

                await _context.SaveChangesAsync();
                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update user" });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { error = "User not found" });

                // Don't delete admin user
                if (user.Email == "admin@wanderly.com")
                    return BadRequest(new { error = "Cannot delete admin user" });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting user: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete user" });
            }
        }

        // ==================== EXPERIENCES ====================
        [HttpGet("experiences")]
        public async Task<IActionResult> GetExperiences([FromQuery] int page = 1, [FromQuery] int pageSize = 1000, [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Experiences
                    .Include(e => e.User)
                    .Include(e => e.ImageUrls)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(e => 
                        e.Title.Contains(search) || 
                        e.Description.Contains(search) || 
                        e.Location.Contains(search));
                }

                var total = await query.CountAsync();
                var experiences = await query
                    .OrderByDescending(e => e.Date)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = experiences,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching experiences: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch experiences" });
            }
        }

        [HttpPost("experiences")]
        public async Task<IActionResult> CreateExperience([FromBody] CreateExperienceDto dto)
        {
            try
            {
                var experience = new ExperienceModel
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Location = dto.Location,
                    Date = dto.Date ?? DateTime.UtcNow,
                    Rating = dto.Rating,
                    UserId = dto.UserId > 0 ? dto.UserId : 1 // Default to admin
                };

                _context.Experiences.Add(experience);
                await _context.SaveChangesAsync();

                return Ok(experience);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating experience: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create experience" });
            }
        }

        [HttpPut("experiences/{id}")]
        public async Task<IActionResult> UpdateExperience(int id, [FromBody] CreateExperienceDto dto)
        {
            try
            {
                var experience = await _context.Experiences.FindAsync(id);
                if (experience == null)
                    return NotFound(new { error = "Experience not found" });

                experience.Title = dto.Title;
                experience.Description = dto.Description;
                experience.Location = dto.Location;
                if (dto.Date.HasValue)
                    experience.Date = dto.Date.Value;
                experience.Rating = dto.Rating;

                await _context.SaveChangesAsync();
                return Ok(experience);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating experience: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update experience" });
            }
        }

        [HttpDelete("experiences/{id}")]
        public async Task<IActionResult> DeleteExperience(int id)
        {
            try
            {
                var experience = await _context.Experiences.FindAsync(id);
                if (experience == null)
                    return NotFound(new { error = "Experience not found" });

                _context.Experiences.Remove(experience);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Experience deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting experience: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete experience" });
            }
        }

        // ==================== COMMENTS ====================
        [HttpGet("comments")]
        public async Task<IActionResult> GetComments([FromQuery] int page = 1, [FromQuery] int pageSize = 1000, [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Comments
                    .Include(c => c.User)
                    .Include(c => c.Experience)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c => c.Content.Contains(search));
                }

                var total = await query.CountAsync();
                var comments = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = comments,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching comments: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch comments" });
            }
        }

        [HttpPost("comments")]
        public async Task<IActionResult> CreateComment([FromBody] CreateCommentDto dto)
        {
            try
            {
                var comment = new Comment
                {
                    Content = dto.Content,
                    UserId = dto.UserId,
                    ExperienceId = dto.ExperienceId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                return Ok(comment);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating comment: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create comment" });
            }
        }

        [HttpPut("comments/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] CreateCommentDto dto)
        {
            try
            {
                var comment = await _context.Comments.FindAsync(id);
                if (comment == null)
                    return NotFound(new { error = "Comment not found" });

                comment.Content = dto.Content;

                await _context.SaveChangesAsync();
                return Ok(comment);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating comment: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update comment" });
            }
        }

        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                var comment = await _context.Comments.FindAsync(id);
                if (comment == null)
                    return NotFound(new { error = "Comment not found" });

                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting comment: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete comment" });
            }
        }

        // ==================== LIKES ====================
        [HttpGet("likes")]
        public async Task<IActionResult> GetLikes([FromQuery] int page = 1, [FromQuery] int pageSize = 1000, [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Likes
                    .Include(l => l.User)
                    .Include(l => l.Experience)
                    .AsQueryable();

                var total = await query.CountAsync();
                var likes = await query
                    .OrderByDescending(l => l.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = likes,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching likes: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch likes" });
            }
        }

        [HttpDelete("likes/{id}")]
        public async Task<IActionResult> DeleteLike(int id)
        {
            try
            {
                var like = await _context.Likes.FindAsync(id);
                if (like == null)
                    return NotFound(new { error = "Like not found" });

                _context.Likes.Remove(like);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Like deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting like: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete like" });
            }
        }

        // ==================== FOLLOWS ====================
        [HttpGet("follows")]
        public async Task<IActionResult> GetFollows([FromQuery] int page = 1, [FromQuery] int pageSize = 1000, [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Follows
                    .Include(f => f.Follower)
                    .Include(f => f.Followed)
                    .AsQueryable();

                var total = await query.CountAsync();
                var follows = await query
                    .OrderByDescending(f => f.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = follows,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching follows: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch follows" });
            }
        }

        [HttpDelete("follows/{id}")]
        public async Task<IActionResult> DeleteFollow(int id)
        {
            try
            {
                var follow = await _context.Follows.FindAsync(id);
                if (follow == null)
                    return NotFound(new { error = "Follow not found" });

                _context.Follows.Remove(follow);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Follow deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting follow: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete follow" });
            }
        }

        // ==================== TAGS ====================
        [HttpGet("tags")]
        public async Task<IActionResult> GetTags([FromQuery] int page = 1, [FromQuery] int pageSize = 1000, [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Tags.AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t => t.TagName.Contains(search));
                }

                var total = await query.CountAsync();
                var tags = await query
                    .OrderBy(t => t.TagName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new
                    {
                        id = t.TagId,
                        name = t.TagName,
                        color = "#3B82F6", // Default blue color
                        createdAt = DateTime.UtcNow
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = tags,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching tags: {ex.Message}");
                return StatusCode(500, new { error = "Failed to fetch tags" });
            }
        }

        [HttpPost("tags")]
        public async Task<IActionResult> CreateTag([FromBody] CreateTagDto dto)
        {
            try
            {
                var tag = new Tag
                {
                    TagName = dto.Name
                };

                _context.Tags.Add(tag);
                await _context.SaveChangesAsync();

                return Ok(tag);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating tag: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create tag" });
            }
        }

        [HttpPut("tags/{id}")]
        public async Task<IActionResult> UpdateTag(int id, [FromBody] CreateTagDto dto)
        {
            try
            {
                var tag = await _context.Tags.FindAsync(id);
                if (tag == null)
                    return NotFound(new { error = "Tag not found" });

                tag.TagName = dto.Name;

                await _context.SaveChangesAsync();
                return Ok(tag);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating tag: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update tag" });
            }
        }

        [HttpDelete("tags/{id}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            try
            {
                var tag = await _context.Tags.FindAsync(id);
                if (tag == null)
                    return NotFound(new { error = "Tag not found" });

                _context.Tags.Remove(tag);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Tag deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting tag: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete tag" });
            }
        }

        // ==================== HELPER METHODS ====================
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }

    // ==================== DTOs ====================
    public class CreateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string ProfileImage { get; set; }
        public string Country { get; set; }
    }

    public class CreateExperienceDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime? Date { get; set; }
        public double Rating { get; set; }
        public int UserId { get; set; }
    }

    public class CreateCommentDto
    {
        public string Content { get; set; }
        public int UserId { get; set; }
        public int ExperienceId { get; set; }
    }

    public class CreateTagDto
    {
        public string Name { get; set; }
    }
}

