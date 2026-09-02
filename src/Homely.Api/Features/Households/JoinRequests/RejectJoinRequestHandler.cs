using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.JoinRequests;

public static class RejectJoinRequestHandler
{
    public static async Task<ResolveJoinRequestResult> HandleAsync(Guid requestId, Guid adminUserId, HomelyDbContext db)
    {
        var request = await db.HouseholdJoinRequests
            .Include(r => r.Household)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
        {
            return new ResolveJoinRequestResult(ResolveJoinRequestStatus.NotFound);
        }

        if (request.Household!.CreatedByUserId != adminUserId)
        {
            return new ResolveJoinRequestResult(ResolveJoinRequestStatus.Forbidden);
        }

        if (request.Status != JoinRequestStatus.Pending)
        {
            return new ResolveJoinRequestResult(ResolveJoinRequestStatus.AlreadyResolved);
        }

        request.Status = JoinRequestStatus.Rejected;
        await db.SaveChangesAsync();

        return new ResolveJoinRequestResult(ResolveJoinRequestStatus.Resolved);
    }
}
