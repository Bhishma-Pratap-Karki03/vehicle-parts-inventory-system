using Coursework.Application.DTOs.Reports;

namespace Coursework.Application.Interfaces;

public interface IFinancialReportService
{
    Task<FinancialReportResponseDto> GetDailyReport(DateTime date);

    Task<FinancialReportResponseDto> GetMonthlyReport(int year, int month);

    Task<FinancialReportResponseDto> GetYearlyReport(int year);
}