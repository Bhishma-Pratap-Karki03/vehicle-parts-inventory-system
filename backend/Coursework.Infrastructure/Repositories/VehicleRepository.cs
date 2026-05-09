using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class VehicleRepository : RepositoryBase<Vehicle>, IVehicleRepository
{
    public VehicleRepository(ApplicationDbContext context)
        : base(context)
    {
    }

    public async Task<List<Vehicle>> GetCustomerVehiclesAsync(
        string customerId,
        bool trackChanges = false)
    {
        return await FindByCondition(
                v => v.CustomerId == customerId,
                trackChanges)
            .OrderBy(v => v.VehicleNumber)
            .ToListAsync();
    }

    public async Task<Vehicle?> GetCustomerVehicleAsync(
        int vehicleId,
        string customerId,
        bool trackChanges = false)
    {
        return await FindByCondition(
                v => v.VehicleId == vehicleId && v.CustomerId == customerId,
                trackChanges)
            .Include(v => v.Customer)
            .FirstOrDefaultAsync();
    }
}
