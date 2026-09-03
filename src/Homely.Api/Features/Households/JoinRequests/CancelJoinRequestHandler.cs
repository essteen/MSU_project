using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.JoinRequests;

public static class CancelJoinRequestHandler
{
    public static async Task<ResolveJoinRequestResult> HandleAsync(Guid requestId, Guid requestingUserId, HomelyDbContext db)
    {
        var request = await db.HouseholdJoinRequests.FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
        {
            return new ResolveJoinRequestResult(ResolveJoinRequestStatus.NotFound);
        }

        if (request.UserId != requestingUserId)
        {
            return new ResolveJoinRequestResult(ResolveJoinRequestStatus.Forbidden);
        }

        if (request.Status != JoinRequestStatus.Pending)
        {
            return new ResolveJoinRequestResult(ResolveJoinRequestStatus.AlreadyResolved);
        }

        db.HouseholdJoinRequests.Remove(request);
        await db.SaveChangesAsync();

        return new ResolveJoinRequestResult(ResolveJoinRequestStatus.Resolved);
    }
}
