namespace Homely.Api.Features.Users.CreateUser;

public record CreateUserRequest(string Name, Guid? HouseholdId);
