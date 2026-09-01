using Homely.Api.Auth;
using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;

namespace Homely.Api.Features.Auth.Register;

public static class RegisterEndpoint
{
    public static IEndpointRouteBuilder MapRegister(this IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/register", async (
            RegisterRequest request,
            HomelyDbContext db,
            IPasswordHasher<User> hasher,
            TokenService tokenService) =>
        {
            var result = await RegisterHandler.HandleAsync(request, db, hasher);

            if (result.User is null)
            {
                return Results.BadRequest(result.Error);
            }

            var token = tokenService.CreateToken(result.User);
            var response = new AuthResponse(token, UserSummary.FromUser(result.User));

            return Results.Created($"/users/{result.User.Id}", response);
        });

        return app;
    }
}
