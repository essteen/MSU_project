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
    // legg til flere DbSet<> etter behov, basert på entities i Homely.Core
}