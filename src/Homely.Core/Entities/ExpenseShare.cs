namespace Homely.Core.Entities;
 

public class ExpenseShare
{
    public Guid Id {get; set;}
    public decimal? AmountOwed {get; set;}
    public bool IsSettled {get; set;}
    public Guid ExpenseId {get; set;}

    public Expense? Expense {get; set;}
    public Guid UserId {get; set;}

    public User? User {get; set;}


}