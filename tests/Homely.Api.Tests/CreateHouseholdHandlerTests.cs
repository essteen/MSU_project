using Homely.Api.Features.Households.CreateHousehold;
using Homely.Core.Entities;
using Xunit;

namespace Homely.Api.Tests;

public class CreateHouseholdHandlerTests
{
    [Fact]
    public async Task HandleAsync_WithExistingCreator_CreatesHouseholdAndAddsCreatorAsMember()
    {
        using var db = TestDb.Create();
        var creator = new User { Id = Guid.NewGuid(), Username = "skaper", Email = "skaper@example.com" };
        db.Users.Add(creator);
        await db.SaveChangesAsync();

        var household = await CreateHouseholdHandler.HandleAsync(new CreateHouseholdRequest("Mitt bofellesskap"), creator.Id, db);

        Assert.NotNull(household);
        Assert.Equal("Mitt bofellesskap", household!.Name);
        Assert.Equal(creator.Id, household.CreatedByUserId);
        Assert.Single(household.Members);
        Assert.Equal(creator.Id, household.Members[0].Id);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentCreator_ReturnsNull()
    {
        using var db = TestDb.Create();

        var household = await CreateHouseholdHandler.HandleAsync(new CreateHouseholdRequest("Spøkelseshus"), Guid.NewGuid(), db);

        Assert.Null(household);
        Assert.Empty(db.Households);
    }
}
