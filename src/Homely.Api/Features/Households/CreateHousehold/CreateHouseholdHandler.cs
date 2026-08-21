using Homely.Core.Entities;
using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.CreateHousehold;

public static class CreateHouseholdHandler
{
    public static async Task<Household> HandleAsync(CreateHouseholdRequest request, HomelyDbContext db)
    {
        var household = new Household
        {
            HouseholdId = Guid.NewGuid(),
            Name = request.Name
        };

        db.Households.Add(household);
        await db.SaveChangesAsync();

        return household;
    }
}
