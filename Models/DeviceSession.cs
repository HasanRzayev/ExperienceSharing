using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class DeviceSession
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string SessionId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [StringLength(200)]
        public string DeviceName { get; set; }
        
        [StringLength(50)]
        public string DeviceType { get; set; } // "mobile", "desktop", "tablet"
        
        [StringLength(100)]
        public string DeviceInfo { get; set; } // Browser, OS info
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime ExpiresAt { get; set; }
        
        public bool IsConfirmed { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public User User { get; set; }
    }
}
