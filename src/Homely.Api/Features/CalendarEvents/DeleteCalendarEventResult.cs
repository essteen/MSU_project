namespace Homely.Api.Features.CalendarEvents;

public enum DeleteCalendarEventStatus
{
    Deleted,
    NotFound,
    Forbidden
}

public record DeleteCalendarEventResult(DeleteCalendarEventStatus Status);
