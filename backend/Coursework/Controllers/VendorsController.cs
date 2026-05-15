using Coursework.Application.Common;
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
        var response = ApiResponse<object>.SuccessResponse(
            vendors,
            "Vendors retrieved successfully.");

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVendorById(int id)
    {
        var vendor = await _vendorService.GetById(id);

        if (vendor == null)
        {
            var notFoundResponse = ApiResponse<object>.NotFoundResponse("Vendor not found.");

            return StatusCode(notFoundResponse.StatusCode, notFoundResponse);
        }

        var response = ApiResponse<object>.SuccessResponse(
            vendor,
            "Vendor retrieved successfully.");

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(VendorDto request)
    {
        var vendor = await _vendorService.Create(request);
        var response = ApiResponse<object>.CreatedResponse(
            vendor,
            "Vendor created successfully.");

        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVendor(int id, VendorDto request)
    {
        try
        {
            var vendor = await _vendorService.Update(id, request);
            var response = ApiResponse<object>.SuccessResponse(
                vendor,
                "Vendor updated successfully.");

            return StatusCode(response.StatusCode, response);
        }
        catch (Exception ex)
        {
            var response = ApiResponse<object>.NotFoundResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        try
        {
            var success = await _vendorService.Delete(id);
            var response = ApiResponse<object>.SuccessResponse(
                success,
                "Vendor deleted successfully.");

            return StatusCode(response.StatusCode, response);
        }
        catch (Exception ex)
        {
            var response = ApiResponse<object>.NotFoundResponse(ex.Message);

            return StatusCode(response.StatusCode, response);
        }
    }
}
