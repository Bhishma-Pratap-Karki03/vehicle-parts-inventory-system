using Coursework.Application.DTOs.PurchaseInvoices;

namespace Coursework.Application.Interfaces;

public interface IInvoicePdfService
{
    byte[] GeneratePurchaseInvoicePdf(PurchaseInvoiceDetailDto invoice);
}