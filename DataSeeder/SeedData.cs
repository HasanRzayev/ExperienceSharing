using Bogus;
using Experience.Models;
using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

// Helper class to store child comment data before parent IDs are available
public class ChildCommentData
{
    public string Content { get; set; }
    public int UserId { get; set; }
    public int ExperienceId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ParentIndex { get; set; } // Index in the parentComments list
}

public static class SeedData
{
    private static readonly string UNSPLASH_API_KEY = "sQ7fBK2Unle8Dhb_tI5OtrtDX-sokeZIykHRkvcX-PA";

    // Real world travel destinations with matching search terms
    private static readonly List<(string Country, string City, string SearchTerm)> DESTINATIONS = new()
    {
        ("France", "Paris", "eiffel tower paris"),
        ("Italy", "Rome", "colosseum rome"),
        ("Italy", "Venice", "venice canals italy"),
        ("Japan", "Tokyo", "tokyo japan"),
        ("Japan", "Kyoto", "kyoto temple japan"),
        ("United States", "New York", "new york city"),
        ("United States", "Grand Canyon", "grand canyon arizona"),
        ("United Kingdom", "London", "london big ben"),
        ("Spain", "Barcelona", "barcelona sagrada familia"),
        ("Greece", "Santorini", "santorini greece"),
        ("Turkey", "Istanbul", "istanbul turkey"),
        ("Turkey", "Cappadocia", "cappadocia hot air balloon"),
        ("Thailand", "Bangkok", "bangkok thailand"),
        ("Thailand", "Phuket", "phuket beach thailand"),
        ("Australia", "Sydney", "sydney opera house"),
        ("United Arab Emirates", "Dubai", "dubai burj khalifa"),
        ("Egypt", "Cairo", "pyramids giza egypt"),
        ("Peru", "Machu Picchu", "machu picchu peru"),
        ("India", "Taj Mahal", "taj mahal india"),
        ("China", "Beijing", "great wall china"),
        ("Iceland", "Reykjavik", "iceland northern lights"),
        ("Norway", "Bergen", "norway fjords"),
        ("Switzerland", "Alps", "swiss alps mountains"),
        ("Brazil", "Rio de Janeiro", "rio de janeiro christ redeemer"),
        ("Morocco", "Marrakech", "marrakech morocco"),
        ("Indonesia", "Bali", "bali indonesia temple"),
        ("New Zealand", "Queenstown", "new zealand mountains"),
        ("South Africa", "Cape Town", "cape town table mountain"),
        ("Canada", "Banff", "banff lake canada"),
        ("Mexico", "Cancun", "cancun beach mexico")
    };

    // Travel-related tags
    private static readonly List<string> TAG_NAMES = new()
    {
        "Adventure", "Culture", "Food", "Nature", "Historical", "Beach", "Mountains", "Hiking",
        "Wildlife", "Camping", "Luxury", "Backpacking", "Road Trip", "Island", "City Break",
        "Cruise", "Safari", "Skiing", "Desert", "Trekking", "Waterfalls", "Cultural Heritage",
        "Local Experience", "Diving", "Caving", "Street Food", "Eco Tourism", "Festivals",
        "Hot Springs", "Photography", "Nightlife", "Shopping", "Architecture", "Museums",
        "Solo Travel", "Family Friendly", "Romantic", "Budget Travel", "Wellness", "Spiritual"
    };

    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var context = new ApplicationDbContext(serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>());

        // Check if already seeded (but allow re-seeding if needed)
        var userCount = await context.Users.CountAsync();
        var experiencesCount = await context.Experiences.CountAsync();
        var commentsCount = await context.Comments.CountAsync();
        var statusesCount = await context.Statuses.CountAsync();

        Console.WriteLine($"🔍 Database status:");
        Console.WriteLine($"   Users: {userCount}");
        Console.WriteLine($"   Experiences: {experiencesCount}");
        Console.WriteLine($"   Comments: {commentsCount}");
        Console.WriteLine($"   Statuses: {statusesCount}");

