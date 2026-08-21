using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Items.GetItems;

public static class GetItemsEndpoint
{
    public static IEndpointRouteBuilder MapGetItems(this IEndpointRouteBuilder app)
    {
        app.MapGet("/items", async (HomelyDbContext db) =>
            Results.Ok(await GetItemsHandler.HandleAsync(db)));

        return app;
    }
}
