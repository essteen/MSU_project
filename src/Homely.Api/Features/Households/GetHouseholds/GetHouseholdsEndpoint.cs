using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.GetHouseholds;

public static class GetHouseholdsEndpoint
{
    public static IEndpointRouteBuilder MapGetHouseholds(this IEndpointRouteBuilder app)
    {
        app.MapGet("/households", async (HomelyDbContext db) =>
            Results.Ok(await GetHouseholdsHandler.HandleAsync(db)));

        return app;
    }
}
