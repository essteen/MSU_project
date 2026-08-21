using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Items.CreateItem;

public static class CreateItemHandler
{
    public static async Task<Item?> HandleAsync(CreateItemRequest request, HomelyDbContext db)
    {
        var householdExists = await db.Households.AnyAsync(h => h.HouseholdId == request.HouseholdId);
        var ownerExists = await db.Users.AnyAsync(u => u.Id == request.OwnerId);
        if (!householdExists || !ownerExists)
        {
            return null;
        }

        var item = new Item
        {
            Name = request.Name,
            Category = request.Category,
            Price = request.Price ?? 0,
            OwnerId = request.OwnerId,
            HouseholdId = request.HouseholdId
        };

        db.Items.Add(item);
        await db.SaveChangesAsync();
        return item;
    }
}