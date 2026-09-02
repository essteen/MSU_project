using Homely.Core.Entities;

namespace Homely.Api.Features.Households.JoinHousehold;

public enum JoinHouseholdStatus
{
    Joined,
    HouseholdNotFound,
    AlreadyMember
}

public record JoinHouseholdResult(JoinHouseholdStatus Status, Household? Household);