        // ALWAYS seed if data is incomplete
        if (userCount >= 50 && experiencesCount >= 30 && statusesCount >= 15)
        {
            Console.WriteLine("✅ Database already seeded. Skipping...");
            return;
        }

        // Delete existing data before re-seeding
        Console.WriteLine("🔄 Clearing existing data before re-seeding...");
        context.StatusViews.RemoveRange(await context.StatusViews.ToListAsync());
        context.CommentReactions.RemoveRange(await context.CommentReactions.ToListAsync());
        context.Comments.RemoveRange(await context.Comments.ToListAsync());
        context.Likes.RemoveRange(await context.Likes.ToListAsync());
        context.ExperienceTags.RemoveRange(await context.ExperienceTags.ToListAsync());
        context.ExperienceImages.RemoveRange(await context.ExperienceImages.ToListAsync());
        context.Experiences.RemoveRange(await context.Experiences.ToListAsync());
        context.Users.RemoveRange(await context.Users.ToListAsync());
        context.Tags.RemoveRange(await context.Tags.ToListAsync());
        await context.SaveChangesAsync();
        Console.WriteLine("✅ Cleared existing data");

        Console.WriteLine("🌱 Starting database seeding...");

        // 1. Create Users (50 realistic users)
        var users = await CreateUsers(context);
        Console.WriteLine($"✅ Created {users.Count} users");

        // 2. Create Tags
        var tags = CreateTags();
        await context.Tags.AddRangeAsync(tags);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {tags.Count} tags");

        // 3. Create Experiences with real images
        var experiences = await CreateExperiences(context, users, tags);
        Console.WriteLine($"✅ Created {experiences.Count} experiences");

        // 4. Create Follows (logical relationships)
        var follows = CreateFollows(users);
        await context.Follows.AddRangeAsync(follows);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {follows.Count} follow relationships");

        // 5. Create Likes
        var likes = CreateLikes(users, experiences);
        await context.Likes.AddRangeAsync(likes);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {likes.Count} likes");

        // 6. Create Comments with Replies (must do in two phases to handle foreign keys)
        var (parentComments, childCommentsWithIndex) = CreateComments(users, experiences);
        
        // First save parent comments
        await context.Comments.AddRangeAsync(parentComments);
        await context.SaveChangesAsync();
        
        // Now create child comments with proper parent IDs
        var childComments = new List<Comment>();
        for (int i = 0; i < childCommentsWithIndex.Count; i++)
        {
            var childWithIndex = childCommentsWithIndex[i];
            var childComment = new Comment
            {
                Content = childWithIndex.Content,
                UserId = childWithIndex.UserId,
                ExperienceId = childWithIndex.ExperienceId,
                CreatedAt = childWithIndex.CreatedAt,
                ParentCommentId = parentComments[childWithIndex.ParentIndex].Id
            };
            childComments.Add(childComment);
        }
        
        // Save child comments (replies) which reference parent comment IDs
        await context.Comments.AddRangeAsync(childComments);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {parentComments.Count} parent comments and {childComments.Count} reply comments");

        // 7. Create Comment Reactions
        var allComments = parentComments.Concat(childComments).ToList();
        var commentReactions = CreateCommentReactions(users, allComments);
        await context.CommentReactions.AddRangeAsync(commentReactions);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {commentReactions.Count} comment reactions");

        // 8. Create Notifications
        var notifications = CreateNotifications(users, experiences, follows, likes, allComments);
        await context.Notifications.AddRangeAsync(notifications);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {notifications.Count} notifications");

        // 9. Create Messages
        var messages = CreateMessages(users);
        await context.Messages.AddRangeAsync(messages);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {messages.Count} messages");

        // 10. Create Follow Requests
        var followRequests = CreateFollowRequests(users);
        await context.FollowRequests.AddRangeAsync(followRequests);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {followRequests.Count} follow requests");

