using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Users.CreateUser;

public static class CreateUserHandler
{
    public static async Task<User?> HandleAsync(CreateUserRequest request, HomelyDbContext db)
    {
        if (request.HouseholdId is { } householdId &&
            !await db.Households.AnyAsync(h => h.HouseholdId == householdId))
        {
            return null;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            HouseholdId = request.HouseholdId
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return user;
    }
}
