using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Items.GetItems;

public static class GetItemsHandler
{
    public static async Task<List<Item>> HandleAsync(HomelyDbContext db) =>
        await db.Items
            .Include(i => i.Owner)
            .ToListAsync();
}
