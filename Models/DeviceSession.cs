using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class DeviceSession
    {
        public int Id { get; set; }
        public string SessionId { get; set; }
        public int UserId { get; set; } // 0 if not logged in
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsConfirmed { get; set; }
        public bool IsActive { get; set; }
    }
}

