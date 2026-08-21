using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.CreateHousehold;

public static class CreateHouseholdEndpoint
{
    public static IEndpointRouteBuilder MapCreateHousehold(this IEndpointRouteBuilder app)
    {
        app.MapPost("/households", async (CreateHouseholdRequest request, HomelyDbContext db) =>
        {
            var household = await CreateHouseholdHandler.HandleAsync(request, db);
            return Results.Created($"/households/{household.HouseholdId}", household);
        });

        return app;
    }
}
