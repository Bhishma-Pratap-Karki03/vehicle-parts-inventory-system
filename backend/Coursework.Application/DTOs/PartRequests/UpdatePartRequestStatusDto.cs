using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.PartRequests;

public class UpdatePartRequestStatusDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AdminResponse { get; set; }
}
