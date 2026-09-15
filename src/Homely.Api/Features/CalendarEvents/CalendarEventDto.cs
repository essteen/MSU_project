using Homely.Core.Entities;

namespace Homely.Api.Features.CalendarEvents;

public record CalendarEventDto(Guid Id, Guid HouseholdId, Guid CreatedByUserId, string Title, string? Description, DateTime StartTime, DateTime EndTime, CalendarEventType EventType, string? CreatedByUserName)
{
    public static CalendarEventDto FromEntity(CalendarEvent calendarEvent) => new(
        calendarEvent.Id,
        calendarEvent.HouseholdId,
        calendarEvent.CreatedByUserId,
        calendarEvent.Title,
        calendarEvent.Description,
        calendarEvent.StartTime,
        calendarEvent.EndTime,
        calendarEvent.EventType,
        calendarEvent.CreatedByUser?.Name ?? calendarEvent.CreatedByUser?.Username);
}