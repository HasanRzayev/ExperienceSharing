using ExperienceProject.Models;

namespace ExperienceProject.Dto;

public class ExperienceDto
{
  
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime Date { get; set; }
        public List<IFormFile>? Images  { get; set; }
        public IFormFile? Video { get; set; } // Video upload
        public List<string>? Tags { get; set; } // Change from string to List<string>
        public double Rating { get; set; }
        public DateTime? ScheduledPublishDate { get; set; } // For scheduled posts
    }

// Alias for CreateExperienceDto
public class CreateExperienceDto : ExperienceDto
{
}
