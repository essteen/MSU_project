namespace Homely.Infrastructure.Services;

public interface IReceiptService
{
    Task<ReceiptResult> AnalyzeReceiptAsync(Stream receiptImage);
}
