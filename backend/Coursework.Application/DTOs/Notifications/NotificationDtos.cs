namespace Coursework.Application.DTOs.Notifications;

public class AdminNotificationDto
{
    public int NotificationId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string NotificationType { get; set; } = string.Empty;

    public string DeliveryMethod { get; set; } = "InApp";

    public bool IsRead { get; set; }

    public bool IsSent { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityId { get; set; }

    public string? ActionUrl { get; set; }
}

public class OverdueCreditReminderDto
{
    public int SalesInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public string? CustomerPhoneNumber { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public decimal FinalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal RemainingAmount { get; set; }

    public DateTime InvoiceDate { get; set; }

    public DateTime? DueDate { get; set; }

    public bool HasInvoicePdf { get; set; }

    public DateTime? LastReminderSentAt { get; set; }
}

public class OverdueCreditReminderSendResultDto
{
    public int SalesInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string RecipientEmail { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}
