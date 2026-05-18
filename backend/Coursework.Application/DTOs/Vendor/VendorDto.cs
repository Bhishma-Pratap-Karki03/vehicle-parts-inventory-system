using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Vendor;

public class VendorDto
{
    [Required]
    [MaxLength(100)]
    public string VendorName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ContactPerson { get; set; }

    [EmailAddress]
    [MaxLength(150)]
    public string? Email { get; set; }

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;
}