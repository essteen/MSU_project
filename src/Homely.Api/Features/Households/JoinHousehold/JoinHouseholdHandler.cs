using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.JoinHousehold;

public static class JoinHouseholdHandler
{
    public static async Task<JoinHouseholdResult> HandleAsync(Guid householdId, Guid userId, HomelyDbContext db)
    {
        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.HouseholdId == householdId);

        if (household is null)
        {
            return new JoinHouseholdResult(JoinHouseholdStatus.HouseholdNotFound, null);
        }

        if (household.Members.Any(m => m.Id == userId))
        {
            return new JoinHouseholdResult(JoinHouseholdStatus.AlreadyMember, household);
        }

        var user = await db.Users.FirstAsync(u => u.Id == userId);
        household.Members.Add(user);
        await db.SaveChangesAsync();

        return new JoinHouseholdResult(JoinHouseholdStatus.Joined, household);
    }
}
