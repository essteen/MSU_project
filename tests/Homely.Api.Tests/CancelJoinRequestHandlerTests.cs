using Homely.Api.Features.Households.JoinRequests;
using Homely.Core.Entities;
using Xunit;

namespace Homely.Api.Tests;

public class CancelJoinRequestHandlerTests
{
    private static async Task<(User requester, HouseholdJoinRequest request)> SeedPendingRequestAsync(
        Homely.Infrastructure.Data.HomelyDbContext db)
    {
        var admin = new User { Id = Guid.NewGuid(), Username = "admin", Email = "admin@example.com" };
        var requester = new User { Id = Guid.NewGuid(), Username = "requester", Email = "requester@example.com" };
        var household = new Household
        {
            HouseholdId = Guid.NewGuid(),
            Name = "Testhus",
            CreatedByUserId = admin.Id,
            Members = new List<User> { admin }
        };
        var request = new HouseholdJoinRequest
        {
            Id = Guid.NewGuid(),
            HouseholdId = household.HouseholdId,
            UserId = requester.Id,
            Status = JoinRequestStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        db.Users.AddRange(admin, requester);
        db.Households.Add(household);
        db.HouseholdJoinRequests.Add(request);
        await db.SaveChangesAsync();

        return (requester, request);
    }

    [Fact]
    public async Task HandleAsync_WhenCalledByRequester_RemovesRequest()
    {
        using var db = TestDb.Create();
        var (requester, request) = await SeedPendingRequestAsync(db);

        var result = await CancelJoinRequestHandler.HandleAsync(request.Id, requester.Id, db);

        Assert.Equal(ResolveJoinRequestStatus.Resolved, result.Status);
        Assert.Empty(db.HouseholdJoinRequests);
    }

    [Fact]
    public async Task HandleAsync_WhenCalledBySomeoneElse_ReturnsForbidden_AndKeepsRequest()
    {
        using var db = TestDb.Create();
        var (_, request) = await SeedPendingRequestAsync(db);

        var result = await CancelJoinRequestHandler.HandleAsync(request.Id, Guid.NewGuid(), db);

        Assert.Equal(ResolveJoinRequestStatus.Forbidden, result.Status);
        Assert.Single(db.HouseholdJoinRequests);
    }

    [Fact]
    public async Task HandleAsync_ForNonExistentRequest_ReturnsNotFound()
    {
        using var db = TestDb.Create();

        var result = await CancelJoinRequestHandler.HandleAsync(Guid.NewGuid(), Guid.NewGuid(), db);

        Assert.Equal(ResolveJoinRequestStatus.NotFound, result.Status);
    }
}
