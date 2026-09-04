using Homely.Infrastructure.Services;

namespace Homely.Api.Features.Receipts.ScanReceipt;

public static class ScanReceiptEndpoint
{
    public static IEndpointRouteBuilder MapScanReceipt(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/receipts/scan", async (HttpRequest request, IReceiptService receiptService) =>
        {
            if (!request.HasFormContentType)
            {
                return Results.BadRequest("No file was provided.");
            }

            var form = await request.ReadFormAsync();
            var file = form.Files.GetFile("file");

            if (file is null || file.Length == 0)
            {
                return Results.BadRequest("No file was provided.");
            }

            if (string.IsNullOrEmpty(file.ContentType) || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return Results.BadRequest("The uploaded file must be an image.");
            }

            try
            {
                var result = await ScanReceiptHandler.HandleAsync(file, receiptService);
                return Results.Ok(result);
            }
            catch (ReceiptAnalysisException)
            {
                return Results.Problem(
                    "Could not analyze the receipt image. Try a clearer photo of the receipt.",
                    statusCode: StatusCodes.Status502BadGateway);
            }
        })
        .RequireAuthorization()
        .DisableAntiforgery();

        return app;
    }
}
