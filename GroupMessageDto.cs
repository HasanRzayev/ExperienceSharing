using System.ComponentModel.DataAnnotations;

namespace Experience.Dto
{
    public class GroupMessageDTO
    {
        public int GroupChatId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; }
        public string? MediaUrl { get; set; }  // Fayl linki burda saxlanır
        public string? MediaType { get; set; } // Məsələn: "image/png", "video/mp4"
        public string? MessageType { get; set; } // "text", "image", "video", "audio"
        public DateTime SentAt { get; set; }
    }
}

