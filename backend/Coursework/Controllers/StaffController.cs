using System.ComponentModel.DataAnnotations;
using Coursework.Application.Common;
using Coursework.Application.DTOs.Staff;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/staff")]
[AllowAnonymous]
public class StaffController : ControllerBase
{
    private readonly IStaffService _service;
    private readonly UserManager<ApplicationUser> _userManager;

    public StaffController(
        IStaffService service,
        UserManager<ApplicationUser> userManager)
    {
        _service = service;
        _userManager = userManager;
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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, UpdateStaffRequest dto)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Staff not found."));

        var email = dto.Email.Trim();
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser != null && existingUser.Id != user.Id)
            return BadRequest(ApiResponse<object>.ErrorResponse("Email already exists."));

        user.FullName = dto.FullName.Trim();
        user.Email = email;
        user.UserName = email;
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.Address = dto.Address?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Failed to update staff.",
                updateResult.Errors.Select(e => e.Description).ToList()));

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passwordResult = await _userManager.ResetPasswordAsync(user, token, dto.Password);

            if (!passwordResult.Succeeded)
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Staff details were updated, but password update failed.",
                    passwordResult.Errors.Select(e => e.Description).ToList()));
        }

        return Ok(ApiResponse<object>.SuccessResponse(true, "Staff updated successfully."));
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Staff not found."));

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Failed to delete staff.",
                result.Errors.Select(e => e.Description).ToList()));

        return Ok(ApiResponse<object>.SuccessResponse(true, "Staff deleted successfully."));
    }
}

public class UpdateStaffRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }

    [MinLength(6)]
    public string? Password { get; set; }
}
