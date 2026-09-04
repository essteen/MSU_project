using Homely.Infrastructure.Services;

namespace Homely.Api.Features.Receipts.ScanReceipt;

public static class ScanReceiptHandler
{
    public static async Task<ReceiptResult> HandleAsync(IFormFile file, IReceiptService receiptService)
    {
        await using var stream = file.OpenReadStream();
        return await receiptService.AnalyzeReceiptAsync(stream);
    }
}
