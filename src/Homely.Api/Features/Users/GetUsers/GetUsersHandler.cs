using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Users.GetUsers;

public static class GetUsersHandler
{
    public static async Task<List<User>> HandleAsync(HomelyDbContext db) =>
        await db.Users.ToListAsync();
}
