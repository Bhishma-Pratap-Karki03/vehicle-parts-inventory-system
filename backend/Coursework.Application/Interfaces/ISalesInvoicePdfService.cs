using Coursework.Application.DTOs.SalesInvoices;

namespace Coursework.Application.Interfaces;

public interface ISalesInvoicePdfService
{
    byte[] GenerateSalesInvoicePdf(SalesInvoiceDetailDto invoice);
}