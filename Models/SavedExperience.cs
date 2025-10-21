using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class SavedExperience
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ExperienceId { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        public string? Notes { get; set; } // Optional personal notes

        public int? CollectionId { get; set; } // Link to collection (optional)

        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("ExperienceId")]
        public ExperienceModel? Experience { get; set; }

        [ForeignKey("CollectionId")]
        public Collection? Collection { get; set; }
    }
}

