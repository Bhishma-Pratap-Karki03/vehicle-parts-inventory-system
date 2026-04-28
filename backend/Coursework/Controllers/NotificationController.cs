using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Coursework.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationController(INotificationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _service.GetAllAsync();

        return Ok(notifications);
    }

    [HttpPost("low-stock")]
    public async Task<IActionResult> CheckLowStock()
    {
        var count = await _service.CheckLowStockAsync();

        return Ok(new
        {
            message = "Low stock checked",
            notificationsCreated = count
        });
    }

    [HttpPost("credit-reminders")]
    public async Task<IActionResult> SendReminders()
    {
        var count = await _service.SendCreditRemindersAsync();

        return Ok(new
        {
            message = "Reminders sent",
            remindersSent = count
        });
    }
}