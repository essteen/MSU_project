using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Wishes.GetWishes;

public static class GetWishesHandler
{
    public static async Task<List<Wish>> HandleAsync(HomelyDbContext db) =>
        await db.Wishes
            .Include(w => w.AddedByUser)
            .ToListAsync();
}
