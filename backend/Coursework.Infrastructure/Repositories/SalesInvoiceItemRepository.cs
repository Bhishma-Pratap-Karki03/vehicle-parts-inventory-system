using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class SalesInvoiceItemRepository : RepositoryBase<SalesInvoiceItem>, ISalesInvoiceItemRepository
{
    public SalesInvoiceItemRepository(ApplicationDbContext context) : base(context)
    {
    }
}