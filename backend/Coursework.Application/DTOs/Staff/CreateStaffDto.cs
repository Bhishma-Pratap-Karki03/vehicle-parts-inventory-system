using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Staff;

public class CreateStaffDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

}
