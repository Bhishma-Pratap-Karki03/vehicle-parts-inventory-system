namespace Coursework.Application.DTOs.Reviews;

public class ReviewResponseDto
{
    public int ReviewId { get; set; }

    public string CustomerId { get; set; } = string.Empty;

    public int? AppointmentId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}