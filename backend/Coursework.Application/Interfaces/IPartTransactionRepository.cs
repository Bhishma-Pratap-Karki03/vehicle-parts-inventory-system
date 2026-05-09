using Coursework.Application.DTOs.PartTransactions;
using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface IPartTransactionRepository : IRepositoryBase<PartTransaction>
{
    Task<Part?> GetPartByIdAsync(
        int partId,
        bool trackChanges = false);

    Task<PartTransaction?> GetPartTransactionByIdWithDetailsAsync(
        int partTransactionId,
        bool trackChanges = false);

    Task<(IReadOnlyList<PartTransaction> Items, int TotalRecords)> GetPartTransactionsAsync(
        PartTransactionQueryDto query);
}