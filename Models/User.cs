using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string UserName { get; set; }
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [MaxLength(100)]
        public string Country { get; set; }
        
        public string ProfileImage { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        // Settings fields
        public string Bio { get; set; }
        public string Website { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? BirthDate { get; set; }
        public string Gender { get; set; }
        public string Language { get; set; } = "en";
        public bool IsPrivate { get; set; } = false;
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public bool ShowActivityStatus { get; set; } = true;
        public bool AllowComments { get; set; } = true;
        public bool AllowTags { get; set; } = true;
        public bool AllowMentions { get; set; } = true;
        public bool TwoFactorEnabled { get; set; } = false;
        public DateTime? LastLoginAt { get; set; }
        
        // Additional settings fields for extended functionality
        public bool AllowMessages { get; set; } = true;
        public bool AllowStoryReplies { get; set; } = true;
        public bool AllowSharing { get; set; } = true;
        public bool ShowLikeCounts { get; set; } = true;
        public bool ShowShareCounts { get; set; } = true;
        public string ContentFilter { get; set; } = "all";
        public bool AutoArchive { get; set; } = false;
        public string Theme { get; set; } = "light";
        public bool AutoDownload { get; set; } = false;
        public bool WebsitePermissions { get; set; } = true;
        public bool AccessibilityMode { get; set; } = false;
        public string AccountType { get; set; } = "personal";
        public bool AnalyticsEnabled { get; set; } = false;
        public bool InsightsEnabled { get; set; } = false;
        public bool ProfessionalTools { get; set; } = false;
    }
}

