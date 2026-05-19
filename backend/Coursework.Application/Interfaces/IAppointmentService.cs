using Coursework.Application.Common;
using Coursework.Application.DTOs.Appointments;
using Coursework.Application.DTOs.Vehicles;

namespace Coursework.Application.Interfaces;

public interface IAppointmentService
{
    Task<ApiResponse<List<CustomerVehicleDto>>> GetCustomerVehiclesAsync(string customerId);

    Task<ApiResponse<AppointmentResponseDto>> CreateAppointmentAsync(CreateAppointmentDto dto);

    Task<ApiResponse<PagedResult<AppointmentResponseDto>>> GetCustomerAppointmentsAsync(string customerId, int pageNumber, int pageSize);

    Task<ApiResponse<PagedResult<StaffAppointmentResponseDto>>> GetStaffAppointmentsAsync(string? searchTerm, string? status, int pageNumber, int pageSize);

    Task<ApiResponse<AppointmentResponseDto>> GetAppointmentByIdAsync(int id);

    Task<ApiResponse<StaffAppointmentResponseDto>> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto);

    Task<ApiResponse<AppointmentResponseDto>> CancelAppointmentAsync(int id);
}
