using System.Security.Claims;
using Homely.Infrastructure.Data;
using Homely.Infrastructure.Repositories;

namespace Homely.Api.Features.CalendarEvents;

public static class CalendarEventEndpoints
{
    public static IEndpointRouteBuilder MapCalendarEvents(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/households/{householdId:guid}/events").RequireAuthorization();

        group.MapGet("", async (Guid householdId, DateTime? from, DateTime? to, ClaimsPrincipal principal, HomelyDbContext db, ICalendarEventRepository repository, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var events = await CalendarEventHandlers.GetAsync(householdId, from ?? DateTime.UtcNow.Date.AddMonths(-1), to ?? DateTime.UtcNow.Date.AddMonths(2), userId, db, repository, cancellationToken);
            return events is null ? Results.NotFound() : Results.Ok(events);
        });

        group.MapPost("", async (Guid householdId, CreateCalendarEventRequest request, ClaimsPrincipal principal, HomelyDbContext db, ICalendarEventRepository repository, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var calendarEvent = await CalendarEventHandlers.CreateAsync(householdId, request, userId, db, repository, cancellationToken);
            return calendarEvent is null
                ? Results.BadRequest("EventType, title, valid times, and household membership are required.")
                : Results.Created($"/api/households/{householdId}/events/{calendarEvent.Id}", calendarEvent);
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
}