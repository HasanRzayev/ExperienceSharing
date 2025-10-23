using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class BlockedUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int BlockedUserId { get; set; }

        public DateTime BlockedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("BlockedUserId")]
        public virtual User BlockedUserNavigation { get; set; }
    }
}
