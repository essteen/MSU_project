using Homely.Api.Features.Households.JoinHousehold;
using Homely.Core.Entities;
using Xunit;

namespace Homely.Api.Tests;

public class JoinHouseholdHandlerTests
{
    private static async Task<(Household household, User requester)> SeedHouseholdAsync(Homely.Infrastructure.Data.HomelyDbContext db)
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

        db.Users.AddRange(admin, requester);
        db.Households.Add(household);
        await db.SaveChangesAsync();

        return (household, requester);
    }

    [Fact]
    public async Task HandleAsync_ForExistingHousehold_CreatesPendingRequest_AndDoesNotGrantMembership()
    {
        using var db = TestDb.Create();
        var (household, requester) = await SeedHouseholdAsync(db);

        var result = await JoinHouseholdHandler.HandleAsync(household.HouseholdId, requester.Id, db);

        Assert.Equal(JoinHouseholdStatus.Requested, result.Status);
        Assert.Single(db.HouseholdJoinRequests);
        Assert.DoesNotContain(household.Members, m => m.Id == requester.Id);
    }

    [Fact]
    public async Task HandleAsync_ForNonExistentHousehold_ReturnsHouseholdNotFound()
    {
        using var db = TestDb.Create();

        var result = await JoinHouseholdHandler.HandleAsync(Guid.NewGuid(), Guid.NewGuid(), db);

        Assert.Equal(JoinHouseholdStatus.HouseholdNotFound, result.Status);
    }

    [Fact]
    public async Task HandleAsync_WhenAlreadyAMember_ReturnsAlreadyMember()
    {
        using var db = TestDb.Create();
        var (household, requester) = await SeedHouseholdAsync(db);
        household.Members.Add(requester);
        await db.SaveChangesAsync();

        var result = await JoinHouseholdHandler.HandleAsync(household.HouseholdId, requester.Id, db);

        Assert.Equal(JoinHouseholdStatus.AlreadyMember, result.Status);
    }

    [Fact]
    public async Task HandleAsync_WhenAlreadyRequested_ReturnsAlreadyRequested()
    {
        using var db = TestDb.Create();
        var (household, requester) = await SeedHouseholdAsync(db);
        await JoinHouseholdHandler.HandleAsync(household.HouseholdId, requester.Id, db);

        var result = await JoinHouseholdHandler.HandleAsync(household.HouseholdId, requester.Id, db);

        Assert.Equal(JoinHouseholdStatus.AlreadyRequested, result.Status);
        Assert.Single(db.HouseholdJoinRequests);
    }
}
