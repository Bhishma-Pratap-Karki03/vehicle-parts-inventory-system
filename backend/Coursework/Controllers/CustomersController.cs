using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer(CreateCustomerDto dto)
    {
        var result = await _customerService.CreateCustomerAsync(dto);

        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchCustomers([FromQuery] string query)
    {
        var result = await _customerService.SearchCustomersAsync(query);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomerById(string id)
    {
        var result = await _customerService.GetCustomerByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
}