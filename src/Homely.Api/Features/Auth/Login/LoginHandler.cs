using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Auth.Login;

public static class LoginHandler
{
    public static async Task<User?> HandleAsync(
        LoginRequest request,
        HomelyDbContext db,
        IPasswordHasher<User> hasher)
    {
        var identifier = request.UsernameOrEmail?.Trim() ?? string.Empty;

        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == identifier || u.Email == identifier);

        if (user is null || string.IsNullOrEmpty(user.PasswordHash))
        {
            return null;
        }

        var verification = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        return verification == PasswordVerificationResult.Failed ? null : user;
    }
}
