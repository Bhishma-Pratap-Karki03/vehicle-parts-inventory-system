using System.Security.Claims;
using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = "Customer")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet("me")]
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
}
