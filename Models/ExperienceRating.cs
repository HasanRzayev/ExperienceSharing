using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class ExperienceRating
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ExperienceId { get; set; }

        [Required]
        public int UserId { get; set; }

        // Overall rating (1-5)
        [Range(1, 5)]
        public int OverallRating { get; set; }

        // Category ratings (1-5)
        [Range(1, 5)]
        public int? LocationRating { get; set; }

        [Range(1, 5)]
        public int? ValueRating { get; set; }

        [Range(1, 5)]
        public int? ServiceRating { get; set; }

        [Range(1, 5)]
        public int? CleanlinessRating { get; set; }

        [Range(1, 5)]
        public int? AccuracyRating { get; set; }

        [MaxLength(1000)]
        public string? Review { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Helpful votes
        public int HelpfulCount { get; set; } = 0;

        // Navigation properties
        [ForeignKey("ExperienceId")]
        public ExperienceModel? Experience { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }

    public class RatingHelpful
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RatingId { get; set; }

        [Required]
        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("RatingId")]
        public ExperienceRating? Rating { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}

