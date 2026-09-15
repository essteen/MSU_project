// Homely.Infrastructure/Data/HomelyDbContext.cs
using Homely.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Homely.Infrastructure.Data;

public class HomelyDbContext : DbContext
{
    public HomelyDbContext(DbContextOptions<HomelyDbContext> options) : base(options) { }

    public DbSet<Household> Households => Set<Household>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Wish> Wishes => Set<Wish>();
    public DbSet<HouseholdJoinRequest> HouseholdJoinRequests => Set<HouseholdJoinRequest>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    // legg til flere DbSet<> etter behov, basert p� entities i Homely.Core

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique().HasFilter("Email <> ''");
            entity.HasIndex(u => u.Username).IsUnique().HasFilter("Username <> ''");
        });

        modelBuilder.Entity<CalendarEvent>(entity =>
        {
            entity.HasIndex(calendarEvent => new
            {
                calendarEvent.HouseholdId,
                calendarEvent.StartTime
            });

            entity.HasOne(calendarEvent => calendarEvent.Household)
                .WithMany(household => household.CalendarEvents)
                .HasForeignKey(calendarEvent => calendarEvent.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(calendarEvent => calendarEvent.CreatedByUser)
                .WithMany()
                .HasForeignKey(calendarEvent => calendarEvent.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}