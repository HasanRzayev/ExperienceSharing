using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class Status
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string? Text { get; set; } // Status text (optional)
        public string? ImageUrl { get; set; } // Status image
        public string? VideoUrl { get; set; } // Status video
        public string? ThumbnailUrl { get; set; } // Video thumbnail
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; } // 24 hours from creation
        
        // View tracking
        public ICollection<StatusView>? Views { get; set; }
    }
}

