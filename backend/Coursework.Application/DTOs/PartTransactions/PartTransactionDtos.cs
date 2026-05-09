using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.PartTransactions;

public class AdjustPartStockDto
{
    [Required]
    public int PartId { get; set; }

    [Required]
    public int QuantityChanged { get; set; }

    [Required]
    [MaxLength(500)]
    public string Remarks { get; set; } = string.Empty;
}

public class PartTransactionQueryDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
    public int PageSize { get; set; } = 10;

    public int? PartId { get; set; }

    public PartTransactionType? TransactionType { get; set; }

    public string? SearchTerm { get; set; }
}

public class PartTransactionListDto
{
    public int PartTransactionId { get; set; }

    public int PartId { get; set; }

    public string PartName { get; set; } = string.Empty;

    public string PartNumber { get; set; } = string.Empty;

    public PartTransactionType TransactionType { get; set; }

    public int QuantityChanged { get; set; }

    public int StockBefore { get; set; }

    public int StockAfter { get; set; }

    public decimal? CostPricePerUnit { get; set; }

    public int? PurchaseInvoiceId { get; set; }

    public string? PurchaseInvoiceNumber { get; set; }

    public string? Remarks { get; set; }

    public string CreatedById { get; set; } = string.Empty;

    public string CreatedByName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}