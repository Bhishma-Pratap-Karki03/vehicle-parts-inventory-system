using Coursework.Application.Common;
using Coursework.Application.DTOs.Staff;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/staff")]
[Authorize(Roles = "Admin")]
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
            var response = ApiResponse<object>.CreatedResponse(
                result,
                "Staff registered successfully.");

            return StatusCode(response.StatusCode, response);
        }
        catch (InvalidOperationException ex)
        {
            var response = ApiResponse<object>.FailureResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllStaffAsync();
        var response = ApiResponse<object>.SuccessResponse(result);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, UpdateStaffDto dto)
    {
        try
        {
            var result = await _service.UpdateStaffAsync(id, dto);
            var response = ApiResponse<object>.SuccessResponse(
                result,
                "Staff updated successfully.");

            return StatusCode(response.StatusCode, response);
        }
        catch (KeyNotFoundException ex)
        {
            var response = ApiResponse<object>.NotFoundResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
        catch (InvalidOperationException ex)
        {
            var response = ex.Message == "Email already exists."
                ? ApiResponse<object>.ConflictResponse(ex.Message)
                : ApiResponse<object>.FailureResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(string id, UpdateRoleDto dto)
    {
        try
        {
            var result = await _service.UpdateRoleAsync(id, dto.Role);
            var response = ApiResponse<object>.SuccessResponse(
                result,
                "Staff role updated successfully.");

            return StatusCode(response.StatusCode, response);
        }
        catch (InvalidOperationException ex)
        {
            var response = ApiResponse<object>.FailureResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var result = await _service.DeleteStaffAsync(id);
            var response = ApiResponse<object>.SuccessResponse(
                result,
                "Staff deleted successfully.");

            return StatusCode(response.StatusCode, response);
        }
        catch (KeyNotFoundException ex)
        {
            var response = ApiResponse<object>.NotFoundResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
        catch (InvalidOperationException ex)
        {
            var response = ApiResponse<object>.FailureResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
    }
}
