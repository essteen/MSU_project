using Homely.Api.Features.Households.JoinRequests;
using Homely.Core.Entities;
using Xunit;

namespace Homely.Api.Tests;

public class RejectJoinRequestHandlerTests
{
    private static async Task<(Household household, User admin, HouseholdJoinRequest request)> SeedPendingRequestAsync(
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

        return (household, admin, request);
    }

    [Fact]
    public async Task HandleAsync_WhenCalledByAdmin_RejectsWithoutAddingMember()
    {
        using var db = TestDb.Create();
        var (household, admin, request) = await SeedPendingRequestAsync(db);

        var result = await RejectJoinRequestHandler.HandleAsync(request.Id, admin.Id, db);

        Assert.Equal(ResolveJoinRequestStatus.Resolved, result.Status);
        Assert.DoesNotContain(household.Members, m => m.Id == request.UserId);
        Assert.Equal(JoinRequestStatus.Rejected, db.HouseholdJoinRequests.Single().Status);
    }

    [Fact]
    public async Task HandleAsync_WhenCalledByNonAdmin_ReturnsForbidden()
    {
        using var db = TestDb.Create();
        var (_, _, request) = await SeedPendingRequestAsync(db);

        var result = await RejectJoinRequestHandler.HandleAsync(request.Id, Guid.NewGuid(), db);

        Assert.Equal(ResolveJoinRequestStatus.Forbidden, result.Status);
        Assert.Equal(JoinRequestStatus.Pending, db.HouseholdJoinRequests.Single().Status);
    }
}
