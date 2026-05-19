using Coursework.Application.Common;
using Coursework.Application.DTOs.Common;
using Coursework.Application.DTOs.SalesInvoices;

namespace Coursework.Application.Interfaces;

public interface ISalesInvoiceService
{
    Task<ApiResponse<List<SalesInvoiceCustomerOptionDto>>> GetCustomerOptionsAsync();

    Task<ApiResponse<List<SalesInvoiceVehicleOptionDto>>> GetCustomerVehicleOptionsAsync(
        string customerId);

    Task<ApiResponse<SalesInvoiceDetailDto>> CreateSalesInvoiceAsync(
        CreateSalesInvoiceDto dto,
        string staffId);

    Task<ApiResponse<PagedResult<SalesInvoiceResponseDto>>> GetSalesInvoicesAsync(
        SalesInvoiceQueryParameters queryParameters);

    Task<ApiResponse<SalesInvoiceDetailDto>> GetSalesInvoiceByIdAsync(
        int salesInvoiceId);

    Task<ApiResponse<SalesInvoiceDetailDto>> AddPaymentAsync(
        int salesInvoiceId,
        AddSalesInvoicePaymentDto dto);

    Task<ApiResponse<string>> GetSalesInvoicePdfDownloadUrlAsync(
        int salesInvoiceId);
    
    Task<ApiResponse<string>> SendSalesInvoiceEmailAsync(
        int salesInvoiceId,
        SendSalesInvoiceEmailDto dto);
}
