using Homely.Api.Features.CalendarEvents;
using Homely.Core.Entities;
using Homely.Infrastructure.Repositories;

namespace Homely.Api.Tests;

public class CalendarEventTests
{
    [Fact]
    public async Task Repository_CreatesAndFetchesEventsByHousehold()
    {
        using var db = TestDb.Create();
        var household = await SeedHouseholdAsync(db);
        var repository = new CalendarEventRepository(db);
        var calendarEvent = NewEvent(household.HouseholdId, household.Members[0].Id, DateTime.UtcNow.AddHours(1));

        await repository.CreateAsync(calendarEvent);

        var events = await repository.GetByHouseholdAsync(household.HouseholdId);

        var result = Assert.Single(events);
        Assert.Equal(calendarEvent.Id, result.Id);
        Assert.Equal(household.HouseholdId, result.HouseholdId);
    }

    [Fact]
    public async Task Repository_FetchesOnlyEventsOverlappingDateRange()
    {
        using var db = TestDb.Create();
        var household = await SeedHouseholdAsync(db);
        var repository = new CalendarEventRepository(db);
        var rangeStart = new DateTime(2026, 9, 10, 0, 0, 0, DateTimeKind.Utc);
        var rangeEnd = rangeStart.AddDays(1);

        await repository.CreateAsync(NewEvent(household.HouseholdId, household.Members[0].Id, rangeStart.AddHours(2)));
        await repository.CreateAsync(NewEvent(household.HouseholdId, household.Members[0].Id, rangeEnd.AddHours(2)));

        var events = await repository.GetByDateRangeAsync(household.HouseholdId, rangeStart, rangeEnd);

        Assert.Single(events);
        Assert.Equal(rangeStart.AddHours(2), events[0].StartTime);
    }

    [Theory]
    [InlineData(CalendarEventType.Personal)]
    [InlineData(CalendarEventType.Shared)]
    public async Task Handler_CreatesEventWithRequestedTypeAndAuthenticatedCreator(CalendarEventType eventType)
    {
        using var db = TestDb.Create();
        var household = await SeedHouseholdAsync(db);
        var repository = new CalendarEventRepository(db);
        var creator = household.Members[0];
        var request = new CreateCalendarEventRequest(
            "Middag",
            "Ta med dessert",
            DateTime.UtcNow.AddHours(1),
            DateTime.UtcNow.AddHours(2),
            eventType);

        var created = await CalendarEventHandlers.CreateAsync(
            household.HouseholdId,
            request,
            creator.Id,
            db,
            repository,
            CancellationToken.None);

        Assert.NotNull(created);
        Assert.Equal(eventType, created!.EventType);
        Assert.Equal(creator.Id, created.CreatedByUserId);
    }

    [Fact]
    public async Task Handler_FetchesEventsForMemberHousehold()
    {
        using var db = TestDb.Create();
        var household = await SeedHouseholdAsync(db);
        var repository = new CalendarEventRepository(db);
        var creator = household.Members[0];
        var start = DateTime.UtcNow.AddHours(1);
        await repository.CreateAsync(NewEvent(household.HouseholdId, creator.Id, start));

        var events = await CalendarEventHandlers.GetAsync(
            household.HouseholdId,
            start.AddHours(-1),
            start.AddHours(2),
            creator.Id,
            db,
            repository,
            CancellationToken.None);

        Assert.NotNull(events);
        Assert.Single(events!);
    }

    private static async Task<Household> SeedHouseholdAsync(Homely.Infrastructure.Data.HomelyDbContext db)
    {
        var member = new User
        {
            Id = Guid.NewGuid(),
            Name = "Ada",
            Username = "ada",
            Email = "ada@example.com"
        };
        var household = new Household
        {
            HouseholdId = Guid.NewGuid(),
            Name = "Hjemme",
            CreatedByUserId = member.Id,
            Members = new List<User> { member }
        };
        db.Households.Add(household);
        await db.SaveChangesAsync();
        return household;
    }

    private static CalendarEvent NewEvent(Guid householdId, Guid creatorId, DateTime startTime) => new()
    {
        Id = Guid.NewGuid(),
        HouseholdId = householdId,
        CreatedByUserId = creatorId,
        Title = "Middag",
        StartTime = startTime,
        EndTime = startTime.AddHours(1),
        EventType = CalendarEventType.Shared
    };
}