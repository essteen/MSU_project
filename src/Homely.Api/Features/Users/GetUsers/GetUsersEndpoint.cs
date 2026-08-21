using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Users.GetUsers;

public static class GetUsersEndpoint
{
    public static IEndpointRouteBuilder MapGetUsers(this IEndpointRouteBuilder app)
    {
        app.MapGet("/users", async (HomelyDbContext db) =>
            Results.Ok(await GetUsersHandler.HandleAsync(db)));

        return app;
    }
}
