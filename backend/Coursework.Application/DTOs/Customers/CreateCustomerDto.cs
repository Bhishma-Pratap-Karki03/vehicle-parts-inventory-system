using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Customers;

public class CreateCustomerDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Address { get; set; }

    public List<CreateVehicleDto> Vehicles { get; set; } = new();
}

public class CreateVehicleDto
{
    [Required]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    public string Brand { get; set; } = string.Empty;

    [Required]
    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public int Mileage { get; set; }
}