using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class PartTransaction
{
    public int PartTransactionId { get; set; }

    public int PartId { get; set; }

    public Part Part { get; set; } = null!;

    public PartTransactionType TransactionType { get; set; }

    public int QuantityChanged { get; set; }

    public int StockBefore { get; set; }

    public int StockAfter { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? CostPricePerUnit { get; set; }

    public int? PurchaseInvoiceId { get; set; }

    public PurchaseInvoice? PurchaseInvoice { get; set; }

    public int? PurchaseInvoiceItemId { get; set; }

    public PurchaseInvoiceItem? PurchaseInvoiceItem { get; set; }

    [MaxLength(500)]
    public string? Remarks { get; set; }

    [Required]
    public string CreatedById { get; set; } = string.Empty;

    public ApplicationUser CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}