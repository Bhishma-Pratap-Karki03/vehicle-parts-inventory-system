using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController(
    ICustomerService customerService)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateCustomer(
        [FromBody] CreateCustomerDto dto)
    {
        var response =
            await customerService.CreateCustomerAsync(dto);

        return StatusCode(
            response.StatusCode,
            response);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchCustomers(
        [FromQuery] string query)
    {
        var response =
            await customerService.SearchCustomersAsync(query);

        return StatusCode(
            response.StatusCode,
            response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomerById(
        [FromRoute] string id)
    {
        var response =
            await customerService.GetCustomerByIdAsync(id);

        return StatusCode(
            response.StatusCode,
            response);
    }
}