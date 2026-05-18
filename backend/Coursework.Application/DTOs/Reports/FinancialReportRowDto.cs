namespace Coursework.Application.DTOs.Reports;

public class FinancialReportRowDto
{
    public string Period { get; set; } = string.Empty;
    public decimal SalesRevenue { get; set; }
    public decimal PurchaseCost { get; set; }
    public decimal DiscountGiven { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public decimal GrossProfit { get; set; }
    public int InvoiceCount { get; set; }
}