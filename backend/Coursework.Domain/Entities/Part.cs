using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class Part
{
    public int PartId { get; set; }

    public int VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string PartNumber { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PurchasePrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SellingPrice { get; set; }

    public int StockQuantity { get; set; }

    public int ReorderLevel { get; set; } = 10;

    public ICollection<SalesInvoiceItem> SalesInvoiceItems { get; set; } = new List<SalesInvoiceItem>();
    public ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();
}