using Coursework.Application.Common;
using Coursework.Application.DTOs.PartRequests;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Application.Services;

public class PartRequestService : IPartRequestService
{
    private static readonly PartRequestStatus[] StaffManagedStatuses =
    [
        PartRequestStatus.Reviewed,
        PartRequestStatus.Available,
        PartRequestStatus.Unavailable,
    ];

    private readonly IPartRequestRepository _partRequestRepository;
    private readonly IVehicleRepository _vehicleRepository;

    public PartRequestService(
        IPartRequestRepository partRequestRepository,
        IVehicleRepository vehicleRepository)
    {
        _partRequestRepository = partRequestRepository;
        _vehicleRepository = vehicleRepository;
    }

    public async Task<ApiResponse<PartRequestResponseDto>> CreatePartRequestAsync(CreatePartRequestDto dto)
    {
        Vehicle? vehicle = null;

        if (dto.VehicleId.HasValue)
        {
            vehicle = await _vehicleRepository
                .FindByCondition(v =>
                    v.VehicleId == dto.VehicleId.Value &&
                    v.CustomerId == dto.CustomerId)
                .FirstOrDefaultAsync();

            if (vehicle == null)
            {
                return ApiResponse<PartRequestResponseDto>.FailureResponse(
                    "Selected vehicle does not belong to this customer.", 400);
            }
        }

        var partRequest = new PartRequest
        {
            CustomerId = dto.CustomerId,
            VehicleId = dto.VehicleId,
            PartName = dto.PartName.Trim(),
            PartNumber = string.IsNullOrWhiteSpace(dto.PartNumber)
                ? null
                : dto.PartNumber.Trim(),
            Category = dto.Category.Trim(),
            Urgency = dto.Urgency.Trim(),
            Description = dto.Description.Trim(),
            RequestedAt = DateTime.UtcNow,
        };

        _partRequestRepository.Create(partRequest);
        await _partRequestRepository.SaveChangesAsync();

        var response = MapPartRequestToDto(partRequest, vehicle);

        return ApiResponse<PartRequestResponseDto>.CreatedResponse(
            response,
            "Part request submitted successfully.");
    }

    public async Task<ApiResponse<PartRequestResponseDto>> CancelPartRequestAsync(int id)
    {
        var request = await _partRequestRepository
            .FindByCondition(p => p.PartRequestId == id, trackChanges: true)
            .Include(p => p.Vehicle)
            .FirstOrDefaultAsync();

        if (request == null)
        {
            return ApiResponse<PartRequestResponseDto>.NotFoundResponse(
                "Part request not found.");
        }

        if (request.Status != PartRequestStatus.Pending)
        {
            return ApiResponse<PartRequestResponseDto>.FailureResponse(
                "Only pending part requests can be cancelled.", 400);
        }

        request.Status = PartRequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;

        await _partRequestRepository.SaveChangesAsync();

        var response = MapPartRequestToDto(request, request.Vehicle);

        return ApiResponse<PartRequestResponseDto>.SuccessResponse(
            response,
            "Part request cancelled successfully.");
    }

