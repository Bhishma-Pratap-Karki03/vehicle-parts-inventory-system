using System.Security.Claims;
using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly UserManager<ApplicationUser> _userManager;

    public CustomersController(
        ICustomerService customerService,
        UserManager<ApplicationUser> userManager)
    {
        _customerService = customerService;
        _userManager = userManager;
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetProfile()
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.GetProfileAsync(customerId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileDto dto)
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.UpdateProfileAsync(customerId, dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("me/vehicles")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetVehicles()
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.GetVehiclesAsync(customerId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("me/vehicles")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> AddVehicle([FromBody] CreateCustomerVehicleDto dto)
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.AddVehicleAsync(customerId, dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("me/vehicles/{vehicleId:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> UpdateVehicle(
        [FromRoute] int vehicleId,
        [FromBody] UpdateCustomerVehicleDto dto)
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.UpdateVehicleAsync(customerId, vehicleId, dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("me/vehicles/{vehicleId:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> DeleteVehicle([FromRoute] int vehicleId)
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.DeleteVehicleAsync(customerId, vehicleId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("me/purchase-history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetPurchaseHistory()
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.GetPurchaseHistoryAsync(customerId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("me/service-history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetServiceHistory()
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.GetServiceHistoryAsync(customerId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("me/history/summary")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetHistorySummary()
    {
        var customerId = GetCurrentCustomerId();

        if (customerId is null)
        {
            return Unauthorized();
        }

        var response = await _customerService.GetHistorySummaryAsync(customerId);
        return StatusCode(response.StatusCode, response);
    }

    private string? GetCurrentCustomerId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateCustomer(
        [FromBody] CreateCustomerDto dto)
    {
        if (!await CurrentUserHasAnyRoleAsync("Admin", "Staff"))
        {
            return Forbid();
        }

        var response =
            await _customerService.CreateCustomerAsync(dto);

        return StatusCode(
            response.StatusCode,
            response);
    }

    [HttpGet("search")]
    [Authorize]
    public async Task<IActionResult> SearchCustomers(
        [FromQuery] string query)
    {
        if (!await CurrentUserHasAnyRoleAsync("Admin", "Staff"))
        {
            return Forbid();
        }

        var response =
            await _customerService.SearchCustomersAsync(query);

        return StatusCode(
            response.StatusCode,
            response);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetCustomerById(
        [FromRoute] string id)
    {
        if (!await CurrentUserHasAnyRoleAsync("Admin", "Staff"))
        {
            return Forbid();
        }

        var response =
            await _customerService.GetCustomerByIdAsync(id);

        return StatusCode(
            response.StatusCode,
            response);
    }

    private async Task<bool> CurrentUserHasAnyRoleAsync(params string[] roles)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null || !user.IsActive)
        {
            return false;
        }

        var userRoles = await _userManager.GetRolesAsync(user);

        return userRoles.Any(role =>
            roles.Any(expectedRole =>
                string.Equals(role, expectedRole, StringComparison.OrdinalIgnoreCase)));
    }
}
