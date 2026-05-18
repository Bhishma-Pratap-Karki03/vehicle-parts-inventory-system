using Coursework.Application.Common;
using Coursework.Application.DTOs.Customers;

namespace Coursework.Application.Interfaces;

public interface ICustomerReportService
{
    Task<ApiResponse<List<RegularCustomerReportDto>>> GetRegularCustomersAsync(int limit = 10);

    Task<ApiResponse<List<HighSpenderReportDto>>> GetHighSpendersAsync(int limit = 10);

    Task<ApiResponse<List<PendingCreditReportDto>>> GetPendingCreditsAsync(int overdueDays = 30);
}
