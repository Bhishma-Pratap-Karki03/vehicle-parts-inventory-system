using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Appointments;

public class UpdateAppointmentStatusDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AdminRemarks { get; set; }

    [MaxLength(500)]
    public string? ServiceDescription { get; set; }

    [MaxLength(500)]
    public string? PartsChangedOrSuggested { get; set; }

    public decimal? LaborCost { get; set; }
}
