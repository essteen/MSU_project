using Homely.Core.Entities;
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
            return new JoinHouseholdResult(JoinHouseholdStatus.HouseholdNotFound);
        }

        if (household.Members.Any(m => m.Id == userId))
        {
            return new JoinHouseholdResult(JoinHouseholdStatus.AlreadyMember);
        }

        var alreadyRequested = await db.HouseholdJoinRequests.AnyAsync(r =>
            r.HouseholdId == householdId && r.UserId == userId && r.Status == JoinRequestStatus.Pending);

        if (alreadyRequested)
        {
            return new JoinHouseholdResult(JoinHouseholdStatus.AlreadyRequested);
        }

        db.HouseholdJoinRequests.Add(new HouseholdJoinRequest
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            UserId = userId,
            Status = JoinRequestStatus.Pending,
            RequestedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync();

        return new JoinHouseholdResult(JoinHouseholdStatus.Requested);
    }
}
