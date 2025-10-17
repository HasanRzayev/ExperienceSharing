using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Data;
using BCrypt.Net;

namespace ExperienceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordMigrationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PasswordMigrationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ⚠️ DIQQƏT: Bu endpoint sadəcə development üçündür!
        // Production-da silin və ya admin auth əlavə edin!
        [HttpPost("reset-all-to-test")]
        public async Task<IActionResult> ResetAllPasswordsToTest()
        {
            try
            {
                // Bütün user-ləri tap (Google OAuth user-lər istisna)
                var users = await _context.Users
                    .Where(u => string.IsNullOrEmpty(u.GoogleId))
                    .ToListAsync();

                // Yeni BCrypt hash (password: "test12345")
                var newPasswordHash = BCrypt.Net.BCrypt.HashPassword("test12345");

                int updatedCount = 0;
                foreach (var user in users)
                {
                    user.PasswordHash = newPasswordHash;
                    updatedCount++;
                }

                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = $"✅ {updatedCount} user-in password-u 'test12345' olaraq təyin edildi (BCrypt).",
                    updatedUsers = updatedCount,
                    newPassword = "test12345",
                    note = "⚠️ Bu sadəcə development üçündür! Production-da bu endpoint-i silin!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Konkret user-in password-unu sıfırla
        [HttpPost("reset-user/{userId}")]
        public async Task<IActionResult> ResetUserPassword(int userId, [FromBody] ResetUserPasswordDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User tapılmadı" });
                }

                if (user.GoogleId != null)
                {
                    return BadRequest(new { message = "Google OAuth user-lərin password-u yoxdur" });
                }

                var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                user.PasswordHash = newPasswordHash;

                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = $"✅ User {user.UserName}-in password-u yeniləndi.",
                    userId = userId,
                    newPassword = dto.NewPassword
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Bütün user-lərin password hash metodunu yoxla
        [HttpGet("check-hash-types")]
        public async Task<IActionResult> CheckHashTypes()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.UserName,
                        u.Email,
                        HasGoogleId = u.GoogleId != null,
                        PasswordHashLength = u.PasswordHash != null ? u.PasswordHash.Length : 0,
                        PasswordHashStart = u.PasswordHash != null ? u.PasswordHash.Substring(0, Math.Min(10, u.PasswordHash.Length)) : "null",
                        IsBCrypt = u.PasswordHash != null && u.PasswordHash.StartsWith("$2")
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalUsers = users.Count,
                    bcryptUsers = users.Count(u => u.IsBCrypt),
                    otherHashUsers = users.Count(u => !u.IsBCrypt && u.PasswordHashLength > 0),
                    googleUsers = users.Count(u => u.HasGoogleId),
                    users = users
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class ResetUserPasswordDto
    {
        public string NewPassword { get; set; }
    }
}

