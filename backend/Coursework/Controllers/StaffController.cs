using Coursework.Application.Common;
using Coursework.Application.DTOs.Staff;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/staff")]
[AllowAnonymous]
public class StaffController : ControllerBase
{
    private readonly IStaffService _service;

    public StaffController(IStaffService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateStaffDto dto)
    {
        try
        {
            var result = await _service.CreateStaffAsync(dto);

            return StatusCode(
                201,
                ApiResponse<object>.CreatedResponse(result, "Staff registered successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllStaffAsync();

        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(string id, UpdateRoleDto dto)
    {
        try
        {
            var result = await _service.UpdateRoleAsync(id, dto.Role);

            return Ok(ApiResponse<object>.SuccessResponse(result, "Staff role updated successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }
}
