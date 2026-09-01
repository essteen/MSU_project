using Homely.Api.Auth;
using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;

namespace Homely.Api.Features.Auth.Login;

public static class LoginEndpoint
{
    public static IEndpointRouteBuilder MapLogin(this IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/login", async (
            LoginRequest request,
            HomelyDbContext db,
            IPasswordHasher<User> hasher,
            TokenService tokenService) =>
        {
            var user = await LoginHandler.HandleAsync(request, db, hasher);

            if (user is null)
            {
                return Results.Json(new { error = "Invalid username/email or password." }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var token = tokenService.CreateToken(user);
            var response = new AuthResponse(token, UserSummary.FromUser(user));

            return Results.Ok(response);
        });

        return app;
    }
}
