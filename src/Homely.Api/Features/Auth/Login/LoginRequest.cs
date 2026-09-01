namespace Homely.Api.Features.Auth.Login;

public record LoginRequest(string UsernameOrEmail, string Password);
