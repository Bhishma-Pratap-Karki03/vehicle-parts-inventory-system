using Coursework.Application.DTOs.Vendor;
using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface IVendorService
{
    Task<List<Vendor>> GetAll();
    Task<Vendor?> GetById(int id);
    Task<Vendor> Create(VendorDto dto);
    Task<Vendor> Update(int id, VendorDto dto);
    Task<bool> Delete(int id);
}