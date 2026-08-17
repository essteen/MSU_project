namespace Homely.Core.Entities;

public class Wish
{
    public Guid Id {get; set;}
    public string Title {get; set;}
    public string? Link {get; set;}
    public decimal? Price {get; set;}

    public Guid AddedByUserId {get; set;}
    public User? AddedByUser {get; set;}
    
    public Guid HouseholdId {get; set;}
    public Household? Household {get; set;}

}