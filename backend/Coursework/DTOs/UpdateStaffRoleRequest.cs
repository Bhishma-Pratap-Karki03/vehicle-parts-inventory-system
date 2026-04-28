using System.ComponentModel.DataAnnotations;

namespace Coursework.DTOs;

public class UpdateStaffRoleRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;
}
