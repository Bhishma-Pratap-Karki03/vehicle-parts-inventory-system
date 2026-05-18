using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Appointments;

public class CreateAppointmentDto
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    public DateTime? AlternativeAppointmentDate { get; set; }

    [Required]
    [MaxLength(100)]
    public string ServiceType { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Urgency { get; set; } = "Normal";

    [Required]
    [MaxLength(500)]
    public string IssueDescription { get; set; } = string.Empty;
}