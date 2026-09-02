using System.Security.Claims;
using Homely.Infrastructure.Data;

namespace Homely.Api.Features.Households.JoinRequests;

public static class JoinRequestsEndpoint
{
    public static IEndpointRouteBuilder MapJoinRequests(this IEndpointRouteBuilder app)
    {
        app.MapGet("/households/join-requests/pending", async (ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await GetPendingJoinRequestsHandler.HandleAsync(userId, db));
        }).RequireAuthorization();

        app.MapGet("/households/join-requests/mine", async (ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Results.Ok(await GetMyJoinRequestsHandler.HandleAsync(userId, db));
        }).RequireAuthorization();

        app.MapPost("/households/join-requests/{requestId:guid}/approve", async (Guid requestId, ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await ApproveJoinRequestHandler.HandleAsync(requestId, userId, db);
            return MapResolveResult(result);
        }).RequireAuthorization();

        app.MapPost("/households/join-requests/{requestId:guid}/reject", async (Guid requestId, ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await RejectJoinRequestHandler.HandleAsync(requestId, userId, db);
            return MapResolveResult(result);
        }).RequireAuthorization();

        app.MapPost("/households/join-requests/{requestId:guid}/cancel", async (Guid requestId, ClaimsPrincipal principal, HomelyDbContext db) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await CancelJoinRequestHandler.HandleAsync(requestId, userId, db);
            return MapResolveResult(result);
        }).RequireAuthorization();

        return app;
    }

    private static IResult MapResolveResult(ResolveJoinRequestResult result) => result.Status switch
    {
        ResolveJoinRequestStatus.Resolved => Results.NoContent(),
        ResolveJoinRequestStatus.Forbidden => Results.Forbid(),
        ResolveJoinRequestStatus.AlreadyResolved => Results.Conflict("Denne forespørselen er allerede behandlet."),
        _ => Results.NotFound()
    };
}
