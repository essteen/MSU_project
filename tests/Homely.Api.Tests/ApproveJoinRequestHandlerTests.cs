using Homely.Api.Features.Households.JoinRequests;
using Homely.Core.Entities;
using Xunit;

namespace Homely.Api.Tests;

public class ApproveJoinRequestHandlerTests
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
    public async Task HandleAsync_WhenCalledByAdmin_ApprovesAndAddsMember()
    {
        using var db = TestDb.Create();
        var (household, admin, request) = await SeedPendingRequestAsync(db);

        var result = await ApproveJoinRequestHandler.HandleAsync(request.Id, admin.Id, db);

        Assert.Equal(ResolveJoinRequestStatus.Resolved, result.Status);
        Assert.Contains(household.Members, m => m.Id == request.UserId);
        Assert.Equal(JoinRequestStatus.Approved, db.HouseholdJoinRequests.Single().Status);
    }

    [Fact]
    public async Task HandleAsync_WhenCalledByNonAdmin_ReturnsForbidden_AndDoesNotAddMember()
    {
        using var db = TestDb.Create();
        var (household, _, request) = await SeedPendingRequestAsync(db);
        var impostor = Guid.NewGuid();

        var result = await ApproveJoinRequestHandler.HandleAsync(request.Id, impostor, db);

        Assert.Equal(ResolveJoinRequestStatus.Forbidden, result.Status);
        Assert.DoesNotContain(household.Members, m => m.Id == request.UserId);
    }

    [Fact]
    public async Task HandleAsync_ForNonExistentRequest_ReturnsNotFound()
    {
        using var db = TestDb.Create();

        var result = await ApproveJoinRequestHandler.HandleAsync(Guid.NewGuid(), Guid.NewGuid(), db);

        Assert.Equal(ResolveJoinRequestStatus.NotFound, result.Status);
    }

    [Fact]
    public async Task HandleAsync_WhenAlreadyResolved_ReturnsAlreadyResolved()
    {
        using var db = TestDb.Create();
        var (_, admin, request) = await SeedPendingRequestAsync(db);
        await ApproveJoinRequestHandler.HandleAsync(request.Id, admin.Id, db);

        var result = await ApproveJoinRequestHandler.HandleAsync(request.Id, admin.Id, db);

        Assert.Equal(ResolveJoinRequestStatus.AlreadyResolved, result.Status);
    }
}
