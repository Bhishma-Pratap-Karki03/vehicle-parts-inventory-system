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
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IServiceRecordRepository _serviceRecordRepository;

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
                    .FirstOrDefault()
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
                ?.LastServiceDate
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
            CreatedAt = DateTime.UtcNow
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
            CreatedAt = a.CreatedAt
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
            CreatedAt = appointment.CreatedAt
        };
    }

    private static DateTime ConvertToUtc(DateTime dateTime)
    {
        if (dateTime.Kind == DateTimeKind.Utc)
            return dateTime;

        if (dateTime.Kind == DateTimeKind.Local)
            return dateTime.ToUniversalTime();

        return DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
    }
}