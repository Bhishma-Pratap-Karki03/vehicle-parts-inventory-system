namespace Coursework.Application.DTOs.Appointments;

public class AppointmentResponseDto
{
    public int AppointmentId { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public int VehicleId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string VehicleName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public DateTime? AlternativeAppointmentDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string IssueDescription { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}