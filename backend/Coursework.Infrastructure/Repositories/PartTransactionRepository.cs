using Coursework.Application.DTOs.PartTransactions;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class PartTransactionRepository
    : RepositoryBase<PartTransaction>, IPartTransactionRepository
{
    private readonly ApplicationDbContext _context;

    public PartTransactionRepository(ApplicationDbContext context)
        : base(context)
    {
        _context = context;
    }

    public async Task<Part?> GetPartByIdAsync(
        int partId,
        bool trackChanges = false)
    {
        var query = trackChanges
            ? _context.Parts
            : _context.Parts.AsNoTracking();

        return await query.FirstOrDefaultAsync(p => p.PartId == partId);
    }

    public async Task<PartTransaction?> GetPartTransactionByIdWithDetailsAsync(
        int partTransactionId,
        bool trackChanges = false)
    {
        var query = trackChanges
            ? _context.PartTransactions
            : _context.PartTransactions.AsNoTracking();

        return await query
            .Include(t => t.Part)
            .Include(t => t.CreatedBy)
            .Include(t => t.PurchaseInvoice)
            .FirstOrDefaultAsync(t => t.PartTransactionId == partTransactionId);
    }

    public async Task<(IReadOnlyList<PartTransaction> Items, int TotalRecords)> GetPartTransactionsAsync(
        PartTransactionQueryDto queryDto)
    {
        var query = _context.PartTransactions
            .AsNoTracking()
            .Include(t => t.Part)
            .Include(t => t.CreatedBy)
            .Include(t => t.PurchaseInvoice)
            .AsQueryable();

        if (queryDto.PartId.HasValue)
        {
            query = query.Where(t => t.PartId == queryDto.PartId.Value);
        }

        if (queryDto.TransactionType.HasValue)
        {
            query = query.Where(t => t.TransactionType == queryDto.TransactionType.Value);
        }

        if (!string.IsNullOrWhiteSpace(queryDto.SearchTerm))
        {
            var searchTerm = queryDto.SearchTerm.Trim().ToLower();

            query = query.Where(t =>
                t.Part.PartName.ToLower().Contains(searchTerm) ||
                t.Part.PartNumber.ToLower().Contains(searchTerm) ||
                (t.PurchaseInvoice != null &&
                 t.PurchaseInvoice.InvoiceNumber.ToLower().Contains(searchTerm)) ||
                (t.Remarks != null &&
                 t.Remarks.ToLower().Contains(searchTerm)));
        }

        var totalRecords = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((queryDto.PageNumber - 1) * queryDto.PageSize)
            .Take(queryDto.PageSize)
            .ToListAsync();

        return (items, totalRecords);
    }
}