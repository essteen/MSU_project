using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Tests;

public static class TestDb
{
    public static HomelyDbContext Create()
    {
        var options = new DbContextOptionsBuilder<HomelyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new HomelyDbContext(options);
    }
}
