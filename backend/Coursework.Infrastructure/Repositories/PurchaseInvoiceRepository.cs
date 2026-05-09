using Coursework.Application.DTOs.PurchaseInvoices;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class PurchaseInvoiceRepository 
    : RepositoryBase<PurchaseInvoice>, IPurchaseInvoiceRepository
{
    private readonly ApplicationDbContext _context;

    public PurchaseInvoiceRepository(ApplicationDbContext context)
        : base(context)
    {
        _context = context;
    }

    
    public async Task<Vendor?> GetVendorByIdAsync(int vendorId)
    {
        return await _context.Vendors
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.VendorId == vendorId);
    }

    public async Task<List<Part>> GetPartsByIdsAsync(List<int> partIds)
    {
        return await _context.Parts
            .Where(p => partIds.Contains(p.PartId))
            .ToListAsync();
    }
    
    public async Task<PurchaseInvoice?> GetPurchaseInvoiceByIdWithDetailsAsync(
        int purchaseInvoiceId,
        bool trackChanges = false)
    {
        var query = trackChanges
            ? _context.PurchaseInvoices
            : _context.PurchaseInvoices.AsNoTracking();

        return await query
            .Include(p => p.Vendor)
            .Include(p => p.CreatedBy)
            .Include(p => p.Items)
                .ThenInclude(i => i.Part)
            .Include(p => p.PartTransactions)
            .FirstOrDefaultAsync(p => p.PurchaseInvoiceId == purchaseInvoiceId);
    }

    public async Task<(IReadOnlyList<PurchaseInvoice> Items, int TotalRecords)> GetPurchaseInvoicesAsync(
        PurchaseInvoiceQueryDto queryDto)
    {
        var query = _context.PurchaseInvoices
            .AsNoTracking()
            .Include(p => p.Vendor)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(queryDto.SearchTerm))
        {
            var searchTerm = queryDto.SearchTerm.Trim().ToLower();

            query = query.Where(p =>
                p.InvoiceNumber.ToLower().Contains(searchTerm) ||
                p.Vendor.VendorName.ToLower().Contains(searchTerm));
        }

        var totalRecords = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((queryDto.PageNumber - 1) * queryDto.PageSize)
            .Take(queryDto.PageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<bool> InvoiceNumberExistsAsync(string invoiceNumber)
    {
        return await _context.PurchaseInvoices
            .AsNoTracking()
            .AnyAsync(p => p.InvoiceNumber == invoiceNumber);
    }

    public void AddPartTransactions(IEnumerable<PartTransaction> transactions)
    {
        _context.PartTransactions.AddRange(transactions);
    }
    
    public async Task ExecuteInTransactionAsync(Func<Task> operation)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await operation();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}