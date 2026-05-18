using Coursework.Application.DTOs.Vendor;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;

namespace Coursework.Application.Services;

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepository;

    public VendorService(IVendorRepository vendorRepository)
    {
        _vendorRepository = vendorRepository;
    }

    public async Task<List<Vendor>> GetAll()
    {
        var vendors = await _vendorRepository.FindAllAsync();

        return vendors
            .OrderByDescending(v => v.CreatedAt)
            .ToList();
    }

    public async Task<Vendor?> GetById(int id)
    {
        return await _vendorRepository.GetByIdAsync(id);
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
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _vendorRepository.Create(vendor);
        await _vendorRepository.SaveChangesAsync();

        return vendor;
    }

    public async Task<Vendor> Update(int id, VendorDto dto)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);

        if (vendor == null)
            throw new InvalidOperationException("Vendor not found.");

        vendor.VendorName = dto.VendorName;
        vendor.ContactPerson = dto.ContactPerson;
        vendor.Email = dto.Email;
        vendor.Phone = dto.Phone;
        vendor.Address = dto.Address;
        vendor.IsActive = dto.IsActive;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _vendorRepository.SaveChangesAsync();

        return vendor;
    }

    public async Task<bool> Delete(int id)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);

        if (vendor == null)
            throw new InvalidOperationException("Vendor not found.");

        vendor.IsActive = false;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _vendorRepository.SaveChangesAsync();

        return true;
    }
}
