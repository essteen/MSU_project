using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Wishes.CreateWish;

public static class CreateWishEndpoint
{
    public static IEndpointRouteBuilder MapCreateWish(this IEndpointRouteBuilder app)
    {
        app.MapPost("/wishes", async (CreateWishRequest request, HomelyDbContext db) =>
        {
            var wish = await CreateWishHandler.HandleAsync(request, db);

            return wish is null
                ? Results.BadRequest("HouseholdId eller AddedByUserId samsvarer ikke med en eksisterende husholdning/bruker.")
                : Results.Created($"/wishes/{wish.Id}", wish);
        });

        return app;
    }
}
