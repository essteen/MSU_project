using Homely.Core.Entities;

namespace Homely.Api.Features.Auth;

public record AuthResponse(string Token, UserSummary User);

public record UserSummary(Guid Id, string Username, string Email, string? Name)
{
    public static UserSummary FromUser(User user) => new(user.Id, user.Username, user.Email, user.Name);
}