        // 11. Create Blocked Users (optional, small number)
        var blockedUsers = CreateBlockedUsers(users);
        await context.BlockedUsers.AddRangeAsync(blockedUsers);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {blockedUsers.Count} blocked users");

        // 12. Create Statuses (Stories) with images and videos
        var statuses = await CreateStatuses(context, users);
        await context.Statuses.AddRangeAsync(statuses);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Created {statuses.Count} status stories");

        Console.WriteLine("🎉 Database seeding completed successfully!");
    }

    private static async Task<List<User>> CreateUsers(ApplicationDbContext context)
    {
        var users = new List<User>();

        // Admin user
        users.Add(new User
        {
            FirstName = "Admin",
            LastName = "Wanderly",
            Email = "admin@wanderly.com",
            UserName = "admin",
            Country = "Global",
            ProfileImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            PasswordHash = HashPassword("Admin123!")
        });

        // Get 49 real users from API
        try
        {
            using HttpClient client = new HttpClient();
            string response = await client.GetStringAsync("https://randomuser.me/api/?results=49");
            var apiUsers = JObject.Parse(response)["results"].Select(result => new User
            {
                FirstName = CapitalizeFirst(result["name"]["first"].ToString()),
                LastName = CapitalizeFirst(result["name"]["last"].ToString()),
                Country = result["location"]["country"].ToString(),
                ProfileImage = result["picture"]["large"].ToString(),
                UserName = result["login"]["username"].ToString(),
                Email = result["email"].ToString(),
                PasswordHash = HashPassword("Password123!")
            }).ToList();

            users.AddRange(apiUsers);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Could not fetch users from API: {ex.Message}");
            // Fallback: create fake users
            var faker = new Faker<User>()
                .RuleFor(u => u.FirstName, f => f.Name.FirstName())
                .RuleFor(u => u.LastName, f => f.Name.LastName())
                .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.FirstName, u.LastName))
                .RuleFor(u => u.UserName, (f, u) => f.Internet.UserName(u.FirstName, u.LastName))
                .RuleFor(u => u.Country, f => f.Address.Country())
                .RuleFor(u => u.ProfileImage, f => f.Internet.Avatar())
                .RuleFor(u => u.PasswordHash, f => HashPassword("Password123!"));

            users.AddRange(faker.Generate(49));
        }

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();
        return users;
    }

    private static List<Tag> CreateTags()
    {
        return TAG_NAMES.Select(name => new Tag { TagName = name }).ToList();
    }

    private static async Task<List<ExperienceModel>> CreateExperiences(
        ApplicationDbContext context,
        List<User> users,
        List<Tag> tags)
    {
        var experiences = new List<ExperienceModel>();
        var random = new Random();

        // Sample video URLs for experiences
        var videoUrls = new List<string>
        {
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            "https://www.w3schools.com/html/mov_bbb.mp4",
            "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4"
        };

        foreach (var destination in DESTINATIONS)
        {
            // Get 2-3 images per destination
            var images = await GetImagesFromUnsplash(destination.SearchTerm, 3);

            if (!images.Any())
            {
                // Fallback to placeholder
                images = new List<string> { $"https://source.unsplash.com/800x600/?{destination.SearchTerm.Replace(" ", ",")}" };
            }

            // Create 1-2 experiences per destination
            for (int i = 0; i < random.Next(1, 3); i++)
            {
                var user = users[random.Next(1, users.Count)]; // Skip admin
                var experienceImages = images.Take(random.Next(1, 4)).Select(url => new ExperienceImage { Url = url }).ToList();

                var experience = new ExperienceModel
                {
                    Title = GenerateExperienceTitle(destination.City, destination.Country),
                    Description = GenerateExperienceDescription(destination.City, destination.Country),
                    Location = $"{destination.City}, {destination.Country}",
                    UserId = user.Id,
                    Date = DateTime.UtcNow.AddDays(-random.Next(1, 730)), // Last 2 years
                    Rating = Math.Round(random.NextDouble() * 2 + 3, 1), // 3.0 - 5.0
                    ImageUrls = experienceImages,
                    ExperienceTags = SelectRelevantTags(tags, destination.City, random).ToList()
                };

                // 30% chance to add a video to the experience
                if (random.Next(100) < 30)
                {
                    experience.VideoUrl = videoUrls[random.Next(videoUrls.Count)];
                    experience.VideoThumbnail = images.FirstOrDefault() ?? "https://via.placeholder.com/400?text=Video";
                }

                experiences.Add(experience);
            }
        }

        await context.Experiences.AddRangeAsync(experiences);
        await context.SaveChangesAsync();
        return experiences;
    }

    private static List<Follow> CreateFollows(List<User> users)
    {
        var follows = new List<Follow>();
        var random = new Random();

        foreach (var user in users.Where(u => u.Email != "admin@wanderly.com"))
        {
            // Each user follows 5-15 random users
            var followCount = random.Next(5, 16);
            var usersToFollow = users
                .Where(u => u.Id != user.Id && u.Email != "admin@wanderly.com")
                .OrderBy(_ => random.Next())
                .Take(followCount);

            foreach (var userToFollow in usersToFollow)
            {
                follows.Add(new Follow
                {
                    FollowerId = user.Id,
                    FollowedId = userToFollow.Id
                });
            }
        }

        // Everyone follows admin
        follows.AddRange(users.Where(u => u.Email != "admin@wanderly.com")
            .Select(u => new Follow
            {
                FollowerId = u.Id,
                FollowedId = users.First(x => x.Email == "admin@wanderly.com").Id
            }));

        return follows.DistinctBy(f => new { f.FollowerId, f.FollowedId }).ToList();
    }

    private static List<Like> CreateLikes(List<User> users, List<ExperienceModel> experiences)
    {
        var likes = new List<Like>();
        var random = new Random();

        foreach (var experience in experiences)
        {
            // Each experience gets 3-20 likes
            var likeCount = random.Next(3, 21);
            var usersWhoLike = users
                .Where(u => u.Id != experience.UserId) // Can't like own experience
                .OrderBy(_ => random.Next())
                .Take(likeCount);

            foreach (var user in usersWhoLike)
            {
                likes.Add(new Like
                {
                    UserId = user.Id,
                    ExperienceId = experience.Id
                });
            }
        }

        return likes;
    }

    private static (List<Comment> parentComments, List<ChildCommentData> childCommentsWithIndex) CreateComments(List<User> users, List<ExperienceModel> experiences)
    {
        var parentComments = new List<Comment>();
        var childCommentsWithIndex = new List<ChildCommentData>();
        var random = new Random();

        var commentTexts = new List<string>
        {
            "Wow! This looks absolutely amazing! 😍",
            "I've always wanted to visit here! Thanks for sharing.",
            "Beautiful photos! How long did you stay?",
            "This is on my bucket list! Any tips?",
            "Incredible experience! I was there last year too.",
            "The scenery is breathtaking! 🌄",
            "Would you recommend this for families?",
            "What was your favorite part of the trip?",
            "Thanks for the inspiration! Planning to go next summer.",
            "Stunning! What camera did you use?",
            "This place is magical! ✨",
            "Great photos! How much did the trip cost?",
            "I can't believe how beautiful this is!",
            "Added to my travel list! 📝",
            "Did you travel solo or with a group?",
            "The local food there is amazing, right?",
            "How was the weather during your visit?",
            "This is exactly what I needed to see today! 🙏",
            "Looks like an adventure of a lifetime!",
            "Your photography skills are incredible!"
        };

        var replyTexts = new List<string>
        {
            "Thank you so much! 😊",
            "I stayed for about a week. Highly recommend!",
            "Yes, absolutely! It's perfect for families.",
            "My favorite part was definitely the local cuisine!",
            "I used a Canon EOS R5. Great camera!",
            "The trip cost around $2000 including flights.",
            "I traveled solo and met amazing people!",
            "The weather was perfect - sunny every day!",
            "Thank you! I'm glad I could inspire you! ❤️",
            "It truly was a life-changing experience!",
            "Definitely book in advance to get better deals!",
            "The locals were so friendly and welcoming!",
            "I recommend staying at least 5 days.",
            "Thanks! Photography is my passion! 📸",
            "Make sure to try the street food!",
            "I went during spring - best time to visit!",
            "It exceeded all my expectations!",
            "You should definitely go! Won't regret it!",
            "Thank you for the kind words! 🙏",
            "Feel free to ask if you have more questions!"
        };

        foreach (var experience in experiences)
        {
            // Each experience gets 2-10 comments
            var commentCount = random.Next(2, 11);

            for (int i = 0; i < commentCount; i++)
            {
                var commenter = users[random.Next(users.Count)];
                var parentIndex = parentComments.Count; // Store the index for later reference
                var comment = new Comment
                {
                    Content = commentTexts[random.Next(commentTexts.Count)],
                    UserId = commenter.Id,
                    ExperienceId = experience.Id,
                    CreatedAt = experience.Date.AddDays(random.Next(1, 30)),
                    ParentCommentId = null
                };
                parentComments.Add(comment);

                // 30% chance of getting a reply (from experience owner)
                if (random.Next(100) < 30)
                {
                    var replyData = new ChildCommentData
                    {
                        Content = replyTexts[random.Next(replyTexts.Count)],
                        UserId = experience.UserId,
                        ExperienceId = experience.Id,
                        CreatedAt = comment.CreatedAt.AddHours(random.Next(1, 48)),
                        ParentIndex = parentIndex // Store index of parent comment
                    };
                    childCommentsWithIndex.Add(replyData);
                }
            }
        }

        return (parentComments, childCommentsWithIndex);
    }

    private static List<CommentReaction> CreateCommentReactions(List<User> users, List<Comment> comments)
    {
        var reactions = new List<CommentReaction>();
        var random = new Random();

        foreach (var comment in comments.Where(c => c.ParentCommentId == null)) // Only parent comments
        {
            // Each comment gets 0-10 reactions
            var reactionCount = random.Next(0, 11);
            var usersWhoReact = users
                .OrderBy(_ => random.Next())
                .Take(reactionCount);

            foreach (var user in usersWhoReact)
            {
                reactions.Add(new CommentReaction
                {
                    CommentId = comment.Id,
                    UserId = user.Id,
                    IsLike = random.Next(100) < 85 // 85% likes, 15% dislikes
                });
            }
        }

        return reactions;
    }

    private static List<Notification> CreateNotifications(
        List<User> users,
        List<ExperienceModel> experiences,
        List<Follow> follows,
        List<Like> likes,
        List<Comment> comments)
    {
        var notifications = new List<Notification>();
        var random = new Random();

        // Notifications for new followers
        foreach (var follow in follows.Take(100)) // Limit to avoid too many
        {
            var follower = users.First(u => u.Id == follow.FollowerId);
            notifications.Add(new Notification
            {
                UserId = follow.FollowedId,
                Type = "follow",
                Message = $"{follower.FirstName} {follower.LastName} started following you",
                FromUserId = follow.FollowerId,
                IsRead = random.Next(100) < 60,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 30))
            });
        }

        // Notifications for likes
        foreach (var like in likes.Take(150))
        {
            var liker = users.First(u => u.Id == like.UserId);
            var experience = experiences.First(e => e.Id == like.ExperienceId);
            notifications.Add(new Notification
            {
                UserId = experience.UserId,
                Type = "like",
                Message = $"{liker.FirstName} {liker.LastName} liked your experience \"{experience.Title}\"",
                FromUserId = like.UserId,
                ExperienceId = experience.Id,
                IsRead = random.Next(100) < 70,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 30))
            });
        }

        // Notifications for comments
        foreach (var comment in comments.Where(c => c.ParentCommentId == null).Take(100))
        {
            var commenter = users.First(u => u.Id == comment.UserId);
            var experience = experiences.First(e => e.Id == comment.ExperienceId);
            if (comment.UserId != experience.UserId) // Don't notify for own comments
            {
                notifications.Add(new Notification
                {
                    UserId = experience.UserId,
                    Type = "comment",
                    Message = $"{commenter.FirstName} {commenter.LastName} commented on your experience \"{experience.Title}\"",
                    FromUserId = comment.UserId,
                    ExperienceId = experience.Id,
                    CommentId = comment.Id,
                    IsRead = random.Next(100) < 65,
                    CreatedAt = comment.CreatedAt
                });
            }
        }

        return notifications;
    }

    private static List<Message> CreateMessages(List<User> users)
    {
        var messages = new List<Message>();
        var random = new Random();

        var conversations = new List<List<string>>
        {
            new() {
                "Hey! I saw your post about Paris. Amazing photos! 📸",
                "Thank you so much! It was an incredible trip!",
                "How long were you there?",
                "About 10 days. Perfect amount of time to explore!",
                "That's awesome! Any recommendations for hotels?",
                "Yes! I stayed near the Latin Quarter. Great location!"
            },
            new() {
                "Hi! Planning to visit Japan next month. Saw your posts!",
                "Oh that's exciting! Which cities are you visiting?",
                "Tokyo and Kyoto mainly. Any must-see places?",
                "Definitely visit Fushimi Inari shrine in Kyoto!",
                "Added to my list! Thanks for the tip! 🙏"
            },
            new() {
                "Your photography is stunning! What gear do you use?",
                "Thank you! I use Sony A7III with 24-70mm lens",
                "Great choice! Do you edit in Lightroom?",
                "Yes! Lightroom and sometimes Photoshop for advanced edits",
                "Thanks for sharing! Really helpful 😊"
            },
            new() {
                "Would you recommend traveling solo to Bali?",
                "Absolutely! It's very safe and friendly for solo travelers",
                "That's reassuring! How about accommodation?",
                "Ubud has great hostels if you want to meet people",
                "Perfect! Booking my flight this week! ✈️"
            }
        };

        // Create 20 random conversations
        for (int i = 0; i < 20; i++)
        {
            var sender = users[random.Next(1, users.Count)];
            var receiver = users[random.Next(1, users.Count)];

            while (sender.Id == receiver.Id)
            {
                receiver = users[random.Next(1, users.Count)];
            }

            var dialogue = conversations[random.Next(conversations.Count)];
            var timestamp = DateTime.UtcNow.AddDays(-random.Next(1, 60));

            foreach (var messageText in dialogue)
            {
                messages.Add(new Message
                {
                    SenderId = sender.Id,
                    ReceiverId = receiver.Id,
                    Content = messageText,
                    Timestamp = timestamp
                });

                timestamp = timestamp.AddMinutes(random.Next(2, 30));
                (sender, receiver) = (receiver, sender); // Swap for natural conversation
            }
        }

        return messages;
    }

    private static List<FollowRequest> CreateFollowRequests(List<User> users)
    {
        var requests = new List<FollowRequest>();
        var random = new Random();

        // Create 10-15 follow requests with different statuses
        for (int i = 0; i < random.Next(10, 16); i++)
        {
            var follower = users[random.Next(1, users.Count)];
            var followed = users[random.Next(1, users.Count)];

            while (follower.Id == followed.Id)
            {
                followed = users[random.Next(1, users.Count)];
            }

            var statusRoll = random.Next(100);
            var status = statusRoll < 40 ? FollowRequestStatus.Pending :
                        statusRoll < 80 ? FollowRequestStatus.Accepted :
                        FollowRequestStatus.Rejected;

            requests.Add(new FollowRequest
            {
                FollowerId = follower.Id,
                FollowedId = followed.Id,
                Status = status
            });
        }

        return requests;
    }

    private static List<BlockedUser> CreateBlockedUsers(List<User> users)
    {
        var blocked = new List<BlockedUser>();
        var random = new Random();

        // Create 3-5 blocked relationships
        for (int i = 0; i < random.Next(3, 6); i++)
        {
            var blocker = users[random.Next(1, users.Count)];
            var blockedUser = users[random.Next(1, users.Count)];

            while (blocker.Id == blockedUser.Id)
            {
                blockedUser = users[random.Next(1, users.Count)];
            }

            blocked.Add(new BlockedUser
            {
                UserId = blocker.Id,
                BlockedUserId = blockedUser.Id,
                BlockedAt = DateTime.UtcNow.AddDays(-random.Next(1, 180))
            });
        }

        return blocked;
    }

    private static Task<List<Status>> CreateStatuses(ApplicationDbContext context, List<User> users)
    {
        var statuses = new List<Status>();
        var random = new Random();

        // Status texts
        var statusTexts = new List<string>
        {
            "Exploring the world 🌍",
            "Just landed in an amazing place!",
            "Feeling blessed ✨",
            "Morning vibes ☀️",
            "Sunset views 😍",
            "Living the dream",
            "Adventure time! 🎒",
            "Making memories 📸",
            "Beautiful day!",
            "Traveling the world one story at a time 🌎",
            "Another amazing destination!",
            "Life is beautiful ❤️",
            "Feeling grateful 🙏",
            "Morning coffee and amazing views ☕",
            "This place is magical ✨",
            "Can't believe I'm here!",
            "Best trip ever!",
            "Living my best life",
            "A moment to remember 🌸"
        };

        // Placeholder image URLs
        var imageUrls = new List<string>
        {
            "https://source.unsplash.com/400x600/?travel,vacation",
            "https://source.unsplash.com/400x600/?adventure,explore",
            "https://source.unsplash.com/400x600/?nature,landscape",
            "https://source.unsplash.com/400x600/?beach,sunset",
            "https://source.unsplash.com/400x600/?city,travel"
        };

        // Sample video URLs
        var videoUrls = new List<string>
        {
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            "https://www.w3schools.com/html/mov_bbb.mp4",
            "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4"
        };

        // Create 2-3 statuses for 30% of users
        var usersWithStatus = users.Where(u => u.Email != "admin@wanderly.com")
            .OrderBy(_ => random.Next())
            .Take(Math.Max(1, users.Count / 3));

        foreach (var user in usersWithStatus)
        {
            var statusCount = random.Next(1, 4);

            for (int i = 0; i < statusCount; i++)
            {
                var createdAt = DateTime.UtcNow.AddHours(-random.Next(0, 24));
                var expiresAt = createdAt.AddHours(24);

                var status = new Status
                {
                    UserId = user.Id,
                    Text = statusTexts[random.Next(statusTexts.Count)],
                    CreatedAt = createdAt,
                    ExpiresAt = expiresAt
                };

                // 60% chance of image, 20% chance of video, 20% chance of text only
                var typeRoll = random.Next(100);
                if (typeRoll < 60)
                {
                    // Image status
                    status.ImageUrl = imageUrls[random.Next(imageUrls.Count)];
                }
                else if (typeRoll < 80)
                {
                    // Video status
                    status.VideoUrl = videoUrls[random.Next(videoUrls.Count)];
                    status.ThumbnailUrl = imageUrls[random.Next(imageUrls.Count)];
                }
                // else: text only status

                statuses.Add(status);
            }
        }

        return Task.FromResult(statuses);
    }

    // Helper Methods
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static async Task<List<string>> GetImagesFromUnsplash(string query, int count)
    {
        try
        {
            using HttpClient client = new HttpClient();
            var response = await client.GetAsync($"https://api.unsplash.com/search/photos?query={Uri.EscapeDataString(query)}&per_page={count}&client_id={UNSPLASH_API_KEY}");

            if (response.IsSuccessStatusCode)
            {
                var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                var results = json["results"];
                return results.Select(r => r["urls"]["regular"].ToString()).ToList();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Could not fetch images for {query}: {ex.Message}");
        }
        return new List<string>();
    }

    private static string GenerateExperienceTitle(string city, string country)
    {
        var templates = new List<string>
        {
            $"Amazing {city} Adventure!",
            $"Exploring the Beauty of {city}",
            $"My Unforgettable Trip to {city}",
            $"A Week in {city}, {country}",
            $"{city} Travel Guide: Must-See Places",
            $"Discovering Hidden Gems in {city}",
            $"The Ultimate {city} Experience",
            $"{city} Through My Lens",
            $"Weekend Getaway to {city}",
            $"{city}: A Dream Destination"
        };
        return templates[new Random().Next(templates.Count)];
    }

    private static string GenerateExperienceDescription(string city, string country)
    {
        var templates = new List<string>
        {
            $"Had an incredible time exploring {city}! The culture, food, and people were absolutely amazing. Every corner had something beautiful to discover. Highly recommend visiting if you get the chance! 🌍✨",
            $"Just returned from {city}, {country} and I'm still in awe! This place exceeded all my expectations. From the stunning architecture to the delicious local cuisine, everything was perfect. Can't wait to go back! 😍",
            $"Spent an unforgettable week in {city} and it was worth every moment. The blend of history and modernity is fascinating. If you're planning a trip here, make sure to explore beyond the tourist spots! 🗺️",
            $"{city} has stolen my heart! ❤️ The breathtaking views, friendly locals, and rich culture made this trip one for the books. Already planning my next visit!",
            $"Travel diary: {city}, {country}. This destination is a must-visit for any travel enthusiast! The experiences I had here will stay with me forever. From sunrise to sunset, every moment was magical! 🌅",
            $"What an adventure in {city}! The perfect mix of relaxation and exploration. Whether you're into history, food, or nature, this place has it all. Sharing some of my favorite moments here! 📸",
            $"Bucket list ✅: {city}! This trip was everything I dreamed of and more. The locals were welcoming, the food was delicious, and the sights were spectacular. Don't miss out on this gem! 💎"
        };
        return templates[new Random().Next(templates.Count)];
    }

    private static IEnumerable<ExperienceTag> SelectRelevantTags(List<Tag> tags, string city, Random random)
    {
        // Logic to select relevant tags based on destination
        var relevantTagNames = new List<string>();

        if (city.Contains("Beach") || city.Contains("Phuket") || city.Contains("Cancun") || city.Contains("Bali"))
            relevantTagNames.AddRange(new[] { "Beach", "Island", "Diving", "Relaxation" });
        else if (city.Contains("Alps") || city.Contains("Banff") || city.Contains("Machu Picchu"))
            relevantTagNames.AddRange(new[] { "Mountains", "Hiking", "Trekking", "Adventure" });
        else if (city.Contains("Paris") || city.Contains("Rome") || city.Contains("London"))
            relevantTagNames.AddRange(new[] { "Culture", "Historical", "Architecture", "Museums" });
        else if (city.Contains("Tokyo") || city.Contains("Bangkok") || city.Contains("Marrakech"))
            relevantTagNames.AddRange(new[] { "Culture", "Street Food", "Local Experience", "Photography" });
        else
            relevantTagNames.AddRange(new[] { "City Break", "Culture", "Photography" });

        // Add 2-4 random tags
        relevantTagNames.AddRange(tags.OrderBy(_ => random.Next()).Take(random.Next(2, 4)).Select(t => t.TagName));

        var selectedTags = tags.Where(t => relevantTagNames.Contains(t.TagName)).Take(random.Next(3, 6));
        return selectedTags.Select(t => new ExperienceTag { TagId = t.TagId });
    }

    private static string CapitalizeFirst(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        return char.ToUpper(text[0]) + text.Substring(1).ToLower();
    }
}
