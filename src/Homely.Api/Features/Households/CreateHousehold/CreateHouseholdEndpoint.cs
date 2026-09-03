using System.Security.Claims;
using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.CreateHousehold;

public static class CreateHouseholdEndpoint
{
    public static IEndpointRouteBuilder MapCreateHousehold(this IEndpointRouteBuilder app)
    {
        app.MapPost("/households", async (CreateHouseholdRequest request, ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var household = await CreateHouseholdHandler.HandleAsync(request, userId, db);
            return household is null
                ? Results.Unauthorized()
                : Results.Created($"/households/{household.HouseholdId}", household);
        }).RequireAuthorization();

        return app;
    }
}
