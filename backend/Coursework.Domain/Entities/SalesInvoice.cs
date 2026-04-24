using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class SalesInvoice
{
    public int SalesInvoiceId { get; set; }

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    public int StaffId { get; set; }
    public User? Staff { get; set; }

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalAmount { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentStatus { get; set; } = "Unpaid";

    public DateTime? DueDate { get; set; }

    public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}