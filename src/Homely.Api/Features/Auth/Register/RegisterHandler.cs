using System.Text.RegularExpressions;
using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Auth.Register;

public static class RegisterHandler
{
    private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    public static async Task<RegisterResult> HandleAsync(
        RegisterRequest request,
        HomelyDbContext db,
        IPasswordHasher<User> hasher)
    {
        var username = request.Username?.Trim() ?? string.Empty;
        var email = request.Email?.Trim() ?? string.Empty;

        if (username.Length < 3 || username.Length > 30)
        {
            return new RegisterResult(null, "Username must be between 3 and 30 characters.");
        }

        if (!EmailRegex.IsMatch(email))
        {
            return new RegisterResult(null, "Email is not a valid email address.");
        }

        if (request.Password != request.ConfirmPassword)
        {
            return new RegisterResult(null, "Passwords do not match.");
        }

        if (!IsPasswordStrongEnough(request.Password))
        {
            return new RegisterResult(null, "Password must be at least 8 characters and include at least one uppercase letter and one number.");
        }

        if (request.BirthDate == default || request.BirthDate > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return new RegisterResult(null, "Birth date is not valid.");
        }

        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            return new RegisterResult(null, "Email already registered.");
        }

        if (await db.Users.AnyAsync(u => u.Username == username))
        {
            return new RegisterResult(null, "Username already taken.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            BirthDate = request.BirthDate,
            Name = string.IsNullOrWhiteSpace(request.Name) ? username : request.Name.Trim()
        };

        user.PasswordHash = hasher.HashPassword(user, request.Password);

        try
        {
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return new RegisterResult(null, "Email or username already registered.");
        }

        return new RegisterResult(user, null);
    }

    private static bool IsPasswordStrongEnough(string password) =>
        !string.IsNullOrEmpty(password) &&
        password.Length >= 8 &&
        password.Any(char.IsUpper) &&
        password.Any(char.IsDigit);
}
