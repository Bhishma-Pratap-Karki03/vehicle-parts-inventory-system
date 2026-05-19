using Coursework.Application.Common;
using Coursework.Application.DTOs.Appointments;
using Coursework.Application.DTOs.Vehicles;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Application.Services;

public class AppointmentService : IAppointmentService
{
    private static readonly AppointmentStatus[] StaffManagedStatuses =
    [
        AppointmentStatus.Confirmed,
        AppointmentStatus.Completed,
        AppointmentStatus.Rejected,
    ];

    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IServiceRecordRepository _serviceRecordRepository;
    private readonly IVehicleRepository _vehicleRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IVehicleRepository vehicleRepository,
        IServiceRecordRepository serviceRecordRepository)
    {
        _appointmentRepository = appointmentRepository;
        _vehicleRepository = vehicleRepository;
        _serviceRecordRepository = serviceRecordRepository;
    }

    public async Task<ApiResponse<List<CustomerVehicleDto>>> GetCustomerVehiclesAsync(string customerId)
    {
        var vehicles = await _vehicleRepository
            .FindByCondition(v => v.CustomerId == customerId)
            .ToListAsync();

        var vehicleIds = vehicles
            .Select(v => v.VehicleId)
            .ToList();

        var lastServiceDates = await _serviceRecordRepository
            .FindByCondition(s => vehicleIds.Contains(s.VehicleId))
            .GroupBy(s => s.VehicleId)
            .Select(g => new
            {
                VehicleId = g.Key,
                LastServiceDate = g
                    .OrderByDescending(s => s.ServiceDate)
                    .Select(s => (DateTime?)s.ServiceDate)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        var response = vehicles.Select(v => new CustomerVehicleDto
        {
            VehicleId = v.VehicleId,
            VehicleNumber = v.VehicleNumber,
            Brand = v.Brand,
            Model = v.Model,
            Year = v.Year,
            Mileage = v.Mileage,
            LastServiceDate = lastServiceDates
                .FirstOrDefault(s => s.VehicleId == v.VehicleId)
                ?.LastServiceDate,
        }).ToList();

        return ApiResponse<List<CustomerVehicleDto>>.SuccessResponse(
            response,
            "Customer vehicles loaded successfully.");
    }

    public async Task<ApiResponse<AppointmentResponseDto>> CreateAppointmentAsync(CreateAppointmentDto dto)
    {
        var appointmentDateUtc = ConvertToUtc(dto.AppointmentDate);

        if (appointmentDateUtc <= DateTime.UtcNow)
        {
            return ApiResponse<AppointmentResponseDto>.FailureResponse(
                "Appointment date must be in the future.", 400);
        }

        if (dto.AlternativeAppointmentDate.HasValue)
        {
            var alternativeUtc = ConvertToUtc(dto.AlternativeAppointmentDate.Value);

            if (alternativeUtc <= DateTime.UtcNow)
            {
                return ApiResponse<AppointmentResponseDto>.FailureResponse(
                    "Alternative appointment date must be in the future.", 400);
            }
        }

        var vehicle = await _vehicleRepository
            .FindByCondition(v => v.VehicleId == dto.VehicleId && v.CustomerId == dto.CustomerId)
            .FirstOrDefaultAsync();

        if (vehicle == null)
        {
            return ApiResponse<AppointmentResponseDto>.FailureResponse(
                "Selected vehicle does not belong to this customer.", 400);
        }

        var alreadyBooked = await _appointmentRepository
            .FindByCondition(a =>
                a.VehicleId == dto.VehicleId &&
                a.AppointmentDate == appointmentDateUtc &&
                a.Status != AppointmentStatus.Cancelled &&
                a.Status != AppointmentStatus.Rejected)
            .AnyAsync();

        if (alreadyBooked)
        {
            return ApiResponse<AppointmentResponseDto>.ConflictResponse(
                "This appointment slot is already booked for the selected vehicle.");
        }

        var appointment = new Appointment
        {
            CustomerId = dto.CustomerId,
            VehicleId = dto.VehicleId,
            AppointmentDate = appointmentDateUtc,
            AlternativeAppointmentDate = dto.AlternativeAppointmentDate.HasValue
                ? ConvertToUtc(dto.AlternativeAppointmentDate.Value)
                : null,
            ServiceType = dto.ServiceType,
            Urgency = dto.Urgency,
            IssueDescription = dto.IssueDescription.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _appointmentRepository.Create(appointment);
        await _appointmentRepository.SaveChangesAsync();

        var response = MapAppointmentToDto(appointment, vehicle);

        return ApiResponse<AppointmentResponseDto>.CreatedResponse(
            response,
            "Appointment booked successfully.");
    }

    public async Task<ApiResponse<PagedResult<AppointmentResponseDto>>> GetCustomerAppointmentsAsync(
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

        var query = _appointmentRepository
            .FindByCondition(a => a.CustomerId == customerId);

        var totalRecords = await query.CountAsync();

        var appointments = await query
            .Include(a => a.Vehicle)
            .OrderByDescending(a => a.AppointmentDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AppointmentResponseDto
            {
                AppointmentId = a.AppointmentId,
                CustomerId = a.CustomerId,
                VehicleId = a.VehicleId,
                VehicleNumber = a.Vehicle.VehicleNumber,
                VehicleName = $"{a.Vehicle.Brand} {a.Vehicle.Model} {a.Vehicle.Year}",
                AppointmentDate = a.AppointmentDate,
                AlternativeAppointmentDate = a.AlternativeAppointmentDate,
                ServiceType = a.ServiceType,
                Urgency = a.Urgency,
                IssueDescription = a.IssueDescription,
                Status = a.Status.ToString(),
                AdminRemarks = a.AdminRemarks,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
            })
            .ToListAsync();

        var pagedResult = PagedResult<AppointmentResponseDto>.Create(
            appointments,
            pageNumber,
            pageSize,
            totalRecords);

        return ApiResponse<PagedResult<AppointmentResponseDto>>.SuccessResponse(
            pagedResult,
            "Customer appointments loaded successfully.");
    }

    public async Task<ApiResponse<PagedResult<StaffAppointmentResponseDto>>> GetStaffAppointmentsAsync(
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

        var query = _appointmentRepository
            .FindAll()
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<AppointmentStatus>(status.Trim(), true, out var parsedStatus))
            {
                return ApiResponse<PagedResult<StaffAppointmentResponseDto>>.FailureResponse(
                    "Invalid appointment status filter.",
                    400);
            }

            query = query.Where(a => a.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var normalizedSearchTerm = searchTerm.Trim().ToLower();

            query = query.Where(a =>
                a.Customer.FullName.ToLower().Contains(normalizedSearchTerm) ||
                (a.Customer.Email != null && a.Customer.Email.ToLower().Contains(normalizedSearchTerm)) ||
                (a.Customer.PhoneNumber != null && a.Customer.PhoneNumber.ToLower().Contains(normalizedSearchTerm)) ||
                a.Vehicle.VehicleNumber.ToLower().Contains(normalizedSearchTerm) ||
                a.ServiceType.ToLower().Contains(normalizedSearchTerm) ||
                a.IssueDescription.ToLower().Contains(normalizedSearchTerm));
        }

        var totalRecords = await query.CountAsync();

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new StaffAppointmentResponseDto
            {
                AppointmentId = a.AppointmentId,
                CustomerId = a.CustomerId,
                CustomerName = a.Customer.FullName,
                CustomerEmail = a.Customer.Email ?? string.Empty,
                CustomerPhoneNumber = a.Customer.PhoneNumber ?? string.Empty,
                VehicleId = a.VehicleId,
                VehicleNumber = a.Vehicle.VehicleNumber,
                VehicleName = $"{a.Vehicle.Brand} {a.Vehicle.Model} {a.Vehicle.Year}",
                AppointmentDate = a.AppointmentDate,
                AlternativeAppointmentDate = a.AlternativeAppointmentDate,
                ServiceType = a.ServiceType,
                Urgency = a.Urgency,
                IssueDescription = a.IssueDescription,
                Status = a.Status.ToString(),
                AdminRemarks = a.AdminRemarks,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
            })
            .ToListAsync();

        var appointmentIds = appointments
            .Select(a => a.AppointmentId)
            .ToList();

        if (appointmentIds.Count > 0)
        {
            var serviceRecords = await _serviceRecordRepository
                .FindByCondition(s => appointmentIds.Contains(s.AppointmentId))
                .Select(s => new
                {
                    s.AppointmentId,
                    Dto = new StaffAppointmentServiceRecordDto
                    {
                        ServiceRecordId = s.ServiceRecordId,
                        ServiceDate = s.ServiceDate,
                        ServiceDescription = s.ServiceDescription,
                        PartsChangedOrSuggested = s.PartsChangedOrSuggested,
                        LaborCost = s.LaborCost,
                        Status = s.Status.ToString(),
                    }
                })
                .ToListAsync();

            var serviceRecordByAppointmentId = serviceRecords.ToDictionary(
                item => item.AppointmentId,
                item => item.Dto);

            foreach (var appointmentDto in appointments)
            {
                if (serviceRecordByAppointmentId.TryGetValue(appointmentDto.AppointmentId, out var serviceRecordDto))
                {
                    appointmentDto.ServiceRecord = serviceRecordDto;
                }
            }
        }

        var pagedResult = PagedResult<StaffAppointmentResponseDto>.Create(
            appointments,
            pageNumber,
            pageSize,
            totalRecords);

        return ApiResponse<PagedResult<StaffAppointmentResponseDto>>.SuccessResponse(
            pagedResult,
            "Staff appointments loaded successfully.");
    }

    public async Task<ApiResponse<AppointmentResponseDto>> GetAppointmentByIdAsync(int id)
    {
        var appointment = await _appointmentRepository
            .FindByCondition(a => a.AppointmentId == id)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return ApiResponse<AppointmentResponseDto>.NotFoundResponse("Appointment not found.");
        }

        var response = MapAppointmentToDto(appointment, appointment.Vehicle);

        return ApiResponse<AppointmentResponseDto>.SuccessResponse(
            response,
            "Appointment loaded successfully.");
    }

    public async Task<ApiResponse<StaffAppointmentResponseDto>> UpdateAppointmentStatusAsync(
        int id,
        UpdateAppointmentStatusDto dto,
        string staffId)
    {
        var appointment = await _appointmentRepository
            .FindByCondition(a => a.AppointmentId == id, trackChanges: true)
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return ApiResponse<StaffAppointmentResponseDto>.NotFoundResponse("Appointment not found.");
        }

        if (!Enum.TryParse<AppointmentStatus>(dto.Status.Trim(), true, out var nextStatus) ||
            !StaffManagedStatuses.Contains(nextStatus))
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Staff can only set appointment status to Confirmed, Completed, or Rejected.",
                400);
        }

        if (appointment.Status == AppointmentStatus.Cancelled)
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Cancelled appointments cannot be changed from the staff workspace.",
                400);
        }

        if (appointment.Status == AppointmentStatus.Completed && nextStatus != AppointmentStatus.Completed)
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Completed appointments cannot be moved to another status.",
                400);
        }

        if (appointment.Status == AppointmentStatus.Rejected && nextStatus != AppointmentStatus.Rejected)
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Rejected appointments cannot be moved to another status.",
                400);
        }

        if (nextStatus == AppointmentStatus.Confirmed &&
            appointment.Status != AppointmentStatus.Pending &&
            appointment.Status != AppointmentStatus.Confirmed)
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Only pending appointments can be confirmed.",
                400);
        }

        if (nextStatus == AppointmentStatus.Completed &&
            appointment.Status != AppointmentStatus.Confirmed &&
            appointment.Status != AppointmentStatus.Completed)
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Only confirmed appointments can be marked as completed.",
                400);
        }

        if (nextStatus == AppointmentStatus.Rejected && appointment.Status == AppointmentStatus.Completed)
        {
            return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                "Completed appointments cannot be rejected.",
                400);
        }

        appointment.Status = nextStatus;
        appointment.AdminRemarks = string.IsNullOrWhiteSpace(dto.AdminRemarks)
            ? null
            : dto.AdminRemarks.Trim();
        appointment.UpdatedAt = DateTime.UtcNow;

        if (nextStatus == AppointmentStatus.Completed)
        {
            var trimmedServiceDescription = dto.ServiceDescription?.Trim();

            if (string.IsNullOrWhiteSpace(trimmedServiceDescription))
            {
                return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                    "Service description is required when completing an appointment.",
                    400);
            }

            if (!dto.LaborCost.HasValue || dto.LaborCost.Value < 0)
            {
                return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                    "Labor cost must be zero or greater when completing an appointment.",
                    400);
            }

            var trimmedPartsChangedOrSuggested = string.IsNullOrWhiteSpace(dto.PartsChangedOrSuggested)
                ? null
                : dto.PartsChangedOrSuggested.Trim();

            if (string.IsNullOrWhiteSpace(trimmedPartsChangedOrSuggested))
            {
                return ApiResponse<StaffAppointmentResponseDto>.FailureResponse(
                    "Parts changed or suggested is required when completing an appointment.",
                    400);
            }

            var existingServiceRecord = await _serviceRecordRepository
                .FindByCondition(s => s.AppointmentId == appointment.AppointmentId, trackChanges: true)
                .FirstOrDefaultAsync();

            if (existingServiceRecord == null)
            {
                _serviceRecordRepository.Create(new ServiceRecord
                {
                    AppointmentId = appointment.AppointmentId,
                    CustomerId = appointment.CustomerId,
                    StaffId = staffId,
                    VehicleId = appointment.VehicleId,
                    ServiceDate = DateTime.UtcNow,
                    ServiceDescription = trimmedServiceDescription,
                    PartsChangedOrSuggested = trimmedPartsChangedOrSuggested,
                    LaborCost = dto.LaborCost.Value,
                    Status = ServiceStatus.Completed,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                existingServiceRecord.StaffId = staffId;
                existingServiceRecord.ServiceDate = DateTime.UtcNow;
                existingServiceRecord.ServiceDescription = trimmedServiceDescription;
                existingServiceRecord.PartsChangedOrSuggested = trimmedPartsChangedOrSuggested;
                existingServiceRecord.LaborCost = dto.LaborCost.Value;
                existingServiceRecord.Status = ServiceStatus.Completed;
                existingServiceRecord.UpdatedAt = DateTime.UtcNow;
                _serviceRecordRepository.Update(existingServiceRecord);
            }

            await _serviceRecordRepository.SaveChangesAsync();
        }

        await _appointmentRepository.SaveChangesAsync();

        var response = await MapStaffAppointmentToDtoAsync(appointment);

        return ApiResponse<StaffAppointmentResponseDto>.SuccessResponse(
            response,
            "Appointment status updated successfully.");
    }

    public async Task<ApiResponse<AppointmentResponseDto>> CancelAppointmentAsync(int id)
    {
        var appointment = await _appointmentRepository
            .FindByCondition(a => a.AppointmentId == id, trackChanges: true)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return ApiResponse<AppointmentResponseDto>.NotFoundResponse("Appointment not found.");
        }

        if (appointment.Status != AppointmentStatus.Pending)
        {
            return ApiResponse<AppointmentResponseDto>.FailureResponse(
                "Only pending appointments can be cancelled.", 400);
        }

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _appointmentRepository.SaveChangesAsync();

        var response = MapAppointmentToDto(appointment, appointment.Vehicle);

        return ApiResponse<AppointmentResponseDto>.SuccessResponse(
            response,
            "Appointment cancelled successfully.");
    }

    private static AppointmentResponseDto MapAppointmentToDto(Appointment appointment, Vehicle vehicle)
    {
        return new AppointmentResponseDto
        {
            AppointmentId = appointment.AppointmentId,
            CustomerId = appointment.CustomerId,
            VehicleId = appointment.VehicleId,
            VehicleNumber = vehicle.VehicleNumber,
            VehicleName = $"{vehicle.Brand} {vehicle.Model} {vehicle.Year}",
            AppointmentDate = appointment.AppointmentDate,
            AlternativeAppointmentDate = appointment.AlternativeAppointmentDate,
            ServiceType = appointment.ServiceType,
            Urgency = appointment.Urgency,
            IssueDescription = appointment.IssueDescription,
            Status = appointment.Status.ToString(),
            AdminRemarks = appointment.AdminRemarks,
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt,
        };
    }

    private async Task<StaffAppointmentResponseDto> MapStaffAppointmentToDtoAsync(Appointment appointment)
    {
        var serviceRecord = await _serviceRecordRepository
            .FindByCondition(s => s.AppointmentId == appointment.AppointmentId)
            .Select(s => new StaffAppointmentServiceRecordDto
            {
                ServiceRecordId = s.ServiceRecordId,
                ServiceDate = s.ServiceDate,
                ServiceDescription = s.ServiceDescription,
                PartsChangedOrSuggested = s.PartsChangedOrSuggested,
                LaborCost = s.LaborCost,
                Status = s.Status.ToString(),
            })
            .FirstOrDefaultAsync();

        return new StaffAppointmentResponseDto
        {
            AppointmentId = appointment.AppointmentId,
            CustomerId = appointment.CustomerId,
            CustomerName = appointment.Customer.FullName,
            CustomerEmail = appointment.Customer.Email ?? string.Empty,
            CustomerPhoneNumber = appointment.Customer.PhoneNumber ?? string.Empty,
            VehicleId = appointment.VehicleId,
            VehicleNumber = appointment.Vehicle.VehicleNumber,
            VehicleName = $"{appointment.Vehicle.Brand} {appointment.Vehicle.Model} {appointment.Vehicle.Year}",
            AppointmentDate = appointment.AppointmentDate,
            AlternativeAppointmentDate = appointment.AlternativeAppointmentDate,
            ServiceType = appointment.ServiceType,
            Urgency = appointment.Urgency,
            IssueDescription = appointment.IssueDescription,
            Status = appointment.Status.ToString(),
            AdminRemarks = appointment.AdminRemarks,
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt,
            ServiceRecord = serviceRecord,
        };
    }

    private static DateTime ConvertToUtc(DateTime dateTime)
    {
        if (dateTime.Kind == DateTimeKind.Utc)
        {
            return dateTime;
        }

        if (dateTime.Kind == DateTimeKind.Local)
        {
            return dateTime.ToUniversalTime();
        }

        return DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
    }
}
