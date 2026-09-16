using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Infrastructure.Repositories;

public interface ICalendarEventRepository
{
    Task<CalendarEvent> CreateAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default);
    Task<List<CalendarEvent>> GetByHouseholdAsync(Guid householdId, CancellationToken cancellationToken = default);
    Task<List<CalendarEvent>> GetByDateRangeAsync(Guid householdId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<CalendarEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default);
}

public sealed class CalendarEventRepository : ICalendarEventRepository
{
    private readonly HomelyDbContext _db;

    public CalendarEventRepository(HomelyDbContext db)
    {
        _db = db;
    }

    public async Task<CalendarEvent> CreateAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default)
    {
        _db.CalendarEvents.Add(calendarEvent);
        await _db.SaveChangesAsync(cancellationToken);
        return calendarEvent;
    }

    public Task<List<CalendarEvent>> GetByHouseholdAsync(Guid householdId, CancellationToken cancellationToken = default) =>
        GetByDateRangeAsync(householdId, DateTime.MinValue, DateTime.MaxValue, cancellationToken);

    public Task<List<CalendarEvent>> GetByDateRangeAsync(Guid householdId, DateTime from, DateTime to, CancellationToken cancellationToken = default) =>
        _db.CalendarEvents
            .AsNoTracking()
            .Include(calendarEvent => calendarEvent.CreatedByUser)
            .Where(calendarEvent => calendarEvent.HouseholdId == householdId
                && calendarEvent.StartTime < to
                && calendarEvent.EndTime > from)
            .OrderBy(calendarEvent => calendarEvent.StartTime)
            .ToListAsync(cancellationToken);

    public Task<CalendarEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.CalendarEvents.FirstOrDefaultAsync(calendarEvent => calendarEvent.Id == id, cancellationToken);

    public async Task DeleteAsync(CalendarEvent calendarEvent, CancellationToken cancellationToken = default)
    {
        _db.CalendarEvents.Remove(calendarEvent);
        await _db.SaveChangesAsync(cancellationToken);
    }
}