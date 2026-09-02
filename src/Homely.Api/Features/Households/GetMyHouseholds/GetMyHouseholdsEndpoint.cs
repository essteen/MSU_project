using System.Security.Claims;
using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.GetMyHouseholds;

public static class GetMyHouseholdsEndpoint
{
    public static IEndpointRouteBuilder MapGetMyHouseholds(this IEndpointRouteBuilder app)
    {
        app.MapGet("/households/mine", async (ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await GetMyHouseholdsHandler.HandleAsync(userId, db));
        }).RequireAuthorization();

        return app;
    }
}
