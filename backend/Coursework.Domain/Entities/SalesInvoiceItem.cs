using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class SalesInvoiceItem
{
    public int SalesInvoiceItemId { get; set; }

    public int SalesInvoiceId { get; set; }
    public SalesInvoice? SalesInvoice { get; set; }

    public int PartId { get; set; }
    public Part? Part { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LineTotal { get; set; }
}