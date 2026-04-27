namespace Coursework.Application.DTOs.PartRequests;

public class PartRequestResponseDto
{
    public int PartRequestId { get; set; }

    public string CustomerId { get; set; } = string.Empty;

    public int? VehicleId { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string VehicleName { get; set; } = string.Empty;

    public string PartName { get; set; } = string.Empty;

    public string? PartNumber { get; set; }

    public string Category { get; set; } = string.Empty;

    public string Urgency { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? AdminResponse { get; set; }

    public DateTime RequestedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}