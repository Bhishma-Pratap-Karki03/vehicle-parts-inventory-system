using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class PartRequest
{
    public int PartRequestId { get; set; }

    [Required]
    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public PartRequestStatus Status { get; set; } = PartRequestStatus.Pending;

    [MaxLength(500)]
    public string? AdminResponse { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}