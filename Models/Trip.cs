using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class Trip
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public string Destination { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string CoverImage { get; set; }

        public decimal Budget { get; set; }

        public string Currency { get; set; } = "USD";

        public string Status { get; set; } = "Planning"; // Planning, Ongoing, Completed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        // Navigation properties
        public ICollection<TripExperience> TripExperiences { get; set; }
        public ICollection<TripCollaborator> TripCollaborators { get; set; }
    }

    // Junction table for Trip and SavedExperiences
    public class TripExperience
    {
        [Key]
        public int Id { get; set; }

        public int TripId { get; set; }
        [ForeignKey("TripId")]
        public Trip Trip { get; set; }

        public int ExperienceId { get; set; }
        [ForeignKey("ExperienceId")]
        public ExperienceModel Experience { get; set; }

        public int OrderIndex { get; set; } // For ordering experiences in trip

        public string Notes { get; set; } // User notes for this experience in trip

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }

    // For collaborative trip planning
    public class TripCollaborator
    {
        [Key]
        public int Id { get; set; }

        public int TripId { get; set; }
        [ForeignKey("TripId")]
        public Trip Trip { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public string Role { get; set; } = "Editor"; // Owner, Editor, Viewer

        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;
    }
}

