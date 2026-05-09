using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface IVehicleRepository : IRepositoryBase<Vehicle>
{
    Task<List<Vehicle>> GetCustomerVehiclesAsync(
        string customerId,
        bool trackChanges = false);

    Task<Vehicle?> GetCustomerVehicleAsync(
        int vehicleId,
        string customerId,
        bool trackChanges = false);
}
