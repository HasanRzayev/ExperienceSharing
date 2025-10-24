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
    }
}

