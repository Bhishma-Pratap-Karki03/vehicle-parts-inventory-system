using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class PurchaseOrderItem
{
    public int PurchaseOrderItemId { get; set; }

    public int PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public int PartId { get; set; }
    public Part? Part { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitCost { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LineTotal { get; set; }
}