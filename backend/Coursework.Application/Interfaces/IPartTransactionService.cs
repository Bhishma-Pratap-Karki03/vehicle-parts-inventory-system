using Coursework.Application.Common;
using Coursework.Application.DTOs.PartTransactions;

namespace Coursework.Application.Interfaces;

public interface IPartTransactionService
{
    Task<ApiResponse<PartTransactionListDto>> AdjustPartStockAsync(
        AdjustPartStockDto dto,
        string createdById);

    Task<ApiResponse<PartTransactionListDto>> GetPartTransactionByIdAsync(
        int partTransactionId);

    Task<ApiResponse<PagedResult<PartTransactionListDto>>> GetPartTransactionsAsync(
        PartTransactionQueryDto query);
}