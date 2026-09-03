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
            return new RegisterResult(null, "Brukernavnet må være mellom 3 og 30 tegn.");
        }

        if (!EmailRegex.IsMatch(email))
        {
            return new RegisterResult(null, "E-postadressen er ikke gyldig.");
        }

        if (request.Password != request.ConfirmPassword)
        {
            return new RegisterResult(null, "Passordene er ikke like.");
        }

        if (!IsPasswordStrongEnough(request.Password))
        {
            return new RegisterResult(null, "Passordet må være minst 8 tegn og inneholde minst én stor bokstav og ett tall.");
        }

        if (request.BirthDate == default || request.BirthDate > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return new RegisterResult(null, "Fødselsdatoen er ikke gyldig.");
        }

        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            return new RegisterResult(null, "E-postadressen er allerede registrert.");
        }

        if (await db.Users.AnyAsync(u => u.Username == username))
        {
            return new RegisterResult(null, "Brukernavnet er allerede tatt.");
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
            return new RegisterResult(null, "E-post eller brukernavn er allerede registrert.");
        }

        return new RegisterResult(user, null);
    }

    private static bool IsPasswordStrongEnough(string password) =>
        !string.IsNullOrEmpty(password) &&
        password.Length >= 8 &&
        password.Any(char.IsUpper) &&
        password.Any(char.IsDigit);
}
