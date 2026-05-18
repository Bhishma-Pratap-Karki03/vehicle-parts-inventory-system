using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface IPartRepository : IRepositoryBase<Part>
{
    Task<List<Part>> GetLowStockPartsAsync(int threshold, bool trackChanges = false);
}
