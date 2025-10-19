using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class ExperienceCollaborator
    {
        [Key]
        public int Id { get; set; }

        public int ExperienceId { get; set; }
        [ForeignKey("ExperienceId")]
        public ExperienceModel Experience { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public string Role { get; set; } = "Editor"; // Owner, Editor, Viewer

        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;

        public bool Accepted { get; set; } = false;
    }
}

