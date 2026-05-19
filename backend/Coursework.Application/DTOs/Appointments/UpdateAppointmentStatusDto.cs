using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Appointments;

public class UpdateAppointmentStatusDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AdminRemarks { get; set; }
}
