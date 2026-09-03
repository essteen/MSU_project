namespace Homely.Core.Entities;

public enum JoinRequestStatus
{
    Pending,
    Approved,
    Rejected
}

public class HouseholdJoinRequest
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }
    public Household? Household { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public JoinRequestStatus Status { get; set; } = JoinRequestStatus.Pending;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}
