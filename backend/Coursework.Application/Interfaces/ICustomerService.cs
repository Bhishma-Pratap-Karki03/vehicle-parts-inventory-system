using Coursework.Application.Common;
using Coursework.Application.DTOs.Customers;

namespace Coursework.Application.Interfaces;

public interface ICustomerService
{
    Task<ApiResponse<CustomerDetailsDto>> CreateCustomerAsync(
        CreateCustomerDto dto);

    Task<ApiResponse<List<CustomerListDto>>> SearchCustomersAsync(
        string query);

    Task<ApiResponse<CustomerDetailsDto>> GetCustomerByIdAsync(
        string id);
}