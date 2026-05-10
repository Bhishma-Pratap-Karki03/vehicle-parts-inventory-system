using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class SalesInvoiceItem
{
    public int SalesInvoiceItemId { get; set; }

    public int SalesInvoiceId { get; set; }

    public SalesInvoice SalesInvoice { get; set; } = null!;

    public int PartId { get; set; }

    public Part Part { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0.01, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerUnit { get; set; }

    [Range(0.01, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal LineTotal { get; set; }
}