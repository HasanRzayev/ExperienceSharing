using System.ComponentModel.DataAnnotations;

namespace ExperienceProject.Models
{
    public class InteractionSettings
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public bool AllowMessages { get; set; } = true;
        public bool AllowStoryReplies { get; set; } = true;
        public bool AllowTags { get; set; } = true;
        public bool AllowMentions { get; set; } = true;
        public bool AllowComments { get; set; } = true;
        public bool AllowSharing { get; set; } = true;
        public string RestrictedAccounts { get; set; } // JSON string
        public string HiddenWords { get; set; } // JSON string
    }

    public class ContentSettings
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MutedAccounts { get; set; } // JSON string
        public bool ShowLikeCounts { get; set; } = true;
        public bool ShowShareCounts { get; set; } = true;
        public string ContentFilter { get; set; } = "all";
        public bool AutoArchive { get; set; } = false;
    }

    public class AppSettings
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Language { get; set; } = "en";
        public string Theme { get; set; } = "light";
        public bool AutoDownload { get; set; } = false;
        public bool WebsitePermissions { get; set; } = true;
        public bool AccessibilityMode { get; set; } = false;
    }

    public class AccountTools
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string AccountType { get; set; } = "personal";
        public bool AnalyticsEnabled { get; set; } = false;
        public bool InsightsEnabled { get; set; } = false;
        public bool ProfessionalTools { get; set; } = false;
    }

    public class CloseFriends
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int FriendUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class BlockedUsers
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BlockedUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class MutedUsers
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MutedUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class HiddenWords
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Word { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
