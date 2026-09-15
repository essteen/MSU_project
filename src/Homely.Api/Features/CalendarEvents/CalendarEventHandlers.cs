using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Homely.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.CalendarEvents;

public static class CalendarEventHandlers
{
    public static async Task<List<CalendarEventDto>?> GetAsync(Guid householdId, DateTime from, DateTime to, Guid userId, HomelyDbContext db, ICalendarEventRepository repository, CancellationToken cancellationToken)
    {
        if (!await IsMemberAsync(householdId, userId, db, cancellationToken))
        {
            return null;
        }

        var events = await repository.GetByDateRangeAsync(householdId, from, to, cancellationToken);
        return events.Select(CalendarEventDto.FromEntity).ToList();
    }

    public static async Task<CalendarEventDto?> CreateAsync(Guid householdId, CreateCalendarEventRequest request, Guid userId, HomelyDbContext db, ICalendarEventRepository repository, CancellationToken cancellationToken)
    {
        if (request.EventType is null || string.IsNullOrWhiteSpace(request.Title)
            || request.EndTime <= request.StartTime
            || !await IsMemberAsync(householdId, userId, db, cancellationToken))
        {
            return null;
        }

        var calendarEvent = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            CreatedByUserId = userId,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            EventType = request.EventType.Value
        };

        var created = await repository.CreateAsync(calendarEvent, cancellationToken);
        created.CreatedByUser = await db.Users.AsNoTracking().FirstAsync(user => user.Id == userId, cancellationToken);
        return CalendarEventDto.FromEntity(created);
    }

    private static Task<bool> IsMemberAsync(Guid householdId, Guid userId, HomelyDbContext db, CancellationToken cancellationToken) =>
        db.Households.AnyAsync(household => household.HouseholdId == householdId && household.Members.Any(member => member.Id == userId), cancellationToken);
}