using Homely.Core.Entities;

namespace Homely.Api.Features.Auth.Register;

public record RegisterResult(User? User, string? Error);
