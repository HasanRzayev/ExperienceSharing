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

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FollowersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FollowersController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
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

    [HttpGet("followers")]
    public async Task<IActionResult> GetFollowers()
    {
        var userId = GetUserIdFromHeader();
        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var followers = await _context.Follows
            .Where(f => f.FollowedUserId == userId)
            .Include(f => f.Follower)
            .Select(f => new
            {
                f.Follower.Id,
                f.Follower.FirstName,
                f.Follower.LastName,
                f.Follower.UserName,
                f.Follower.ProfileImage,
                f.FollowedAt
            })
            .ToListAsync();

        return Ok(followers);
    }

    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing()
    {
        var userId = GetUserIdFromHeader();
        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var following = await _context.Follows
            .Where(f => f.FollowerId == userId)
            .Include(f => f.FollowedUser)
            .Select(f => new
            {
                f.FollowedUser.Id,
                f.FollowedUser.FirstName,
                f.FollowedUser.LastName,
                f.FollowedUser.UserName,
                f.FollowedUser.ProfileImage,
                f.FollowedAt
            })
            .ToListAsync();

        return Ok(following);
    }

    [HttpGet("messaging-contacts")]
    public async Task<IActionResult> GetMessagingContacts()
    {
        var userId = GetUserIdFromHeader();
        if (userId == 0)
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        // Get users who follow current user or are followed by current user
        var contacts = await _context.Follows
            .Where(f => f.FollowerId == userId || f.FollowedUserId == userId)
            .Include(f => f.Follower)
            .Include(f => f.FollowedUser)
            .Select(f => new
            {
                Id = f.FollowerId == userId ? f.FollowedUser.Id : f.Follower.Id,
                FirstName = f.FollowerId == userId ? f.FollowedUser.FirstName : f.Follower.FirstName,
                LastName = f.FollowerId == userId ? f.FollowedUser.LastName : f.Follower.LastName,
                UserName = f.FollowerId == userId ? f.FollowedUser.UserName : f.Follower.UserName,
                ProfileImage = f.FollowerId == userId ? f.FollowedUser.ProfileImage : f.Follower.ProfileImage,
                RelationshipType = f.FollowerId == userId ? "following" : "follower"
            })
            .Distinct()
            .ToListAsync();

        // Filter out blocked users
        var blockedUserIds = await _context.BlockedUsers
            .Where(b => b.UserId == userId || b.BlockedUserId == userId)
            .Select(b => b.UserId == userId ? b.BlockedUserId : b.UserId)
            .ToListAsync();

        var filteredContacts = contacts
            .Where(c => !blockedUserIds.Contains(c.Id))
            .ToList();

        return Ok(filteredContacts);
    }
}
