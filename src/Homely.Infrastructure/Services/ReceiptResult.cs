namespace Homely.Infrastructure.Services;

public class ReceiptResult
{
    public string MerchantName { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public decimal Total { get; set; }
    public List<ReceiptItem> Items { get; set; } = new();
}
