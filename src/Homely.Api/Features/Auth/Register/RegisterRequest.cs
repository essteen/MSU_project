namespace Homely.Api.Features.Auth.Register;

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string ConfirmPassword,
    DateOnly BirthDate,
    string? Name);
