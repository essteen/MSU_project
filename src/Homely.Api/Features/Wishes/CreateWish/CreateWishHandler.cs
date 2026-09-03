using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Wishes.CreateWish;

public static class CreateWishHandler
{
    public static async Task<Wish?> HandleAsync(CreateWishRequest request, HomelyDbContext db)
    {
        var householdExists = await db.Households.AnyAsync(h => h.HouseholdId == request.HouseholdId);
        var userExists = await db.Users.AnyAsync(u => u.Id == request.AddedByUserId);
        if (!householdExists || !userExists)
        {
            return null;
        }

        var wish = new Wish
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Link = request.Link,
            Price = request.Price,
            AddedByUserId = request.AddedByUserId,
            HouseholdId = request.HouseholdId
        };

        db.Wishes.Add(wish);
        await db.SaveChangesAsync();
        return wish;
    }
}
