using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Experience.Models;

namespace ExperienceProject.Models
{
    [Table("Notifications")]
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; } // Kimə bildiriş göndərilir
        public User User { get; set; }
        
        [Required]
        public string Type { get; set; } // 'mention', 'comment', 'like', 'follow'
        
        [Required]
        public string Message { get; set; }
        
        public int? FromUserId { get; set; } // Kim göndərir
        public User FromUser { get; set; }
        
        public int? ExperienceId { get; set; }
        public ExperienceModel Experience { get; set; }
        
        public int? CommentId { get; set; }
        public Comment Comment { get; set; }
        
        public int? StatusId { get; set; }
        public Status Status { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}