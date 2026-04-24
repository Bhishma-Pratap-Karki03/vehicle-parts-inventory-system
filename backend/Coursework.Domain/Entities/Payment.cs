using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class Payment
{
    public int PaymentId { get; set; }

    public int SalesInvoiceId { get; set; }
    public SalesInvoice? SalesInvoice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [MaxLength(250)]
    public string? Remarks { get; set; }
}