namespace Homely.Infrastructure.Services;

public class ReceiptAnalysisException : Exception
{
    public ReceiptAnalysisException(string message, Exception innerException)
        : base(message, innerException) { }
}
