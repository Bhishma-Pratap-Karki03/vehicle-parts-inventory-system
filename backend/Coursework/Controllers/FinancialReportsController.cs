using Coursework.Application.Common;
using Coursework.Application.DTOs.Reports;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = "Admin")]
public class FinancialReportsController : ControllerBase
{
    private readonly IFinancialReportService _service;

    public FinancialReportsController(IFinancialReportService service)
    {
        _service = service;
    }

    [HttpGet("financial/daily")]
    public async Task<ActionResult<ApiResponse<FinancialReportResponseDto>>> GetDaily([FromQuery] DateTime date)
    {
        var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

        var result = await _service.GetDailyReport(utcDate);

        return Ok(ApiResponse<FinancialReportResponseDto>.SuccessResponse(
            result,
            "Daily financial report generated successfully."
        ));
    }

    [HttpGet("financial/monthly")]
    public async Task<ActionResult<ApiResponse<FinancialReportResponseDto>>> GetMonthly(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var result = await _service.GetMonthlyReport(year, month);

        return Ok(ApiResponse<FinancialReportResponseDto>.SuccessResponse(
            result,
            "Monthly financial report generated successfully."
        ));
    }

    [HttpGet("financial/yearly")]
    public async Task<ActionResult<ApiResponse<FinancialReportResponseDto>>> GetYearly([FromQuery] int year)
    {
        var result = await _service.GetYearlyReport(year);

        return Ok(ApiResponse<FinancialReportResponseDto>.SuccessResponse(
            result,
            "Yearly financial report generated successfully."
        ));
    }
}