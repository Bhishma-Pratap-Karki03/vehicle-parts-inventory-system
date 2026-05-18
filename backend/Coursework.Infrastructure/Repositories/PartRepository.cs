using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class PartRepository(ApplicationDbContext context)
    : RepositoryBase<Part>(context), IPartRepository
{
    public async Task<List<Part>> GetLowStockPartsAsync(
        int threshold,
        bool trackChanges = false)
    {
        return await FindByCondition(
                p => p.IsActive && p.StockQuantity < threshold,
                trackChanges)
            .OrderBy(p => p.StockQuantity)
            .ThenBy(p => p.PartName)
            .ToListAsync();
    }
}
