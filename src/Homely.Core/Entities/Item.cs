namespace Homely.Core.Entities;

public enum Category
{
    Kitchen,
    Bedroom,
    Livingroom,
    Bathroom
}

public class Item
{
    public int ItemId { get; set; }
    public string? Name { get; set; }
    public Category Category { get; set; }
    public decimal Price { get; set; }

    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }

    public Guid HouseholdId { get; set; }
    public Household? Household { get; set; }
}