using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class Review
{
    public int ReviewId { get; set; }

    public int CustomerId { get; set; }
    public User? Customer { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(500)]
    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}