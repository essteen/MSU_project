namespace Homely.Core.Entities;
 

public class Expense
{
    public Guid Id {get; set;}
    public string Description {get; set;}
    public decimal? Amount {get; set;}
    public DateTime Date {get; set;}

    public Guid PaidByUserId {get; set;}
    public User? PaidByUser {get; set;}

    public Guid HouseholdId {get; set;}
    public Household? Household {get; set;}

    public List<ExpenseShare> Shares {get; set;}

}