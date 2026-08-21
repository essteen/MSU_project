using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.GetHouseholds;

public static class GetHouseholdsHandler
{
    public static async Task<List<Household>> HandleAsync(HomelyDbContext db) =>
        await db.Households
            .Include(h => h.Members)
            .Include(h => h.Items)
            .ToListAsync();
}
