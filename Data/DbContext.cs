using Microsoft.EntityFrameworkCore;
using ExperienceProject.Models;

namespace ExperienceProject.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<InteractionSettings> InteractionSettings { get; set; }
        public DbSet<ContentSettings> ContentSettings { get; set; }
        public DbSet<AppSettings> AppSettings { get; set; }
        public DbSet<AccountTools> AccountTools { get; set; }
        public DbSet<CloseFriends> CloseFriends { get; set; }
        public DbSet<BlockedUsers> BlockedUsers { get; set; }
        public DbSet<MutedUsers> MutedUsers { get; set; }
        public DbSet<HiddenWords> HiddenWords { get; set; }
    }
}

