using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

public class Notification
{
    public int NotificationId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public ApplicationUser User { get; set; } = null!;

    public NotificationType NotificationType { get; set; } = NotificationType.General;

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public DeliveryMethod DeliveryMethod { get; set; } = DeliveryMethod.InApp;

    public bool IsRead { get; set; } = false;

    public bool IsSent { get; set; } = false;

    public DateTime? SentAt { get; set; }

    [MaxLength(100)]
    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}