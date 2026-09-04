using Homely.Api.Features.Auth.Register;
using Homely.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Xunit;

namespace Homely.Api.Tests;

public class RegisterHandlerTests
{
    private static readonly IPasswordHasher<User> Hasher = new PasswordHasher<User>();

    private static RegisterRequest ValidRequest(
        string username = "gyldigbruker",
        string email = "test@example.com",
        string password = "Password1",
        string? confirmPassword = null,
        DateOnly? birthDate = null,
        string? name = null) =>
        new(username, email, password, confirmPassword ?? password, birthDate ?? new DateOnly(2000, 1, 1), name);

    [Fact]
    public async Task HandleAsync_WithValidRequest_CreatesUser()
    {
        using var db = TestDb.Create();

        var result = await RegisterHandler.HandleAsync(ValidRequest(), db, Hasher);

        Assert.Null(result.Error);
        Assert.NotNull(result.User);
        Assert.Equal("gyldigbruker", result.User!.Username);
        Assert.Single(db.Users);
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("thisusernameiswaytoolongtobevalidhere")]
    public async Task HandleAsync_WithInvalidUsernameLength_ReturnsError(string username)
    {
        using var db = TestDb.Create();

        var result = await RegisterHandler.HandleAsync(ValidRequest(username: username), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("Brukernavnet", result.Error);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("missing-at-sign.com")]
    public async Task HandleAsync_WithInvalidEmail_ReturnsError(string email)
    {
        using var db = TestDb.Create();

        var result = await RegisterHandler.HandleAsync(ValidRequest(email: email), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("E-postadressen", result.Error);
    }

    [Fact]
    public async Task HandleAsync_WithMismatchedPasswords_ReturnsError()
    {
        using var db = TestDb.Create();

        var result = await RegisterHandler.HandleAsync(
            ValidRequest(password: "Password1", confirmPassword: "Password2"), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("Passordene", result.Error);
    }

    [Theory]
    [InlineData("short1A")]
    [InlineData("nouppercase1")]
    [InlineData("NoDigitsHere")]
    public async Task HandleAsync_WithWeakPassword_ReturnsError(string password)
    {
        using var db = TestDb.Create();

        var result = await RegisterHandler.HandleAsync(ValidRequest(password: password), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("Passordet", result.Error);
    }

    [Fact]
    public async Task HandleAsync_WithFutureBirthDate_ReturnsError()
    {
        using var db = TestDb.Create();
        var futureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1));

        var result = await RegisterHandler.HandleAsync(ValidRequest(birthDate: futureDate), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("Fødselsdatoen", result.Error);
    }

    [Fact]
    public async Task HandleAsync_WithAlreadyRegisteredEmail_ReturnsError()
    {
        using var db = TestDb.Create();
        await RegisterHandler.HandleAsync(ValidRequest(username: "forsteBruker", email: "dupe@example.com"), db, Hasher);

        var result = await RegisterHandler.HandleAsync(ValidRequest(username: "andreBruker", email: "dupe@example.com"), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("allerede registrert", result.Error);
    }

    [Fact]
    public async Task HandleAsync_WithAlreadyTakenUsername_ReturnsError()
    {
        using var db = TestDb.Create();
        await RegisterHandler.HandleAsync(ValidRequest(username: "opptattnavn", email: "first@example.com"), db, Hasher);

        var result = await RegisterHandler.HandleAsync(ValidRequest(username: "opptattnavn", email: "second@example.com"), db, Hasher);

        Assert.Null(result.User);
        Assert.Contains("allerede tatt", result.Error);
    }
}
