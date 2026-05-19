using Coursework.Application.Common;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
[Authorize(Roles = "Admin")]
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
        var response = ApiResponse<object>.SuccessResponse(
            notifications,
            "Notifications retrieved successfully.");

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("low-stock")]
    public async Task<IActionResult> CheckLowStock()
    {
        var count = await _service.CheckLowStockAsync();
        var response = ApiResponse<object>.SuccessResponse(
            new { NotificationsCreated = count },
            "Low stock checked successfully.");

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("credit-reminders")]
    public async Task<IActionResult> SendReminders()
    {
        var count = await _service.SendCreditRemindersAsync();
        var response = ApiResponse<object>.SuccessResponse(
            new { RemindersSent = count },
            "Reminders sent successfully.");

        return StatusCode(response.StatusCode, response);
    }
}
