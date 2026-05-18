using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class PurchaseInvoiceItemRepository : RepositoryBase<PurchaseInvoiceItem>, IPurchaseInvoiceItemRepository
{
    public PurchaseInvoiceItemRepository(ApplicationDbContext context) : base(context)
    {
    }
}