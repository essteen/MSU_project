namespace Homely.Api.Features.Households.JoinHousehold;

public enum JoinHouseholdStatus
{
    Requested,
    HouseholdNotFound,
    AlreadyMember,
    AlreadyRequested
}

public record JoinHouseholdResult(JoinHouseholdStatus Status);
