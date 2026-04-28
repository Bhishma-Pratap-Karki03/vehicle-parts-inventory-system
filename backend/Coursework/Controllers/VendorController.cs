using Coursework.Application.Common;
using Coursework.Application.DTOs.Vendor;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/vendors")]
[AllowAnonymous]
public class VendorController : ControllerBase
{
    private readonly IVendorService _service;

    public VendorController(IVendorService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _service.GetAll();

        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create(VendorDto dto)
    {
        var result = await _service.Create(dto);

        return StatusCode(
            201,
            ApiResponse<object>.CreatedResponse(result, "Vendor created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, VendorDto dto)
    {
        var result = await _service.Update(id, dto);

        return Ok(ApiResponse<object>.SuccessResponse(result, "Vendor updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.Delete(id);

        return Ok(ApiResponse<object>.SuccessResponse(result, "Vendor deleted successfully."));
    }
}