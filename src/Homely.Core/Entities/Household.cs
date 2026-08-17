
namespace Homely.Core.Entities; 

public class Household
{
    public Guid HouseholdId { get; set; }
    public string? Name { get; set; }
    public List<User>? Members { get; set; }

    public List<Item>? Items { get; set; }
    public List<Wish>? Wishes { get; set; }
    public List<Expense>? Expenses { get; set; }
}