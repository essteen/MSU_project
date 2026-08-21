using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Items.CreateItem;

public static class CreateItemEndpoint
{
    public static IEndpointRouteBuilder MapCreateItem(this IEndpointRouteBuilder app)
    {
        app.MapPost("/items", async (CreateItemRequest request, HomelyDbContext db) =>
        {
            var item = await CreateItemHandler.HandleAsync(request, db);

            return item is null
                ? Results.BadRequest("HouseholdId or OwnerId does not match an existing household/user.")
                : Results.Created($"/items/{item.ItemId}", item);
        });

        return app;
    }
}
