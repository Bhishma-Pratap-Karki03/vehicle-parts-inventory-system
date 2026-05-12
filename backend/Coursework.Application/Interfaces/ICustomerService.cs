using Coursework.Application.DTOs.Customers;

namespace Coursework.Application.Interfaces;

public interface ICustomerService
{
    Task<CustomerDetailsDto> CreateCustomerAsync(
        CreateCustomerDto dto);

    Task<List<CustomerListDto>> SearchCustomersAsync(
        string query);

    Task<CustomerDetailsDto?> GetCustomerByIdAsync(
        string id);
}