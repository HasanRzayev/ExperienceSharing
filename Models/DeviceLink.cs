using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class DeviceLink
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string DeviceId { get; set; }
        
        [StringLength(200)]
        public string DeviceName { get; set; }
        
        [StringLength(50)]
        public string DeviceType { get; set; }
        
        [StringLength(100)]
        public string DeviceInfo { get; set; }
        
        [StringLength(50)]
        public string LastIPAddress { get; set; }
        
        public DateTime LinkedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        public bool IsTrusted { get; set; } = false;
        
        // Navigation property
        public User User { get; set; }
    }
}
