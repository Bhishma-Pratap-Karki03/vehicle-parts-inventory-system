using Coursework.Application.DTOs.Vendor;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/vendors")]
[Authorize(Roles = "Admin")]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorsController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _vendorService.GetAll();
        return Ok(vendors);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVendorById(int id)
    {
        var vendor = await _vendorService.GetById(id);

        if (vendor == null)
            return NotFound("Vendor not found.");

        return Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(VendorDto request)
    {
        var vendor = await _vendorService.Create(request);
        return CreatedAtAction(nameof(GetVendorById), new { id = vendor.VendorId }, vendor);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVendor(int id, VendorDto request)
    {
        try
        {
            var vendor = await _vendorService.Update(id, request);
            return Ok(vendor);
        }
        catch (Exception ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        try
        {
            var success = await _vendorService.Delete(id);
            return Ok(new { Deleted = success });
        }
        catch (Exception ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }
}