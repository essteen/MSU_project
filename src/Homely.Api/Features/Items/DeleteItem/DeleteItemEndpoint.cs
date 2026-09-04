using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Items.DeleteItem;

public static class DeleteItemEndpoint
{
    public static IEndpointRouteBuilder MapDeleteItem(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/items/{itemId:int}", async (int itemId, HomelyDbContext db) =>
        {
            var deleted = await DeleteItemHandler.HandleAsync(itemId, db);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        return app;
    }
}
