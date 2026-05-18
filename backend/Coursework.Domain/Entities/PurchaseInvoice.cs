using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class PurchaseInvoice
{
    public int PurchaseInvoiceId { get; set; }

    public int VendorId { get; set; }

    public Vendor Vendor { get; set; } = null!;

    [Required]
    public string CreatedById { get; set; } = string.Empty;

    public ApplicationUser CreatedBy { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public PurchaseInvoiceStatus Status { get; set; } = PurchaseInvoiceStatus.Completed;

    [MaxLength(255)]
    public string? PdfPublicId { get; set; }

    public bool IsEmailSent { get; set; }

    public DateTime? EmailSentAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();

    public ICollection<PartTransaction> PartTransactions { get; set; } = new List<PartTransaction>();
}