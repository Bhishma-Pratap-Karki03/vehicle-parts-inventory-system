using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class PurchaseOrder
{
    public int PurchaseOrderId { get; set; }

    public int VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    [Required]
    [MaxLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Completed";

    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}