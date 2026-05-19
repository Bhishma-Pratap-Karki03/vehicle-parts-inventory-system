using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface ISalesInvoiceRepository : IRepositoryBase<SalesInvoice>
{
    Task<SalesInvoice?> GetSalesInvoiceDetailsAsync(int salesInvoiceId, bool trackChanges = false);

    Task<SalesInvoice?> GetSalesInvoiceForPdfAsync(int salesInvoiceId, bool trackChanges = false);

    Task<SalesInvoice?> GetSalesInvoiceWithPaymentsAsync(int salesInvoiceId, bool trackChanges = false);

    Task<List<SalesInvoice>> GetUnpaidCreditsOlderThanAsync(DateTime dueBefore, bool trackChanges = false);
}
