using Homely.Core.Entities;

namespace Homely.Api.Features.CalendarEvents;

public record CreateCalendarEventRequest(string Title, string? Description, DateTime StartTime, DateTime EndTime, CalendarEventType? EventType);