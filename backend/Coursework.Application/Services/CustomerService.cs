using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;

namespace Coursework.Application.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerService(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<CustomerDetailsDto> CreateCustomerAsync(CreateCustomerDto dto)
    {
        var customer = new ApplicationUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Address = dto.Address,
            UserName = dto.Email
        };

        var createdCustomer = await _customerRepository.CreateCustomerAsync(customer);

        var vehicleDtos = new List<VehicleDto>();

        foreach (var vehicleDto in dto.Vehicles)
        {
            var vehicle = new Vehicle
            {
                CustomerId = createdCustomer.Id,
                VehicleNumber = vehicleDto.VehicleNumber,
                Brand = vehicleDto.Brand,
                Model = vehicleDto.Model,
                Year = vehicleDto.Year,
                Mileage = vehicleDto.Mileage
            };

            var createdVehicle =
                await _customerRepository.CreateVehicleAsync(vehicle);

            vehicleDtos.Add(new VehicleDto
            {
                VehicleId = createdVehicle.VehicleId,
                VehicleNumber = createdVehicle.VehicleNumber,
                Brand = createdVehicle.Brand,
                Model = createdVehicle.Model,
                Year = createdVehicle.Year,
                Mileage = createdVehicle.Mileage
            });
        }

        return new CustomerDetailsDto
        {
            Id = createdCustomer.Id,
            FullName = createdCustomer.FullName,
            Email = createdCustomer.Email!,
            PhoneNumber = createdCustomer.PhoneNumber!,
            Address = createdCustomer.Address,
            Vehicles = vehicleDtos
        };
    }

    public async Task<List<CustomerListDto>> SearchCustomersAsync(string query)
    {
        var customers = await _customerRepository.SearchCustomersAsync(query);

        return customers.SelectMany(customer =>
            customer.Vehicles.Select(vehicle =>
                new CustomerListDto
                {
                    Id = customer.Id,
                    FullName = customer.FullName,
                    Email = customer.Email!,
                    PhoneNumber = customer.PhoneNumber!,
                    VehicleNumber = vehicle.VehicleNumber
                })).ToList();
    }

    public async Task<CustomerDetailsDto?> GetCustomerByIdAsync(string id)
    {
        var customer = await _customerRepository.GetCustomerByIdAsync(id);

        if (customer == null)
            return null;

        return new CustomerDetailsDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email!,
            PhoneNumber = customer.PhoneNumber!,
            Address = customer.Address,
            Vehicles = customer.Vehicles.Select(vehicle => new VehicleDto
            {
                VehicleId = vehicle.VehicleId,
                VehicleNumber = vehicle.VehicleNumber,
                Brand = vehicle.Brand,
                Model = vehicle.Model,
                Year = vehicle.Year,
                Mileage = vehicle.Mileage
            }).ToList()
        };
    }
}