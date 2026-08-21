using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Users.CreateUser;

public static class CreateUserEndpoint
{
    public static IEndpointRouteBuilder MapCreateUser(this IEndpointRouteBuilder app)
    {
        app.MapPost("/users", async (CreateUserRequest request, HomelyDbContext db) =>
        {
            var user = await CreateUserHandler.HandleAsync(request, db);

            return user is null
                ? Results.BadRequest("HouseholdId does not match an existing household.")
                : Results.Created($"/users/{user.Id}", user);
        });

        return app;
    }
}
