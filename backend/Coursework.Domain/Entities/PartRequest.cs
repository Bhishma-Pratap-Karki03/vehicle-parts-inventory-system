using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class PartRequest
{
    public int PartRequestId { get; set; }

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}