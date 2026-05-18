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

    Task<ApiResponse<CustomerProfileDto>> GetProfileAsync(string customerId);

    Task<ApiResponse<CustomerProfileDto>> UpdateProfileAsync(
        string customerId,
        UpdateCustomerProfileDto dto);

    Task<ApiResponse<List<CustomerVehicleDto>>> GetVehiclesAsync(string customerId);

    Task<ApiResponse<CustomerVehicleDto>> AddVehicleAsync(
        string customerId,
        CreateCustomerVehicleDto dto);

    Task<ApiResponse<CustomerVehicleDto>> UpdateVehicleAsync(
        string customerId,
        int vehicleId,
        UpdateCustomerVehicleDto dto);

    Task<ApiResponse<int>> DeleteVehicleAsync(
        string customerId,
        int vehicleId);

    Task<ApiResponse<List<CustomerPurchaseHistoryItemDto>>> GetPurchaseHistoryAsync(string customerId);

    Task<ApiResponse<List<CustomerServiceHistoryItemDto>>> GetServiceHistoryAsync(string customerId);

    Task<ApiResponse<CustomerHistorySummaryDto>> GetHistorySummaryAsync(string customerId);
}
