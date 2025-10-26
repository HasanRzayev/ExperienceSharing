namespace ExperienceProject.Models
{
    public class StatusView
    {
        public int Id { get; set; }
        
        public int StatusId { get; set; }
        public Status? Status { get; set; }
        
        public int UserId { get; set; } // Who viewed this status
        public User? User { get; set; }
        
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}

