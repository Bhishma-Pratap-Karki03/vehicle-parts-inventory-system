using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.PartRequests;

public class CreatePartRequestDto
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;

    public int? VehicleId { get; set; }

    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? PartNumber { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Urgency { get; set; } = "Normal";

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}