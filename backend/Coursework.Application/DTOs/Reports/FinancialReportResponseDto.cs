using Coursework.Application.DTOs.PartRequests;

namespace Coursework.Application.DTOs.Reports;

public class FinancialReportResponseDto
{
    public List<FinancialReportRowDto> Rows { get; set; } = new();
    public List<TopSellingPartDto> TopSellingParts { get; set; } = new();
}