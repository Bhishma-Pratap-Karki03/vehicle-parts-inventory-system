using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class ServiceRecord
{
    public int ServiceRecordId { get; set; }

    public int AppointmentId { get; set; }

    public Appointment Appointment { get; set; } = null!;

    [Required]
    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    [Required]
    public string StaffId { get; set; } = string.Empty;

    public ApplicationUser Staff { get; set; } = null!;

    public int VehicleId { get; set; }

    public Vehicle Vehicle { get; set; } = null!;

    public DateTime ServiceDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(500)]
    public string ServiceDescription { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? PartsChangedOrSuggested { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LaborCost { get; set; }

    public ServiceStatus Status { get; set; } = ServiceStatus.Completed;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}