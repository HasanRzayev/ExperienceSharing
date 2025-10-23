using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExperienceProject.Models;
using ExperienceProject.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UsersController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetUserIdFromHeader()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var token = authHeader.Replace("Bearer ", "");

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return 0;
    }

    // Block user endpoint
    [HttpPost("block/{blockedUserId}")]
    public async Task<IActionResult> BlockUser(int blockedUserId)
    {
        var userId = GetUserIdFromHeader();

        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        if (userId == blockedUserId)
        {
            return BadRequest(new { message = "You cannot block yourself." });
        }

        var existingBlock = await _context.BlockedUsers
            .FirstOrDefaultAsync(b => b.UserId == userId && b.BlockedUserId == blockedUserId);

        if (existingBlock != null)
        {
            return BadRequest(new { message = "User is already blocked." });
        }

        var block = new BlockedUser
        {
            UserId = userId,
            BlockedUserId = blockedUserId
        };

        _context.BlockedUsers.Add(block);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User blocked successfully." });
    }

    // Unblock user endpoint
    [HttpDelete("unblock/{blockedUserId}")]
    public async Task<IActionResult> UnblockUser(int blockedUserId)
    {
        var userId = GetUserIdFromHeader();

        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var blockEntry = await _context.BlockedUsers
            .FirstOrDefaultAsync(b => b.UserId == userId && b.BlockedUserId == blockedUserId);

        if (blockEntry == null)
        {
            return NotFound(new { message = "User is not blocked." });
        }

        _context.BlockedUsers.Remove(blockEntry);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User unblocked successfully." });
    }

    // Check if user is blocked
    [HttpGet("isBlocked/{userId}")]
    public async Task<IActionResult> IsUserBlocked(int userId)
    {
        var currentUserId = GetUserIdFromHeader();

        if (currentUserId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => b.UserId == currentUserId && b.BlockedUserId == userId);

        return Ok(new { isBlocked });
    }

    // Get current user profile
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetUserIdFromHeader();

        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.UserName,
                u.Email,
                u.ProfileImage,
                u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }

    // Get user by ID
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(int userId)
    {
        var currentUserId = GetUserIdFromHeader();

        if (currentUserId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        // Check if the user is blocked
        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => b.UserId == currentUserId && b.BlockedUserId == userId);

        if (isBlocked)
        {
            return Forbid(new { message = "User is blocked" });
        }

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.UserName,
                u.ProfileImage,
                u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }
}
