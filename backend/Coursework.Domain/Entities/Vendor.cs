using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class Vendor
{
    public int VendorId { get; set; }

    [Required]
    [MaxLength(100)]
    public string VendorName { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Address { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Part> Parts { get; set; } = new List<Part>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}