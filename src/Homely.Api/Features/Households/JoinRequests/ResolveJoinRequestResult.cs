namespace Homely.Api.Features.Households.JoinRequests;

public enum ResolveJoinRequestStatus
{
    Resolved,
    NotFound,
    Forbidden,
    AlreadyResolved
}

public record ResolveJoinRequestResult(ResolveJoinRequestStatus Status);
