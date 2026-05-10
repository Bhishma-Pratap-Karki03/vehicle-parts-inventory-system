using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class Payment
{
    public int PaymentId { get; set; }

    public int SalesInvoiceId { get; set; }

    public SalesInvoice SalesInvoice { get; set; } = null!;

    [Range(0.01, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [MaxLength(250)]
    public string? Remarks { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}