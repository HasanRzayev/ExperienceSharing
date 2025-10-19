using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public string Location { get; set; }

        public string Address { get; set; }

        public DateTime EventDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string CoverImage { get; set; }

        public int MaxAttendees { get; set; } = 0; // 0 = unlimited

        public decimal Price { get; set; } = 0; // 0 = free

        public string Currency { get; set; } = "USD";

        public string Category { get; set; } // Meetup, Workshop, Tour, Adventure, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User CreatedBy { get; set; }

        public ICollection<EventAttendee> Attendees { get; set; }
    }

    public class EventAttendee
    {
        [Key]
        public int Id { get; set; }

        public int EventId { get; set; }
        [ForeignKey("EventId")]
        public Event Event { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public string Status { get; set; } = "Going"; // Going, Interested, NotGoing

        public DateTime RSVPDate { get; set; } = DateTime.UtcNow;
    }
}

