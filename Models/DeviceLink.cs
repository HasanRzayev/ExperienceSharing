using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class DeviceLink
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string DeviceId { get; set; } // Unique ID for the device
        public string DeviceName { get; set; }
        public string DeviceType { get; set; }
        public string DeviceInfo { get; set; }
        public string LastIPAddress { get; set; }
        public DateTime LinkedAt { get; set; }
        public DateTime LastSeenAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsTrusted { get; set; }
    }
}

