using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class SalesInvoiceRepository : RepositoryBase<SalesInvoice>, ISalesInvoiceRepository
{
    public SalesInvoiceRepository(ApplicationDbContext context) : base(context)
    {
    }
}