using Coursework.Application.Common;
using Coursework.Application.DTOs.PartRequests;

namespace Coursework.Application.Interfaces;

public interface IPartRequestService
{
    Task<ApiResponse<PartRequestResponseDto>> CreatePartRequestAsync(CreatePartRequestDto dto);

    Task<ApiResponse<PagedResult<PartRequestResponseDto>>> GetCustomerPartRequestsAsync(string customerId, int pageNumber, int pageSize);

    Task<ApiResponse<PagedResult<StaffPartRequestResponseDto>>> GetStaffPartRequestsAsync(string? searchTerm, string? status, int pageNumber, int pageSize);

    Task<ApiResponse<PartRequestResponseDto>> GetPartRequestByIdAsync(int id);

    Task<ApiResponse<StaffPartRequestResponseDto>> UpdatePartRequestStatusAsync(int id, UpdatePartRequestStatusDto dto);

    Task<ApiResponse<PartRequestResponseDto>> CancelPartRequestAsync(int id);
}
