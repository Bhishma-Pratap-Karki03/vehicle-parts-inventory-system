using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class Appointment
{
    public int AppointmentId { get; set; }

    [Required]
    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    public int VehicleId { get; set; }

    public Vehicle Vehicle { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }

    [Required]
    [MaxLength(500)]
    public string IssueDescription { get; set; } = string.Empty;

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

    [MaxLength(500)]
    public string? AdminRemarks { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}