    public async Task<ApiResponse<PagedResult<PartRequestResponseDto>>> GetCustomerPartRequestsAsync(
        string customerId,
        int pageNumber,
        int pageSize)
    {
        if (pageNumber < 1)
        {
            pageNumber = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var query = _partRequestRepository
            .FindByCondition(p => p.CustomerId == customerId);

        var totalRecords = await query.CountAsync();

        var requests = await query
            .Include(p => p.Vehicle)
            .OrderByDescending(p => p.RequestedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PartRequestResponseDto
            {
                PartRequestId = p.PartRequestId,
                CustomerId = p.CustomerId,
                VehicleId = p.VehicleId,
                VehicleNumber = p.Vehicle != null ? p.Vehicle.VehicleNumber : "N/A",
                VehicleName = p.Vehicle != null
                    ? $"{p.Vehicle.Brand} {p.Vehicle.Model} {p.Vehicle.Year}"
                    : "Not specified",
                PartName = p.PartName,
                PartNumber = p.PartNumber,
                Category = p.Category,
                Urgency = p.Urgency,
                Description = p.Description ?? string.Empty,
                Status = p.Status.ToString(),
                AdminResponse = p.AdminResponse,
                RequestedAt = p.RequestedAt,
                UpdatedAt = p.UpdatedAt,
            })
            .ToListAsync();

        var pagedResult = PagedResult<PartRequestResponseDto>.Create(
            requests,
            pageNumber,
            pageSize,
            totalRecords);

        return ApiResponse<PagedResult<PartRequestResponseDto>>.SuccessResponse(
            pagedResult,
            "Customer part requests loaded successfully.");
    }

    public async Task<ApiResponse<PagedResult<StaffPartRequestResponseDto>>> GetStaffPartRequestsAsync(
        string? searchTerm,
        string? status,
        int pageNumber,
        int pageSize)
    {
        if (pageNumber < 1)
        {
            pageNumber = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var query = _partRequestRepository
            .FindAll()
            .Include(p => p.Customer)
            .Include(p => p.Vehicle)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<PartRequestStatus>(status.Trim(), true, out var parsedStatus))
            {
                return ApiResponse<PagedResult<StaffPartRequestResponseDto>>.FailureResponse(
                    "Invalid part request status filter.",
                    400);
            }

            query = query.Where(p => p.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var normalizedSearchTerm = searchTerm.Trim().ToLower();

            query = query.Where(p =>
                p.Customer.FullName.ToLower().Contains(normalizedSearchTerm) ||
                (p.Customer.Email != null && p.Customer.Email.ToLower().Contains(normalizedSearchTerm)) ||
                (p.Customer.PhoneNumber != null && p.Customer.PhoneNumber.ToLower().Contains(normalizedSearchTerm)) ||
                p.PartName.ToLower().Contains(normalizedSearchTerm) ||
                (p.PartNumber != null && p.PartNumber.ToLower().Contains(normalizedSearchTerm)) ||
                p.Category.ToLower().Contains(normalizedSearchTerm) ||
                p.Description!.ToLower().Contains(normalizedSearchTerm) ||
                (p.Vehicle != null && p.Vehicle.VehicleNumber.ToLower().Contains(normalizedSearchTerm)));
        }

        var totalRecords = await query.CountAsync();

        var requests = await query
            .OrderByDescending(p => p.RequestedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new StaffPartRequestResponseDto
            {
                PartRequestId = p.PartRequestId,
                CustomerId = p.CustomerId,
                CustomerName = p.Customer.FullName,
                CustomerEmail = p.Customer.Email ?? string.Empty,
                CustomerPhoneNumber = p.Customer.PhoneNumber ?? string.Empty,
                VehicleId = p.VehicleId,
                VehicleNumber = p.Vehicle != null ? p.Vehicle.VehicleNumber : "N/A",
                VehicleName = p.Vehicle != null
                    ? $"{p.Vehicle.Brand} {p.Vehicle.Model} {p.Vehicle.Year}"
                    : "Not specified",
                PartName = p.PartName,
                PartNumber = p.PartNumber,
                Category = p.Category,
                Urgency = p.Urgency,
                Description = p.Description ?? string.Empty,
                Status = p.Status.ToString(),
                AdminResponse = p.AdminResponse,
                RequestedAt = p.RequestedAt,
                UpdatedAt = p.UpdatedAt,
            })
            .ToListAsync();

        var pagedResult = PagedResult<StaffPartRequestResponseDto>.Create(
            requests,
            pageNumber,
            pageSize,
            totalRecords);

        return ApiResponse<PagedResult<StaffPartRequestResponseDto>>.SuccessResponse(
            pagedResult,
            "Staff part requests loaded successfully.");
    }

    public async Task<ApiResponse<PartRequestResponseDto>> GetPartRequestByIdAsync(int id)
    {
        var request = await _partRequestRepository
            .FindByCondition(p => p.PartRequestId == id)
            .Include(p => p.Vehicle)
            .FirstOrDefaultAsync();

        if (request == null)
        {
            return ApiResponse<PartRequestResponseDto>.NotFoundResponse(
                "Part request not found.");
        }

        var response = MapPartRequestToDto(request, request.Vehicle);

        return ApiResponse<PartRequestResponseDto>.SuccessResponse(
            response,
            "Part request loaded successfully.");
    }

    public async Task<ApiResponse<StaffPartRequestResponseDto>> UpdatePartRequestStatusAsync(int id, UpdatePartRequestStatusDto dto)
    {
        var request = await _partRequestRepository
            .FindByCondition(p => p.PartRequestId == id, trackChanges: true)
            .Include(p => p.Customer)
            .Include(p => p.Vehicle)
            .FirstOrDefaultAsync();

        if (request == null)
        {
            return ApiResponse<StaffPartRequestResponseDto>.NotFoundResponse("Part request not found.");
        }

        if (!Enum.TryParse<PartRequestStatus>(dto.Status.Trim(), true, out var nextStatus) ||
            !StaffManagedStatuses.Contains(nextStatus))
        {
            return ApiResponse<StaffPartRequestResponseDto>.FailureResponse(
                "Staff can only set part request status to Reviewed, Available, or Unavailable.",
                400);
        }

        if (request.Status == PartRequestStatus.Cancelled)
        {
            return ApiResponse<StaffPartRequestResponseDto>.FailureResponse(
                "Cancelled part requests cannot be changed from the staff workspace.",
                400);
        }

        if (request.Status == PartRequestStatus.Available && nextStatus != PartRequestStatus.Available)
        {
            return ApiResponse<StaffPartRequestResponseDto>.FailureResponse(
                "Available part requests cannot be moved to another status.",
                400);
        }

        if (request.Status == PartRequestStatus.Unavailable && nextStatus != PartRequestStatus.Unavailable)
        {
            return ApiResponse<StaffPartRequestResponseDto>.FailureResponse(
                "Unavailable part requests cannot be moved to another status.",
                400);
        }

        if (nextStatus == PartRequestStatus.Reviewed &&
            request.Status != PartRequestStatus.Pending &&
            request.Status != PartRequestStatus.Reviewed)
        {
            return ApiResponse<StaffPartRequestResponseDto>.FailureResponse(
                "Only pending part requests can be moved into reviewed status.",
                400);
        }

        if ((nextStatus == PartRequestStatus.Available || nextStatus == PartRequestStatus.Unavailable) &&
            request.Status != PartRequestStatus.Pending &&
            request.Status != PartRequestStatus.Reviewed &&
            request.Status != nextStatus)
        {
            return ApiResponse<StaffPartRequestResponseDto>.FailureResponse(
                "Only pending or reviewed requests can be finalized as available or unavailable.",
                400);
        }

        request.Status = nextStatus;
        request.AdminResponse = string.IsNullOrWhiteSpace(dto.AdminResponse)
            ? null
            : dto.AdminResponse.Trim();
        request.UpdatedAt = DateTime.UtcNow;

        await _partRequestRepository.SaveChangesAsync();

        return ApiResponse<StaffPartRequestResponseDto>.SuccessResponse(
            MapStaffPartRequestToDto(request),
            "Part request updated successfully.");
    }

    private static PartRequestResponseDto MapPartRequestToDto(
        PartRequest request,
        Vehicle? vehicle)
    {
        return new PartRequestResponseDto
        {
            PartRequestId = request.PartRequestId,
            CustomerId = request.CustomerId,
            VehicleId = request.VehicleId,
            VehicleNumber = vehicle?.VehicleNumber ?? "N/A",
            VehicleName = vehicle != null
                ? $"{vehicle.Brand} {vehicle.Model} {vehicle.Year}"
                : "Not specified",
            PartName = request.PartName,
            PartNumber = request.PartNumber,
            Category = request.Category,
            Urgency = request.Urgency,
            Description = request.Description ?? string.Empty,
            Status = request.Status.ToString(),
            AdminResponse = request.AdminResponse,
            RequestedAt = request.RequestedAt,
            UpdatedAt = request.UpdatedAt,
        };
    }

    private static StaffPartRequestResponseDto MapStaffPartRequestToDto(PartRequest request)
    {
        return new StaffPartRequestResponseDto
        {
            PartRequestId = request.PartRequestId,
            CustomerId = request.CustomerId,
            CustomerName = request.Customer.FullName,
            CustomerEmail = request.Customer.Email ?? string.Empty,
            CustomerPhoneNumber = request.Customer.PhoneNumber ?? string.Empty,
            VehicleId = request.VehicleId,
            VehicleNumber = request.Vehicle?.VehicleNumber ?? "N/A",
            VehicleName = request.Vehicle != null
                ? $"{request.Vehicle.Brand} {request.Vehicle.Model} {request.Vehicle.Year}"
                : "Not specified",
            PartName = request.PartName,
            PartNumber = request.PartNumber,
            Category = request.Category,
            Urgency = request.Urgency,
            Description = request.Description ?? string.Empty,
            Status = request.Status.ToString(),
            AdminResponse = request.AdminResponse,
            RequestedAt = request.RequestedAt,
            UpdatedAt = request.UpdatedAt,
        };
    }
}
