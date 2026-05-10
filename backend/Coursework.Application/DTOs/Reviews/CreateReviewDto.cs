using System.ComponentModel.DataAnnotations;

namespace Coursework.Application.DTOs.Reviews;

public class CreateReviewDto
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;

    [Required]
    public int AppointmentId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(500)]
    public string Comment { get; set; } = string.Empty;
}