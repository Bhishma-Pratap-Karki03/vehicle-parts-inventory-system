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
        var response = await _service.GetAdminNotificationsAsync();

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("overdue-credits")]
    public async Task<IActionResult> GetOverdueCredits()
    {
        var response = await _service.GetOverdueCreditRemindersAsync();

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("overdue-credits/{salesInvoiceId:int}/send")]
    public async Task<IActionResult> SendReminder(int salesInvoiceId)
    {
        var response = await _service.SendOverdueCreditReminderAsync(salesInvoiceId);

        return StatusCode(response.StatusCode, response);
    }
}
