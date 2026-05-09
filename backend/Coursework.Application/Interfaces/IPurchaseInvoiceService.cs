using Coursework.Application.Common;
using Coursework.Application.DTOs.PurchaseInvoices;

namespace Coursework.Application.Interfaces;

public interface IPurchaseInvoiceService
{
    Task<ApiResponse<PurchaseInvoiceDetailDto>> CreatePurchaseInvoiceAsync(
        CreatePurchaseInvoiceDto dto,
        string createdById);

    Task<ApiResponse<PurchaseInvoiceDetailDto>> GetPurchaseInvoiceByIdAsync(
        int purchaseInvoiceId);

    Task<ApiResponse<PagedResult<PurchaseInvoiceListDto>>> GetPurchaseInvoicesAsync(
        PurchaseInvoiceQueryDto query);

    Task<ApiResponse<string>> SendPurchaseInvoiceEmailAsync(
        int purchaseInvoiceId);
    
    Task<ApiResponse<string>> GetPurchaseInvoicePdfUrlAsync(int purchaseInvoiceId);
}