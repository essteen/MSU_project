using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Wishes.GetWishes;

public static class GetWishesEndpoint
{
    public static IEndpointRouteBuilder MapGetWishes(this IEndpointRouteBuilder app)
    {
        app.MapGet("/wishes", async (HomelyDbContext db) =>
            Results.Ok(await GetWishesHandler.HandleAsync(db)));

        return app;
    }
}
