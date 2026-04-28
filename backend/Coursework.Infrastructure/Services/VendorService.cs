using Coursework.Application.DTOs.Vendor;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Services;

public class VendorService : IVendorService
{
    private const string VendorRole = "Vendor";

    private readonly ApplicationDbContext _context;

    public VendorService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Vendor>> GetAll()
    {
        return await _context.Vendors
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<Vendor> Create(VendorDto dto)
    {
        var vendor = new Vendor
        {
            VendorName = dto.VendorName,
            ContactPerson = dto.ContactPerson,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            Role = VendorRole,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();

        return vendor;
    }

    public async Task<Vendor> Update(int id, VendorDto dto)
    {
        var vendor = await _context.Vendors.FindAsync(id);

        if (vendor == null)
            throw new Exception("Vendor not found");

        vendor.VendorName = dto.VendorName;
        vendor.ContactPerson = dto.ContactPerson;
        vendor.Email = dto.Email;
        vendor.Phone = dto.Phone;
        vendor.Address = dto.Address;
        vendor.Role = VendorRole;
        vendor.IsActive = dto.IsActive;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return vendor;
    }

    public async Task<bool> Delete(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id);

        if (vendor == null)
            throw new Exception("Vendor not found");

        vendor.IsActive = false;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
}
