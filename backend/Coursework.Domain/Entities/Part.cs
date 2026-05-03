using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class Part
{
    public int PartId { get; set; }

    public int VendorId { get; set; }

    public Vendor Vendor { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string PartNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(255)]
    public string? ImagePublicId { get; set; }

    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CostPricePerUnit { get; set; }

    [Range(0.01, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal SellingPricePerUnit { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Range(1, int.MaxValue)]
    public int MinimumStockLevel { get; set; } = 10;
    
    public PartStatus Status { get; set; } = PartStatus.Available;

    public bool IsDeleted { get; set; } = false;

    public DateTime? DeletedAt { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<SalesInvoiceItem> SalesInvoiceItems { get; set; } = new List<SalesInvoiceItem>();
    
    public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();

    public ICollection<PartTransaction> PartTransactions { get; set; } = new List<PartTransaction>();
}