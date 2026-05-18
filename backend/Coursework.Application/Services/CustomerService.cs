using Coursework.Application.Common;
using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Coursework.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly IServiceRecordRepository _serviceRecordRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(
        ICustomerRepository customerRepository,
        IUserRepository userRepository,
        IVehicleRepository vehicleRepository,
        ISalesInvoiceRepository salesInvoiceRepository,
        IServiceRecordRepository serviceRecordRepository,
        UserManager<ApplicationUser> userManager,
        ILogger<CustomerService> logger)
    {
        _customerRepository = customerRepository;
        _userRepository = userRepository;
        _vehicleRepository = vehicleRepository;
        _salesInvoiceRepository = salesInvoiceRepository;
        _serviceRecordRepository = serviceRecordRepository;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<ApiResponse<CustomerDetailsDto>> CreateCustomerAsync(CreateCustomerDto dto)
    {
        try
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);

            if (existingUser != null)
            {
                return ApiResponse<CustomerDetailsDto>.ConflictResponse(
                    "A customer with this email already exists.");
            }

            var customer = new ApplicationUser
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
                    ? null
                    : dto.PhoneNumber.Trim(),
                Address = string.IsNullOrWhiteSpace(dto.Address)
                    ? null
                    : dto.Address.Trim(),
                UserName = dto.Email.Trim(),
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(
                customer,
                "Customer@123");

            if (!result.Succeeded)
            {
                return ApiResponse<CustomerDetailsDto>.FailureResponse(
                    "Failed to create customer.",
                    400,
                    result.Errors.Select(error => error.Description).ToList());
            }

            await _userManager.AddToRoleAsync(customer, "Customer");

            var vehicleDtos = new List<VehicleDto>();

            foreach (var vehicleDto in dto.Vehicles)
            {
                var normalizedVehicleNumber = vehicleDto.VehicleNumber.Trim();

                var vehicleExists = await _vehicleRepository
                    .FindByCondition(v => v.VehicleNumber == normalizedVehicleNumber)
                    .AnyAsync();

                if (vehicleExists)
                {
                    return ApiResponse<CustomerDetailsDto>.ConflictResponse(
                        $"Vehicle number {normalizedVehicleNumber} already exists.");
                }

                var vehicle = new Vehicle
                {
                    CustomerId = customer.Id,
                    VehicleNumber = normalizedVehicleNumber,
                    Brand = vehicleDto.Brand.Trim(),
                    Model = vehicleDto.Model.Trim(),
                    Year = vehicleDto.Year,
                    Mileage = vehicleDto.Mileage,
                    CreatedAt = DateTime.UtcNow
                };

                var createdVehicle = await _customerRepository.CreateVehicleAsync(vehicle);

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

            var response = new CustomerDetailsDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email!,
                PhoneNumber = customer.PhoneNumber!,
                Address = customer.Address,
                Vehicles = vehicleDtos
            };

            return ApiResponse<CustomerDetailsDto>.CreatedResponse(
                response,
                "Customer registered successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating customer.");

            return ApiResponse<CustomerDetailsDto>.ServerErrorResponse(
                "An error occurred while creating the customer.");
        }
    }

    public async Task<ApiResponse<List<CustomerListDto>>> SearchCustomersAsync(string query)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return ApiResponse<List<CustomerListDto>>.FailureResponse(
                    "Search query is required.",
                    400);
            }

            var customers = await _customerRepository.SearchCustomersAsync(query);

            var response = customers
                .SelectMany(customer =>
                    customer.Vehicles.Select(vehicle =>
                        new CustomerListDto
                        {
                            Id = customer.Id,
                            FullName = customer.FullName,
                            Email = customer.Email!,
                            PhoneNumber = customer.PhoneNumber!,
                            VehicleNumber = vehicle.VehicleNumber
                        }))
                .ToList();

            return ApiResponse<List<CustomerListDto>>.SuccessResponse(
                response,
                "Customers fetched successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching customers.");

            return ApiResponse<List<CustomerListDto>>.ServerErrorResponse(
                "An error occurred while searching customers.");
        }
    }

    public async Task<ApiResponse<CustomerDetailsDto>> GetCustomerByIdAsync(string id)
    {
        try
        {
            var customer = await _customerRepository.GetCustomerByIdAsync(id);

            if (customer == null)
            {
                return ApiResponse<CustomerDetailsDto>.NotFoundResponse(
                    "Customer not found.");
            }

            var response = new CustomerDetailsDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email!,
                PhoneNumber = customer.PhoneNumber!,
                Address = customer.Address,
                Vehicles = customer.Vehicles.Select(vehicle =>
                    new VehicleDto
                    {
                        VehicleId = vehicle.VehicleId,
                        VehicleNumber = vehicle.VehicleNumber,
                        Brand = vehicle.Brand,
                        Model = vehicle.Model,
                        Year = vehicle.Year,
                        Mileage = vehicle.Mileage
                    }).ToList()
            };

            return ApiResponse<CustomerDetailsDto>.SuccessResponse(
                response,
                "Customer details fetched successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while loading customer {CustomerId}.", id);

            return ApiResponse<CustomerDetailsDto>.ServerErrorResponse(
                "An error occurred while loading customer details.");
        }
    }

    public async Task<ApiResponse<CustomerProfileDto>> GetProfileAsync(string customerId)
    {
        try
        {
            var user = await _userRepository.FindByIdAsync(customerId);

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
            var user = await _userRepository.FindByIdAsync(customerId);

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

            var result = await _userRepository.UpdateAsync(user);

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
            var vehicles = await _vehicleRepository.GetCustomerVehiclesAsync(customerId);

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

            var existing = await _vehicleRepository
                .FindByCondition(v => v.VehicleNumber == normalizedNumber)
                .AnyAsync();

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

            _vehicleRepository.Create(vehicle);
            await _vehicleRepository.SaveChangesAsync();

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
            var vehicle = await _vehicleRepository.GetCustomerVehicleAsync(
                vehicleId,
                customerId,
                trackChanges: true);

            if (vehicle == null)
            {
                return ApiResponse<CustomerVehicleDto>.NotFoundResponse(
                    "Vehicle was not found.");
            }

            var normalizedNumber = dto.VehicleNumber.Trim();

            var conflict = await _vehicleRepository
                .FindByCondition(v =>
                    v.VehicleNumber == normalizedNumber &&
                    v.VehicleId != vehicleId)
                .AnyAsync();

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

            await _vehicleRepository.SaveChangesAsync();

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
            var vehicle = await _vehicleRepository.GetCustomerVehicleAsync(
                vehicleId,
                customerId,
                trackChanges: true);

            if (vehicle == null)
            {
                return ApiResponse<int>.NotFoundResponse(
                    "Vehicle was not found.");
            }

            var hasInvoices = await _salesInvoiceRepository
                .FindByCondition(s => s.VehicleId == vehicleId)
                .AnyAsync();

            var hasServiceRecords = await _serviceRecordRepository
                .FindByCondition(s => s.VehicleId == vehicleId)
                .AnyAsync();

            if (hasInvoices || hasServiceRecords)
            {
                return ApiResponse<int>.ConflictResponse(
                    "Vehicle cannot be deleted because it is referenced by invoices or service records.");
            }

            _vehicleRepository.Delete(vehicle);
            await _vehicleRepository.SaveChangesAsync();

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
            var invoices = await _salesInvoiceRepository
                .FindByCondition(s => s.CustomerId == customerId)
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
            var records = await _serviceRecordRepository
                .FindByCondition(s => s.CustomerId == customerId)
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
            var invoiceAggregates = await _salesInvoiceRepository
                .FindByCondition(s => s.CustomerId == customerId)
                .GroupBy(_ => 1)
                .Select(group => new
                {
                    Count = group.Count(),
                    TotalSpent = group.Sum(s => s.PaidAmount),
                    Outstanding = group.Sum(s => s.FinalAmount - s.PaidAmount)
                })
                .FirstOrDefaultAsync();

            var serviceCount = await _serviceRecordRepository
                .FindByCondition(s => s.CustomerId == customerId)
                .CountAsync();

            var vehicleCount = await _vehicleRepository
                .FindByCondition(v => v.CustomerId == customerId)
                .CountAsync();

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