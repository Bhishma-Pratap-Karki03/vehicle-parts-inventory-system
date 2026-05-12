using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface ICustomerRepository
{
    Task<ApplicationUser> CreateCustomerAsync(
        ApplicationUser customer);

    Task<Vehicle> CreateVehicleAsync(
        Vehicle vehicle);

    Task<List<ApplicationUser>> SearchCustomersAsync(
        string query);

    Task<ApplicationUser?> GetCustomerByIdAsync(
        string id,
        bool trackChanges = false);
}