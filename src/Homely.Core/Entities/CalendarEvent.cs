namespace Homely.Core.Entities;

public enum CalendarEventType
{
    Personal,
    Shared
}

public class CalendarEvent
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public CalendarEventType EventType { get; set; }

    public Household? Household { get; set; }
    public User? CreatedByUser { get; set; }
}