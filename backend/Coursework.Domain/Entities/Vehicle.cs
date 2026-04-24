using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class Vehicle
{
    public int VehicleId { get; set; }

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    [Required]
    [MaxLength(50)]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}