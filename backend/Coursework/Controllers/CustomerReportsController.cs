using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/customer-reports")]
[Authorize(Roles = "Staff,Admin")]
public class CustomerReportsController : ControllerBase
{
    private readonly ICustomerReportService _customerReportService;

    public CustomerReportsController(ICustomerReportService customerReportService)
    {
        _customerReportService = customerReportService;
    }

    [HttpGet("regulars")]
    public async Task<IActionResult> GetRegularCustomers([FromQuery] int limit = 10)
    {
        var response = await _customerReportService.GetRegularCustomersAsync(limit);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("high-spenders")]
    public async Task<IActionResult> GetHighSpenders([FromQuery] int limit = 10)
    {
        var response = await _customerReportService.GetHighSpendersAsync(limit);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("pending-credits")]
    public async Task<IActionResult> GetPendingCredits([FromQuery] int overdueDays = 30)
    {
        var response = await _customerReportService.GetPendingCreditsAsync(overdueDays);
        return StatusCode(response.StatusCode, response);
    }
}
