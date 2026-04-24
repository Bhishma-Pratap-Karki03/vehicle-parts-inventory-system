using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class Appointment
{
    public int AppointmentId { get; set; }

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    public int VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public DateTime AppointmentDate { get; set; }

    [Required]
    [MaxLength(500)]
    public string IssueDescription { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}