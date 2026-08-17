namespace Homely.Core.Entities;

public class User
{
    public Guid Id { get; set; }

    public string? Name { get; set; }

    public Guid? HouseholdId { get; set; }
    public Household? Household { get; set; }
}