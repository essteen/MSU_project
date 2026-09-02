using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.JoinRequests;

public static class GetMyJoinRequestsHandler
{
    public static async Task<List<JoinRequestDto>> HandleAsync(Guid userId, HomelyDbContext db) =>
        await db.HouseholdJoinRequests
            .Include(r => r.Household)
            .Include(r => r.User)
            .Where(r => r.Status == JoinRequestStatus.Pending && r.UserId == userId)
            .Select(r => new JoinRequestDto(
                r.Id,
                r.HouseholdId,
                r.Household!.Name ?? "",
                r.UserId,
                r.User!.Username,
                r.RequestedAt))
            .ToListAsync();
}
