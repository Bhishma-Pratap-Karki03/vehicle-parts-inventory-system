using Coursework.Application.Common;
using Coursework.Application.DTOs.Customers;
using Coursework.Application.Interfaces;
using Coursework.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Coursework.Services;

public class CustomerReportService : ICustomerReportService
{
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<CustomerReportService> _logger;

    public CustomerReportService(
        ISalesInvoiceRepository salesInvoiceRepository,
        IUserRepository userRepository,
        ILogger<CustomerReportService> logger)
    {
        _salesInvoiceRepository = salesInvoiceRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<List<RegularCustomerReportDto>>> GetRegularCustomersAsync(int limit = 10)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 100);

            var data = await _salesInvoiceRepository.FindAll()
                .GroupBy(s => s.CustomerId)
                .Select(group => new
                {
                    CustomerId = group.Key,
                    PurchaseCount = group.Count(),
                    TotalSpent = group.Sum(s => s.PaidAmount),
                    LastPurchaseDate = group.Max(s => (DateTime?)s.InvoiceDate)
                })
                .OrderByDescending(item => item.PurchaseCount)
                .ThenByDescending(item => item.TotalSpent)
                .Take(limit)
                .ToListAsync();

            var customerIds = data.Select(item => item.CustomerId).ToList();

            var customers = await _userRepository.GetUsersByIdsAsync(customerIds);

            var response = data
                .Select(item =>
                {
                    var customer = customers.FirstOrDefault(c => c.Id == item.CustomerId);
                    return new RegularCustomerReportDto
                    {
                        CustomerId = item.CustomerId,
                        FullName = customer?.FullName ?? "Unknown Customer",
                        Email = customer?.Email,
                        PhoneNumber = customer?.PhoneNumber,
                        PurchaseCount = item.PurchaseCount,
                        TotalSpent = item.TotalSpent,
                        LastPurchaseDate = item.LastPurchaseDate
                    };
                })
                .ToList();

            return ApiResponse<List<RegularCustomerReportDto>>.SuccessResponse(
                response,
                "Regular customers report generated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating regular customers report.");

            return ApiResponse<List<RegularCustomerReportDto>>.ServerErrorResponse(
                "An error occurred while generating the regular customers report.");
        }
    }

    public async Task<ApiResponse<List<HighSpenderReportDto>>> GetHighSpendersAsync(int limit = 10)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 100);

            var data = await _salesInvoiceRepository.FindAll()
                .GroupBy(s => s.CustomerId)
                .Select(group => new
                {
                    CustomerId = group.Key,
                    TotalSpent = group.Sum(s => s.PaidAmount),
                    PurchaseCount = group.Count(),
                    LastPurchaseDate = group.Max(s => (DateTime?)s.InvoiceDate)
                })
                .OrderByDescending(item => item.TotalSpent)
                .ThenByDescending(item => item.PurchaseCount)
                .Take(limit)
                .ToListAsync();

            var customerIds = data.Select(item => item.CustomerId).ToList();

            var customers = await _userRepository.GetUsersByIdsAsync(customerIds);

            var response = data
                .Select(item =>
                {
                    var customer = customers.FirstOrDefault(c => c.Id == item.CustomerId);
                    return new HighSpenderReportDto
                    {
                        CustomerId = item.CustomerId,
                        FullName = customer?.FullName ?? "Unknown Customer",
                        Email = customer?.Email,
                        PhoneNumber = customer?.PhoneNumber,
                        TotalSpent = item.TotalSpent,
                        PurchaseCount = item.PurchaseCount,
                        LastPurchaseDate = item.LastPurchaseDate
                    };
                })
                .ToList();

            return ApiResponse<List<HighSpenderReportDto>>.SuccessResponse(
                response,
                "High spenders report generated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating high spenders report.");

            return ApiResponse<List<HighSpenderReportDto>>.ServerErrorResponse(
                "An error occurred while generating the high spenders report.");
        }
    }

    public async Task<ApiResponse<List<PendingCreditReportDto>>> GetPendingCreditsAsync(int overdueDays = 30)
    {
        try
        {
            overdueDays = Math.Clamp(overdueDays, 0, 365);
            var overdueThreshold = DateTime.UtcNow.AddDays(-overdueDays);

            var data = await _salesInvoiceRepository.FindAll()
                .Where(s => s.PaymentStatus != PaymentStatus.Paid)
                .GroupBy(s => s.CustomerId)
                .Select(group => new
                {
                    CustomerId = group.Key,
                    OutstandingBalance = group.Sum(s => s.FinalAmount - s.PaidAmount),
                    UnpaidInvoiceCount = group.Count(),
                    OverdueInvoiceCount = group.Count(s => s.InvoiceDate <= overdueThreshold),
                    OldestUnpaidInvoiceDate = group.Min(s => (DateTime?)s.InvoiceDate)
                })
                .Where(item => item.OutstandingBalance > 0)
                .OrderByDescending(item => item.OutstandingBalance)
                .ToListAsync();

            var customerIds = data.Select(item => item.CustomerId).ToList();

            var customers = await _userRepository.GetUsersByIdsAsync(customerIds);

            var response = data
                .Select(item =>
                {
                    var customer = customers.FirstOrDefault(c => c.Id == item.CustomerId);
                    return new PendingCreditReportDto
                    {
                        CustomerId = item.CustomerId,
                        FullName = customer?.FullName ?? "Unknown Customer",
                        Email = customer?.Email,
                        PhoneNumber = customer?.PhoneNumber,
                        OutstandingBalance = item.OutstandingBalance,
                        UnpaidInvoiceCount = item.UnpaidInvoiceCount,
                        OverdueInvoiceCount = item.OverdueInvoiceCount,
                        OldestUnpaidInvoiceDate = item.OldestUnpaidInvoiceDate
                    };
                })
                .ToList();

            return ApiResponse<List<PendingCreditReportDto>>.SuccessResponse(
                response,
                "Pending credits report generated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating pending credits report.");

            return ApiResponse<List<PendingCreditReportDto>>.ServerErrorResponse(
                "An error occurred while generating the pending credits report.");
        }
    }
}
