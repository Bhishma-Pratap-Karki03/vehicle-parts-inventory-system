using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class CustomerRepository(ApplicationDbContext context)
    : RepositoryBase<ApplicationUser>(context),
        ICustomerRepository
{
    public async Task<ApplicationUser> CreateCustomerAsync(
        ApplicationUser customer)
    {
        await Context.Users.AddAsync(customer);
        await Context.SaveChangesAsync();

        return customer;
    }

    public async Task<Vehicle> CreateVehicleAsync(
        Vehicle vehicle)
    {
        await Context.Vehicles.AddAsync(vehicle);
        await Context.SaveChangesAsync();

        return vehicle;
    }

    public async Task<List<ApplicationUser>> SearchCustomersAsync(
        string query)
    {
        query = query.Trim().ToLower();

        return await Context.Users
            .AsNoTracking()
            .Include(u => u.Vehicles)
            .Where(u =>
                u.FullName.ToLower().Contains(query) ||
                u.PhoneNumber!.ToLower().Contains(query) ||
                u.Id.ToLower().Contains(query) ||
                u.Vehicles.Any(v =>
                    v.VehicleNumber.ToLower().Contains(query)))
            .ToListAsync();
    }

    public async Task<ApplicationUser?> GetCustomerByIdAsync(
        string id,
        bool trackChanges = false)
    {
        var query = trackChanges
            ? Context.Users
            : Context.Users.AsNoTracking();

        return await query
            .Include(u => u.Vehicles)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}