using Coursework.Application.Common;
using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Coursework.Services;

public class CustomerService : ICustomerService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        ILogger<CustomerService> logger)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<ApiResponse<CustomerProfileDto>> GetProfileAsync(string customerId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(customerId);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<CustomerProfileDto>.NotFoundResponse(
                    "Customer was not found.");
            }

            return ApiResponse<CustomerProfileDto>.SuccessResponse(
                MapProfile(user),
                "Profile retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while loading profile for customer {CustomerId}.", customerId);

            return ApiResponse<CustomerProfileDto>.ServerErrorResponse(
                "An error occurred while loading the profile.");
        }
    }

    public async Task<ApiResponse<CustomerProfileDto>> UpdateProfileAsync(
        string customerId,
        UpdateCustomerProfileDto dto)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(customerId);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<CustomerProfileDto>.NotFoundResponse(
                    "Customer was not found.");
            }

            user.FullName = dto.FullName.Trim();
            user.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
                ? null
                : dto.PhoneNumber.Trim();
            user.Address = string.IsNullOrWhiteSpace(dto.Address)
                ? null
                : dto.Address.Trim();
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return ApiResponse<CustomerProfileDto>.FailureResponse(
                    "Unable to update the profile.",
                    errors: result.Errors.Select(error => error.Description).ToList());
            }

            return ApiResponse<CustomerProfileDto>.SuccessResponse(
                MapProfile(user),
                "Profile updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating profile for customer {CustomerId}.", customerId);

            return ApiResponse<CustomerProfileDto>.ServerErrorResponse(
                "An error occurred while updating the profile.");
        }
    }

    public async Task<ApiResponse<List<CustomerVehicleDto>>> GetVehiclesAsync(string customerId)
    {
        try
        {
            var vehicles = await _dbContext.Vehicles
                .AsNoTracking()
                .Where(v => v.CustomerId == customerId)
                .OrderBy(v => v.VehicleNumber)
                .ToListAsync();

            var response = vehicles.Select(MapVehicle).ToList();

            return ApiResponse<List<CustomerVehicleDto>>.SuccessResponse(
                response,
                "Vehicles retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while loading vehicles for customer {CustomerId}.", customerId);

            return ApiResponse<List<CustomerVehicleDto>>.ServerErrorResponse(
                "An error occurred while loading the vehicles.");
        }
    }

    public async Task<ApiResponse<CustomerVehicleDto>> AddVehicleAsync(
        string customerId,
        CreateCustomerVehicleDto dto)
    {
        try
        {
            var normalizedNumber = dto.VehicleNumber.Trim();

            var existing = await _dbContext.Vehicles
                .AsNoTracking()
                .AnyAsync(v => v.VehicleNumber == normalizedNumber);

            if (existing)
            {
                return ApiResponse<CustomerVehicleDto>.ConflictResponse(
                    "A vehicle with this number already exists.");
            }

            var vehicle = new Vehicle
            {
                CustomerId = customerId,
                VehicleNumber = normalizedNumber,
                Brand = dto.Brand.Trim(),
                Model = dto.Model.Trim(),
                Year = dto.Year,
                Mileage = dto.Mileage,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Vehicles.Add(vehicle);
            await _dbContext.SaveChangesAsync();

            return ApiResponse<CustomerVehicleDto>.CreatedResponse(
                MapVehicle(vehicle),
                "Vehicle added successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding vehicle for customer {CustomerId}.", customerId);

            return ApiResponse<CustomerVehicleDto>.ServerErrorResponse(
                "An error occurred while adding the vehicle.");
        }
    }

    public async Task<ApiResponse<CustomerVehicleDto>> UpdateVehicleAsync(
        string customerId,
        int vehicleId,
        UpdateCustomerVehicleDto dto)
    {
        try
        {
            var vehicle = await _dbContext.Vehicles
                .FirstOrDefaultAsync(v =>
                    v.VehicleId == vehicleId &&
                    v.CustomerId == customerId);

            if (vehicle == null)
            {
                return ApiResponse<CustomerVehicleDto>.NotFoundResponse(
                    "Vehicle was not found.");
            }

            var normalizedNumber = dto.VehicleNumber.Trim();

            var conflict = await _dbContext.Vehicles
                .AsNoTracking()
                .AnyAsync(v =>
                    v.VehicleNumber == normalizedNumber &&
                    v.VehicleId != vehicleId);

            if (conflict)
            {
                return ApiResponse<CustomerVehicleDto>.ConflictResponse(
                    "Another vehicle already uses this number.");
            }

            vehicle.VehicleNumber = normalizedNumber;
            vehicle.Brand = dto.Brand.Trim();
            vehicle.Model = dto.Model.Trim();
            vehicle.Year = dto.Year;
            vehicle.Mileage = dto.Mileage;
            vehicle.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return ApiResponse<CustomerVehicleDto>.SuccessResponse(
                MapVehicle(vehicle),
                "Vehicle updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while updating vehicle {VehicleId} for customer {CustomerId}.",
                vehicleId,
                customerId);

            return ApiResponse<CustomerVehicleDto>.ServerErrorResponse(
                "An error occurred while updating the vehicle.");
        }
    }

    public async Task<ApiResponse<int>> DeleteVehicleAsync(string customerId, int vehicleId)
    {
        try
        {
            var vehicle = await _dbContext.Vehicles
                .FirstOrDefaultAsync(v =>
                    v.VehicleId == vehicleId &&
                    v.CustomerId == customerId);

            if (vehicle == null)
            {
                return ApiResponse<int>.NotFoundResponse(
                    "Vehicle was not found.");
            }

            var hasInvoices = await _dbContext.SalesInvoices
                .AnyAsync(s => s.VehicleId == vehicleId);

            var hasServiceRecords = await _dbContext.ServiceRecords
                .AnyAsync(s => s.VehicleId == vehicleId);

            if (hasInvoices || hasServiceRecords)
            {
                return ApiResponse<int>.ConflictResponse(
                    "Vehicle cannot be deleted because it is referenced by invoices or service records.");
            }

            _dbContext.Vehicles.Remove(vehicle);
            await _dbContext.SaveChangesAsync();

            return ApiResponse<int>.SuccessResponse(
                vehicleId,
                "Vehicle deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while deleting vehicle {VehicleId} for customer {CustomerId}.",
                vehicleId,
                customerId);

            return ApiResponse<int>.ServerErrorResponse(
                "An error occurred while deleting the vehicle.");
        }
    }

    public async Task<ApiResponse<List<CustomerPurchaseHistoryItemDto>>> GetPurchaseHistoryAsync(
        string customerId)
    {
        try
        {
            var invoices = await _dbContext.SalesInvoices
                .AsNoTracking()
                .Where(s => s.CustomerId == customerId)
                .Include(s => s.Vehicle)
                .Include(s => s.Items)
                    .ThenInclude(item => item.Part)
                .OrderByDescending(s => s.InvoiceDate)
                .ToListAsync();

            var response = invoices.Select(invoice => new CustomerPurchaseHistoryItemDto
            {
                SalesInvoiceId = invoice.SalesInvoiceId,
                InvoiceNumber = invoice.InvoiceNumber,
                InvoiceDate = invoice.InvoiceDate,
                VehicleNumber = invoice.Vehicle?.VehicleNumber ?? string.Empty,
                VehicleBrandModel = invoice.Vehicle == null
                    ? string.Empty
                    : $"{invoice.Vehicle.Brand} {invoice.Vehicle.Model}".Trim(),
                SubTotal = invoice.SubTotal,
                DiscountAmount = invoice.DiscountAmount,
                FinalAmount = invoice.FinalAmount,
                PaidAmount = invoice.PaidAmount,
                RemainingAmount = invoice.FinalAmount - invoice.PaidAmount,
                PaymentStatus = invoice.PaymentStatus,
                DueDate = invoice.DueDate,
                ItemCount = invoice.Items.Count,
                Items = invoice.Items.Select(item => new CustomerPurchaseHistoryLineDto
                {
                    PartName = item.Part?.PartName ?? "Unknown Part",
                    PartNumber = item.Part?.PartNumber ?? string.Empty,
                    Quantity = item.Quantity,
                    PricePerUnit = item.PricePerUnit,
                    LineTotal = item.LineTotal
                }).ToList()
            }).ToList();

            return ApiResponse<List<CustomerPurchaseHistoryItemDto>>.SuccessResponse(
                response,
                "Purchase history retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while loading purchase history for customer {CustomerId}.",
                customerId);

            return ApiResponse<List<CustomerPurchaseHistoryItemDto>>.ServerErrorResponse(
                "An error occurred while loading the purchase history.");
        }
    }

    public async Task<ApiResponse<List<CustomerServiceHistoryItemDto>>> GetServiceHistoryAsync(
        string customerId)
    {
        try
        {
            var records = await _dbContext.ServiceRecords
                .AsNoTracking()
                .Where(s => s.CustomerId == customerId)
                .Include(s => s.Vehicle)
                .Include(s => s.Staff)
                .OrderByDescending(s => s.ServiceDate)
                .ToListAsync();

            var response = records.Select(record => new CustomerServiceHistoryItemDto
            {
                ServiceRecordId = record.ServiceRecordId,
                ServiceDate = record.ServiceDate,
                VehicleNumber = record.Vehicle?.VehicleNumber ?? string.Empty,
                VehicleBrandModel = record.Vehicle == null
                    ? string.Empty
                    : $"{record.Vehicle.Brand} {record.Vehicle.Model}".Trim(),
                ServiceDescription = record.ServiceDescription,
                PartsChangedOrSuggested = record.PartsChangedOrSuggested,
                LaborCost = record.LaborCost,
                Status = record.Status,
                StaffName = record.Staff?.FullName ?? "Unknown Staff"
            }).ToList();

            return ApiResponse<List<CustomerServiceHistoryItemDto>>.SuccessResponse(
                response,
                "Service history retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while loading service history for customer {CustomerId}.",
                customerId);

            return ApiResponse<List<CustomerServiceHistoryItemDto>>.ServerErrorResponse(
                "An error occurred while loading the service history.");
        }
    }

    public async Task<ApiResponse<CustomerHistorySummaryDto>> GetHistorySummaryAsync(
        string customerId)
    {
        try
        {
            var invoiceAggregates = await _dbContext.SalesInvoices
                .AsNoTracking()
                .Where(s => s.CustomerId == customerId)
                .GroupBy(_ => 1)
                .Select(group => new
                {
                    Count = group.Count(),
                    TotalSpent = group.Sum(s => s.PaidAmount),
                    Outstanding = group.Sum(s => s.FinalAmount - s.PaidAmount)
                })
                .FirstOrDefaultAsync();

            var serviceCount = await _dbContext.ServiceRecords
                .AsNoTracking()
                .CountAsync(s => s.CustomerId == customerId);

            var vehicleCount = await _dbContext.Vehicles
                .AsNoTracking()
                .CountAsync(v => v.CustomerId == customerId);

            var summary = new CustomerHistorySummaryDto
            {
                TotalPurchases = invoiceAggregates?.Count ?? 0,
                TotalSpent = invoiceAggregates?.TotalSpent ?? 0m,
                OutstandingBalance = invoiceAggregates?.Outstanding ?? 0m,
                TotalServices = serviceCount,
                VehicleCount = vehicleCount
            };

            return ApiResponse<CustomerHistorySummaryDto>.SuccessResponse(
                summary,
                "Summary retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while loading history summary for customer {CustomerId}.",
                customerId);

            return ApiResponse<CustomerHistorySummaryDto>.ServerErrorResponse(
                "An error occurred while loading the history summary.");
        }
    }

    private static CustomerProfileDto MapProfile(ApplicationUser user)
    {
        return new CustomerProfileDto
        {
            CustomerId = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private static CustomerVehicleDto MapVehicle(Vehicle vehicle)
    {
        return new CustomerVehicleDto
        {
            VehicleId = vehicle.VehicleId,
            VehicleNumber = vehicle.VehicleNumber,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            Year = vehicle.Year,
            Mileage = vehicle.Mileage,
            CreatedAt = vehicle.CreatedAt,
            UpdatedAt = vehicle.UpdatedAt
        };
    }
}
