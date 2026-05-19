namespace Coursework.Application.DTOs.Customers;

public class CustomerDetailsDto
{
    public string Id { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Address { get; set; }

    public List<VehicleDto> Vehicles { get; set; } = new();

    public CustomerHistorySummaryDto HistorySummary { get; set; } = new();

    public List<CustomerPurchaseHistoryItemDto> PurchaseHistory { get; set; } = new();

    public List<CustomerServiceHistoryItemDto> ServiceHistory { get; set; } = new();
}

public class VehicleDto
{
    public int VehicleId { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public int Mileage { get; set; }
}
