using Coursework.Domain.Entities;
using Coursework.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/legacy/admin/staff")]
public class AdminStaffController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminStaffController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetStaff()
    {
        var staffUsers = await _userManager.GetUsersInRoleAsync("Staff");

        var result = staffUsers.Select(user => new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Address,
            user.IsActive,
            user.CreatedAt
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStaffById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
            return NotFound("Staff not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Address,
            user.IsActive,
            Roles = roles
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateStaff(CreateStaffRequest request)
    {
        var allowedRoles = new[] { "Admin", "Staff", "Customer" };

        if (!allowedRoles.Contains(request.Role))
            return BadRequest("Invalid role.");

        var roleExists = await _roleManager.RoleExistsAsync(request.Role);

        if (!roleExists)
            return BadRequest("Role does not exist.");

        var user = new ApplicationUser
        {
            FullName = request.FullName,
            Email = request.Email,
            UserName = request.Email,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
            return BadRequest(createResult.Errors);

        var roleResult = await _userManager.AddToRoleAsync(user, request.Role);

        if (!roleResult.Succeeded)
            return BadRequest(roleResult.Errors);

        return CreatedAtAction(nameof(GetStaffById), new { id = user.Id }, new
        {
            user.Id,
            user.FullName,
            user.Email,
            Role = request.Role
        });
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(string id, UpdateStaffRoleRequest request)
    {
        var allowedRoles = new[] { "Admin", "Staff", "Customer" };

        if (!allowedRoles.Contains(request.Role))
            return BadRequest("Invalid role.");

        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
            return NotFound("User not found.");

        var existingRoles = await _userManager.GetRolesAsync(user);

        await _userManager.RemoveFromRolesAsync(user, existingRoles);

        var result = await _userManager.AddToRoleAsync(user, request.Role);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return Ok("Role updated successfully.");
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, UpdateStaffStatusRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
            return NotFound("User not found.");

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        return Ok("Staff status updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaff(string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
            return NotFound("Staff not found.");

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        return Ok("Staff deactivated successfully.");
    }
}
