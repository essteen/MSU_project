using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Households.JoinRequests;

public static class ApproveJoinRequestHandler
{
    public static async Task<ResolveJoinRequestResult> HandleAsync(Guid requestId, Guid adminUserId, HomelyDbContext db)
    {
        var request = await db.HouseholdJoinRequests
            .Include(r => r.Household)
            .ThenInclude(h => h!.Members)
            .Include(r => r.User)
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

        request.Household.Members.Add(request.User!);
        request.Status = JoinRequestStatus.Approved;
        await db.SaveChangesAsync();

        return new ResolveJoinRequestResult(ResolveJoinRequestStatus.Resolved);
    }
}
