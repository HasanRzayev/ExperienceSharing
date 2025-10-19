using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExperienceProject.Models
{
    public class GroupChat
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public string GroupImage { get; set; }

        public int CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GroupMember> Members { get; set; }
        public ICollection<GroupMessage> Messages { get; set; }
    }

    public class GroupMember
    {
        [Key]
        public int Id { get; set; }

        public int GroupChatId { get; set; }
        [ForeignKey("GroupChatId")]
        public GroupChat GroupChat { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public string Role { get; set; } = "Member"; // Admin, Member

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

    public class GroupMessage
    {
        [Key]
        public int Id { get; set; }

        public int GroupChatId { get; set; }
        [ForeignKey("GroupChatId")]
        public GroupChat GroupChat { get; set; }

        public int SenderId { get; set; }
        [ForeignKey("SenderId")]
        public User Sender { get; set; }

        public string Content { get; set; }

        public string MessageType { get; set; } = "text"; // text, image, video, audio, file

        public string MediaUrl { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public ICollection<MessageReaction> Reactions { get; set; }
    }

    public class MessageReaction
    {
        [Key]
        public int Id { get; set; }

        public int? MessageId { get; set; } // For private messages
        [ForeignKey("MessageId")]
        public Message Message { get; set; }

        public int? GroupMessageId { get; set; } // For group messages
        [ForeignKey("GroupMessageId")]
        public GroupMessage GroupMessage { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public string Emoji { get; set; } // 👍, ❤️, 😂, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

