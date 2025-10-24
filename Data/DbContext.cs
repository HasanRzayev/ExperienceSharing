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

        public DbSet<DeviceSession> DeviceSessions { get; set; }
        public DbSet<DeviceLink> DeviceLinks { get; set; }
    }
}

