using Coursework.Domain.Entities;
using Coursework.DTOs;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Controllers;

[ApiController]
[Route("api/vendors")]
public class VendorsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VendorsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _context.Vendors
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                v.VendorId,
                v.VendorName,
                v.ContactPerson,
                v.Email,
                v.Phone,
                v.Address,
                v.IsActive,
                v.CreatedAt,
                v.UpdatedAt
            })
            .ToListAsync();

        return Ok(vendors);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVendorById(int id)
    {
        var vendor = await _context.Vendors
            .Where(v => v.VendorId == id)
            .Select(v => new
            {
                v.VendorId,
                v.VendorName,
                v.ContactPerson,
                v.Email,
                v.Phone,
                v.Address,
                v.IsActive,
                v.CreatedAt,
                v.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (vendor == null)
            return NotFound("Vendor not found.");

        return Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(CreateVendorRequest request)
    {
        var vendor = new Vendor
        {
            VendorName = request.VendorName,
            ContactPerson = request.ContactPerson,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVendorById), new { id = vendor.VendorId }, vendor);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVendor(int id, UpdateVendorRequest request)
    {
        var vendor = await _context.Vendors.FindAsync(id);

        if (vendor == null)
            return NotFound("Vendor not found.");

        vendor.VendorName = request.VendorName;
        vendor.ContactPerson = request.ContactPerson;
        vendor.Email = request.Email;
        vendor.Phone = request.Phone;
        vendor.Address = request.Address;
        vendor.IsActive = request.IsActive;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok("Vendor updated successfully.");
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id);

        if (vendor == null)
            return NotFound("Vendor not found.");

        vendor.IsActive = false;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok("Vendor deactivated successfully.");
    }
}