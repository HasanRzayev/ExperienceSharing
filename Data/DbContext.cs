using Microsoft.EntityFrameworkCore;
using ExperienceProject.Models;
using Experience.Models;

namespace ExperienceProject.Data
{

    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<ExperienceImage> ExperienceImages { get; set; }

        public DbSet<ExperienceModel> Experiences { get; set; }
        public DbSet<User> Users{ get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Tag> Tags { get; set; } // Eklenen DbSet
        public DbSet<BlockedUser> BlockedUsers { get; set; }

        public DbSet<FollowRequest> FollowRequests { get; set; }
        public DbSet<Message> Messages { get; set; }

        public DbSet<ExperienceTag> ExperienceTags { get; set; } // Eklenen DbSet
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CommentReaction> CommentReactions { get; set; } // 🔹 Yeni əlavə
        public DbSet<Trip> Trips { get; set; } // Trip Planner
        public DbSet<TripExperience> TripExperiences { get; set; }
        public DbSet<TripCollaborator> TripCollaborators { get; set; }
        public DbSet<GroupChat> GroupChats { get; set; } // Group Chats
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<MessageReaction> MessageReactions { get; set; }
        public DbSet<ExperienceCollaborator> ExperienceCollaborators { get; set; } // Collaborative Experiences
        public DbSet<Event> Events { get; set; } // Events & Meetups
        public DbSet<EventAttendee> EventAttendees { get; set; }  

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Comment>()
             .HasOne(c => c.User)
             .WithMany()
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Comment>()
         .HasOne(c => c.ParentComment)
         .WithMany(c => c.Replies)
         .HasForeignKey(c => c.ParentCommentId)
         .OnDelete(DeleteBehavior.Restrict); // 🔹 Silinmə halında əlaqəni qoruyuruq

            // 🔹 Like və Dislike məhdudiyyətləri (hər istifadəçi bir dəfə səs verə bilər)
            modelBuilder.Entity<CommentReaction>()
                .HasIndex(cl => new { cl.CommentId, cl.UserId })
                .IsUnique();
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Experience)
                .WithMany(e => e.Comments)
                .HasForeignKey(c => c.ExperienceId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<FollowRequest>()
                .HasKey(fr => fr.Id);  // Birincil anahtar olarak 'Id' özelliği tanımlanıyor
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)  // Burada da UserName'i kullandık
                .IsUnique();
            modelBuilder.Entity<Models.ExperienceModel>()
                .HasOne(o => o.User)
                .WithMany(i => i.Experiences)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ExperienceModel>()
                .HasMany(e => e.ImageUrls)
                .WithOne(i => i.Experience)
                .HasForeignKey(i => i.ExperienceId);
            // Follow relationship
            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Follower)
                .WithMany(u => u.Followings)
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.NoAction); // ✅ No Action qoyduq ki, constraint error verməsin

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Followed)
                .WithMany(u => u.Followers)
                .HasForeignKey(f => f.FollowedId)
                .OnDelete(DeleteBehavior.NoAction); // ✅ No Action qoyduq

            modelBuilder.Entity<FollowRequest>()
    .HasOne(fr => fr.Follower)
    .WithMany()
    .HasForeignKey(fr => fr.FollowerId)
    .OnDelete(DeleteBehavior.Restrict); // 🔥 Problemi həll edir

            modelBuilder.Entity<FollowRequest>()
                .HasOne(fr => fr.Followed)
                .WithMany()
                .HasForeignKey(fr => fr.FollowedId)
                .OnDelete(DeleteBehavior.Cascade); // ❗ Yalnız birində CASCADE olsun


            modelBuilder.Entity<ExperienceTag>()
                .HasKey(et => new { et.ExperienceId, et.TagId });

            modelBuilder.Entity<ExperienceTag>()
                .HasOne(et => et.Experience)
                .WithMany(e => e.ExperienceTags)
                .HasForeignKey(et => et.ExperienceId);

            modelBuilder.Entity<ExperienceTag>()
                .HasOne(et => et.Tag)
                .WithMany(t => t.ExperienceTags)
                .HasForeignKey(et => et.TagId);
            // Like relationship
            modelBuilder.Entity<Like>()
                .HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Like>()
                .HasOne(l => l.Experience)
                .WithMany(e => e.Likes)
                .HasForeignKey(l => l.ExperienceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Notification relationship
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        }
    }
