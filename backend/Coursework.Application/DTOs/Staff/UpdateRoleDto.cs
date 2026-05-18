using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Staff;

public class UpdateRoleDto
{
    [Required]
    public string Role { get; set; } = string.Empty;
}