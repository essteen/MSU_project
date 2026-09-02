using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.GetMyHouseholds;

public static class GetMyHouseholdsHandler
{
    public static async Task<List<Household>> HandleAsync(Guid userId, HomelyDbContext db) =>
        await db.Households
            .Include(h => h.Members)
            .Where(h => h.Members.Any(m => m.Id == userId))
            .ToListAsync();
}
