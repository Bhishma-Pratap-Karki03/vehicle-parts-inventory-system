using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Customers;

public class CreateCustomerDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone number is required.")]
    [Phone(ErrorMessage = "Invalid phone number.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(250, ErrorMessage = "Address cannot exceed 250 characters.")]
    public string? Address { get; set; }

    [Required(ErrorMessage = "At least one vehicle is required.")]
    [MinLength(1, ErrorMessage = "At least one vehicle is required.")]
    public List<CreateVehicleDto> Vehicles { get; set; } = new();
}

public class CreateVehicleDto
{
    [Required(ErrorMessage = "Vehicle number is required.")]
    [MaxLength(50, ErrorMessage = "Vehicle number cannot exceed 50 characters.")]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Brand is required.")]
    [MaxLength(100, ErrorMessage = "Brand cannot exceed 100 characters.")]
    public string Brand { get; set; } = string.Empty;

    [Required(ErrorMessage = "Model is required.")]
    [MaxLength(100, ErrorMessage = "Model cannot exceed 100 characters.")]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2100, ErrorMessage = "Invalid vehicle year.")]
    public int Year { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Mileage cannot be negative.")]
    public int Mileage { get; set; }
}