namespace ExperienceProject.Dto
{
    public class StatusDto
    {
        public string? Text { get; set; }
    }

    public class StatusResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Text { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserResponseDto? User { get; set; }
        public int ViewCount { get; set; }
        public bool IsViewed { get; set; }
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
        public string? UserName { get; set; }
    }
}

