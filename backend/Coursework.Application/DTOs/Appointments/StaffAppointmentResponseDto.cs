namespace Coursework.Application.DTOs.Appointments;

public class StaffAppointmentResponseDto
{
    public int AppointmentId { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhoneNumber { get; set; } = string.Empty;
    public int VehicleId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string VehicleName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public DateTime? AlternativeAppointmentDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string IssueDescription { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminRemarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public StaffAppointmentServiceRecordDto? ServiceRecord { get; set; }
}

public class StaffAppointmentServiceRecordDto
{
    public int ServiceRecordId { get; set; }
    public DateTime ServiceDate { get; set; }
    public string ServiceDescription { get; set; } = string.Empty;
    public string? PartsChangedOrSuggested { get; set; }
    public decimal LaborCost { get; set; }
    public string Status { get; set; } = string.Empty;
}
