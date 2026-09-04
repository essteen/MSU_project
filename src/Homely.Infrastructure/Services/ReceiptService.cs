using Azure;
using Azure.AI.DocumentIntelligence;
using Microsoft.Extensions.Configuration;

namespace Homely.Infrastructure.Services;

public class ReceiptService : IReceiptService
{
    private readonly DocumentIntelligenceClient _client;

    public ReceiptService(IConfiguration configuration)
    {
        var endpoint = configuration["DocumentIntelligence:Endpoint"]
            ?? throw new InvalidOperationException(
                "DocumentIntelligence:Endpoint is not configured. Set it via the DocumentIntelligence__Endpoint " +
                "environment variable (or a Container App secret) in production, or via user-secrets for local development.");
        var key = configuration["DocumentIntelligence:Key"]
            ?? throw new InvalidOperationException(
                "DocumentIntelligence:Key is not configured. Set it via the DocumentIntelligence__Key " +
                "environment variable (or a Container App secret) in production, or via user-secrets for local development.");

        _client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(key));
    }

    public async Task<ReceiptResult> AnalyzeReceiptAsync(Stream receiptImage)
    {
        AnalyzeResult analyzeResult;

        try
        {
            var documentContent = await BinaryData.FromStreamAsync(receiptImage);
            Operation<AnalyzeResult> operation = await _client.AnalyzeDocumentAsync(
                WaitUntil.Completed,
                "prebuilt-receipt",
                documentContent);

            analyzeResult = operation.Value;
        }
        catch (RequestFailedException ex)
        {
            throw new ReceiptAnalysisException(
                "Azure Document Intelligence failed to analyze the receipt image.", ex);
        }

        if (analyzeResult.Documents.Count == 0)
        {
            return new ReceiptResult();
        }

        var document = analyzeResult.Documents[0];

        return new ReceiptResult
        {
            MerchantName = GetString(document.Fields, "MerchantName"),
            TransactionDate = GetDate(document.Fields, "TransactionDate"),
            Total = GetCurrencyAmount(document.Fields, "Total"),
            Items = GetItems(document.Fields)
        };
    }

    private static string GetString(IReadOnlyDictionary<string, DocumentField> fields, string fieldName)
    {
        if (fields.TryGetValue(fieldName, out var field) && field.FieldType == DocumentFieldType.String)
        {
            return field.ValueString ?? string.Empty;
        }

        return string.Empty;
    }

    private static DateTime GetDate(IReadOnlyDictionary<string, DocumentField> fields, string fieldName)
    {
        if (fields.TryGetValue(fieldName, out var field) &&
            field.FieldType == DocumentFieldType.Date &&
            field.ValueDate.HasValue)
        {
            return field.ValueDate.Value.DateTime;
        }

        return default;
    }

    private static decimal GetCurrencyAmount(IReadOnlyDictionary<string, DocumentField> fields, string fieldName)
    {
        if (fields.TryGetValue(fieldName, out var field) &&
            field.FieldType == DocumentFieldType.Currency &&
            field.ValueCurrency is not null)
        {
            return (decimal)field.ValueCurrency.Amount;
        }

        return 0m;
    }

    private static List<ReceiptItem> GetItems(IReadOnlyDictionary<string, DocumentField> fields)
    {
        var items = new List<ReceiptItem>();

        if (!fields.TryGetValue("Items", out var itemsField) || itemsField.FieldType != DocumentFieldType.List)
        {
            return items;
        }

        foreach (var itemField in itemsField.ValueList)
        {
            if (itemField.FieldType != DocumentFieldType.Dictionary)
            {
                continue;
            }

            items.Add(new ReceiptItem
            {
                Name = GetString(itemField.ValueDictionary, "Description"),
                Price = GetCurrencyAmount(itemField.ValueDictionary, "TotalPrice")
            });
        }

        return items;
    }
}
