using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.CreateHousehold;

public static class CreateHouseholdHandler
{
    public static async Task<Household?> HandleAsync(CreateHouseholdRequest request, Guid creatorUserId, HomelyDbContext db)
    {
        var creator = await db.Users.FirstOrDefaultAsync(u => u.Id == creatorUserId);
        if (creator is null)
        {
            return null;
        }

        var household = new Household
        {
            HouseholdId = Guid.NewGuid(),
            Name = request.Name,
            Members = new List<User> { creator }
        };

        db.Households.Add(household);
        await db.SaveChangesAsync();

        return household;
    }
}
