using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class Notification
{
    public int NotificationId { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}