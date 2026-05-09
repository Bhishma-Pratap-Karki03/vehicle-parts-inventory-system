using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class SalesInvoiceRepository : RepositoryBase<SalesInvoice>, ISalesInvoiceRepository
{
    public SalesInvoiceRepository(ApplicationDbContext context)
        : base(context)
    {
    }

    public async Task<SalesInvoice?> GetSalesInvoiceDetailsAsync(
        int salesInvoiceId,
        bool trackChanges = false)
    {
        return await FindByCondition(
                s => s.SalesInvoiceId == salesInvoiceId,
                trackChanges)
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Vehicle)
            .Include(s => s.Items)
            .ThenInclude(i => i.Part)
            .FirstOrDefaultAsync();
    }

    public async Task<SalesInvoice?> GetSalesInvoiceForPdfAsync(
        int salesInvoiceId,
        bool trackChanges = false)
    {
        return await FindByCondition(
                s => s.SalesInvoiceId == salesInvoiceId,
                trackChanges)
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Vehicle)
            .Include(s => s.Items)
            .ThenInclude(i => i.Part)
            .FirstOrDefaultAsync();
    }

    public async Task<List<SalesInvoice>> GetUnpaidCreditsOlderThanAsync(
        DateTime dueBefore,
        bool trackChanges = false)
    {
        return await FindByCondition(
                i => i.PaymentStatus != PaymentStatus.Paid &&
                     i.DueDate != null &&
                     i.DueDate < dueBefore,
                trackChanges)
            .Include(i => i.Customer)
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }
}
