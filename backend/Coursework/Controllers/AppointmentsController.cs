using Coursework.Application.Common;
using Coursework.Application.DTOs.Appointments;
using Coursework.Application.DTOs.Vehicles;
using Coursework.Application.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet("customer/{customerId}/vehicles")]
    public async Task<ActionResult<ApiResponse<List<CustomerVehicleDto>>>> GetCustomerVehiclesForAppointment(string customerId)
    {
        var response = await _appointmentService.GetCustomerVehiclesAsync(customerId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AppointmentResponseDto>>> CreateAppointment(CreateAppointmentDto dto)
    {
        var response = await _appointmentService.CreateAppointmentAsync(dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<PagedResult<AppointmentResponseDto>>>> GetCustomerAppointments(
        string customerId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _appointmentService.GetCustomerAppointmentsAsync(customerId, pageNumber, pageSize);
        return StatusCode(response.StatusCode, response);
    }

    [Authorize(Roles = "Staff")]
    [HttpGet("staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<StaffAppointmentResponseDto>>>> GetStaffAppointments(
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _appointmentService.GetStaffAppointmentsAsync(searchTerm, status, pageNumber, pageSize);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AppointmentResponseDto>>> GetAppointmentById(int id)
    {
        var response = await _appointmentService.GetAppointmentByIdAsync(id);
        return StatusCode(response.StatusCode, response);
    }

    [Authorize(Roles = "Staff")]
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<ApiResponse<StaffAppointmentResponseDto>>> UpdateAppointmentStatus(
        int id,
        [FromBody] UpdateAppointmentStatusDto dto)
    {
        var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(staffId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "User id was not found in token."
            });
        }

        var response = await _appointmentService.UpdateAppointmentStatusAsync(id, dto, staffId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<AppointmentResponseDto>>> CancelAppointment(int id)
    {
        var response = await _appointmentService.CancelAppointmentAsync(id);
        return StatusCode(response.StatusCode, response);
    }
}
