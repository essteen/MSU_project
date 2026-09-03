using System.Security.Claims;
using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.JoinHousehold;

public static class JoinHouseholdEndpoint
{
    public static IEndpointRouteBuilder MapJoinHousehold(this IEndpointRouteBuilder app)
    {
        app.MapPost("/households/{householdId:guid}/join", async (Guid householdId, ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await JoinHouseholdHandler.HandleAsync(householdId, userId, db);

            return result.Status switch
            {
                JoinHouseholdStatus.Requested => Results.Accepted(),
                JoinHouseholdStatus.AlreadyMember => Results.Conflict("Du er allerede medlem av denne husholdningen."),
                JoinHouseholdStatus.AlreadyRequested => Results.Conflict("Du har allerede en ventende forespørsel om å bli med i denne husholdningen."),
                _ => Results.NotFound()
            };
        }).RequireAuthorization();

        return app;
    }
}
