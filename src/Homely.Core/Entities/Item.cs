namespace Homely.Core.Entity;

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

    public string Name { get; set; }

    public Category Category { get; set; }

    // legg til som user    
}