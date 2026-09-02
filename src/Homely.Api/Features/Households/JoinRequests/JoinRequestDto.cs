namespace Homely.Api.Features.Households.JoinRequests;

public record JoinRequestDto(
    Guid RequestId,
    Guid HouseholdId,
    string HouseholdName,
    Guid UserId,
    string Username,
    DateTime RequestedAt);
