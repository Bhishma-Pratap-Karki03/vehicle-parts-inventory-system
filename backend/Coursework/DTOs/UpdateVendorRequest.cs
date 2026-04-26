using System.ComponentModel.DataAnnotations;

namespace Coursework.DTOs;

public class UpdateVendorRequest
{
    [Required]
    [MaxLength(100)]
    public string VendorName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ContactPerson { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [Phone]
    public string? Phone { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;
}