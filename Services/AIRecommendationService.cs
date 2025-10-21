using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace ExperienceProject.Services
{
    public class AIRecommendationService
    {
        private readonly ApplicationDbContext _context;
        private readonly string _geminiApiKey;
        private readonly HttpClient _httpClient;

        public AIRecommendationService(ApplicationDbContext context, IConfiguration configuration, HttpClient httpClient)
        {
            _context = context;
            _geminiApiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
            _httpClient = httpClient;
        }

        public async Task<List<ExperienceModel>> GetPersonalizedRecommendations(int userId, int count = 10)
        {
            try
            {
                // Get user's interaction history
                var userLikes = await _context.Likes
                    .Where(l => l.UserId == userId)
                    .Include(l => l.Experience)
                    .Select(l => l.Experience)
                    .ToListAsync();

                var userSaved = await _context.SavedExperiences
                    .Where(se => se.UserId == userId)
                    .Include(se => se.Experience)
                    .Select(se => se.Experience)
                    .ToListAsync();

                var userRatings = await _context.ExperienceRatings
                    .Where(r => r.UserId == userId && r.OverallRating >= 4)
                    .Include(r => r.Experience)
                    .Select(r => r.Experience)
                    .ToListAsync();

                // Combine all liked/saved/rated experiences
                var interestedExperiences = userLikes
                    .Concat(userSaved!)
                    .Concat(userRatings!)
                    .Where(e => e != null)
                    .Distinct()
                    .ToList();

                if (!interestedExperiences.Any())
                {
                    // No history, return trending
                    return await GetTrendingExperiences(count);
                }

                // Extract preferences using Gemini AI
                var preferences = await ExtractUserPreferences(interestedExperiences);

                // Get candidate experiences (exclude already seen)
                var seenIds = interestedExperiences.Select(e => e!.Id).ToList();
                var candidates = await _context.Experiences
                    .Where(e => !seenIds.Contains(e.Id) && !e.IsDraft)
                    .Include(e => e.ImageUrls)
                    .Include(e => e.User)
                    .OrderByDescending(e => e.Date)
                    .Take(50)
                    .ToListAsync();

                // Score and rank candidates
                var scored = candidates.Select(exp => new
                {
                    Experience = exp,
                    Score = CalculateRecommendationScore(exp, preferences)
                })
                .OrderByDescending(x => x.Score)
                .Take(count)
                .Select(x => x.Experience)
                .ToList();

                return scored;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AI Recommendations error: {ex.Message}");
                return await GetTrendingExperiences(count);
            }
        }

        private async Task<UserPreferences> ExtractUserPreferences(List<ExperienceModel?> experiences)
        {
            try
            {
                var descriptions = experiences
                    .Where(e => e != null)
                    .Take(5)
                    .Select(e => $"{e!.Title}: {(e.Description != null && e.Description.Length > 0 ? e.Description.Substring(0, Math.Min(100, e.Description.Length)) : "")}")
                    .ToList();

                var prompt = $@"Based on these travel experiences that a user enjoyed, extract their preferences:

{string.Join("\n", descriptions)}

Return ONLY a JSON object with these fields (no markdown, no explanation):
{{
  ""preferredLocations"": [list of 3-5 location types or places],
  ""interests"": [list of 3-5 travel interests/activities],
  ""travelStyle"": ""adventure/luxury/budget/cultural/relaxation"",
  ""preferredSeasons"": [list of seasons if mentioned]
}}";

                var response = await CallGeminiAPI(prompt);
                
                // Parse JSON response
                try
                {
                    var json = response.Trim().Replace("```json", "").Replace("```", "").Trim();
                    var prefs = JsonSerializer.Deserialize<UserPreferences>(json);
                    return prefs ?? new UserPreferences();
                }
                catch
                {
                    return new UserPreferences();
                }
            }
            catch
            {
                return new UserPreferences();
            }
        }

        private async Task<string> CallGeminiAPI(string prompt)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={_geminiApiKey}";

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.4,
                        maxOutputTokens = 1024
                    }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                var jsonDoc = JsonDocument.Parse(responseBody);
                var text = jsonDoc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return text ?? string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini API error: {ex.Message}");
                return "{}";
            }
        }

        private double CalculateRecommendationScore(ExperienceModel experience, UserPreferences preferences)
        {
            double score = 0;

            // Location matching
            if (preferences.PreferredLocations != null)
            {
                foreach (var loc in preferences.PreferredLocations)
                {
                    if (experience.Location?.Contains(loc, StringComparison.OrdinalIgnoreCase) == true)
                    {
                        score += 20;
                    }
                }
            }

            // Interest matching
            if (preferences.Interests != null)
            {
                var expText = $"{experience.Title} {experience.Description}".ToLower();
                foreach (var interest in preferences.Interests)
                {
                    if (expText.Contains(interest.ToLower()))
                    {
                        score += 15;
                    }
                }
            }

            // Popularity boost (use default values since these fields might not exist)
            score += 0; // Placeholder for likes
            score += 0; // Placeholder for comments

            // Recency boost
            var daysSinceCreation = (DateTime.UtcNow - experience.Date).TotalDays;
            if (daysSinceCreation < 7)
            {
                score += 10;
            }
            else if (daysSinceCreation < 30)
            {
                score += 5;
            }

            return score;
        }

        private async Task<List<ExperienceModel>> GetTrendingExperiences(int count)
        {
            return await _context.Experiences
                .Where(e => !e.IsDraft)
                .Include(e => e.ImageUrls)
                .Include(e => e.User)
                .OrderByDescending(e => e.Date)
                .Take(count)
                .ToListAsync();
        }
    }

    public class UserPreferences
    {
        public List<string>? PreferredLocations { get; set; } = new();
        public List<string>? Interests { get; set; } = new();
        public string? TravelStyle { get; set; }
        public List<string>? PreferredSeasons { get; set; } = new();
    }
}

