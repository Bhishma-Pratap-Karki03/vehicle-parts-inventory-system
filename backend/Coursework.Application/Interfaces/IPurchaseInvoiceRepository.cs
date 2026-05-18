using Coursework.Application.DTOs.PurchaseInvoices;
using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface IPurchaseInvoiceRepository : IRepositoryBase<PurchaseInvoice>
{
    Task<Vendor?> GetVendorByIdAsync(int vendorId);

    Task<List<Part>> GetPartsByIdsAsync(List<int> partIds);
    Task<PurchaseInvoice?> GetPurchaseInvoiceByIdWithDetailsAsync(
        int purchaseInvoiceId,
        bool trackChanges = false);

    Task<(IReadOnlyList<PurchaseInvoice> Items, int TotalRecords)> GetPurchaseInvoicesAsync(
        PurchaseInvoiceQueryDto query);

    Task<bool> InvoiceNumberExistsAsync(string invoiceNumber);

    void AddPartTransactions(IEnumerable<PartTransaction> transactions);
    Task ExecuteInTransactionAsync(Func<Task> operation);
}