using Coursework.Infrastructure.Data;
using Coursework.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ApplicationDbContext _context;

    public NotificationsController(
        INotificationService notificationService,
        ApplicationDbContext context)
    {
        _notificationService = notificationService;
        _context = context;
    }

    [HttpPost("check-low-stock")]
    public async Task<IActionResult> CheckLowStock()
    {
        var count = await _notificationService.CreateLowStockNotificationsAsync();

        return Ok(new
        {
            Message = "Low stock check completed.",
            NotificationsCreated = count
        });
    }

    [HttpPost("send-credit-reminders")]
    public async Task<IActionResult> SendCreditReminders()
    {
        var count = await _notificationService.SendOverdueCreditRemindersAsync();

        return Ok(new
        {
            Message = "Credit reminder process completed.",
            EmailsSent = count
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var notifications = await _context.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.NotificationId,
                n.UserId,
                n.Title,
                n.Message,
                n.NotificationType,
                n.DeliveryMethod,
                n.IsRead,
                n.IsSent,
                n.SentAt,
                n.CreatedAt
            })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);

        if (notification == null)
            return NotFound("Notification not found.");

        notification.IsRead = true;

        await _context.SaveChangesAsync();

        return Ok("Notification marked as read.");
    }
}