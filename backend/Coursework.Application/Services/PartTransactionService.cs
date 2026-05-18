using Coursework.Application.Common;
using Coursework.Application.DTOs.PartTransactions;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;

namespace Coursework.Application.Services;

public class PartTransactionService : IPartTransactionService
{
    private readonly IPartTransactionRepository _partTransactionRepository;

    public PartTransactionService(IPartTransactionRepository partTransactionRepository)
    {
        _partTransactionRepository = partTransactionRepository;
    }

    public async Task<ApiResponse<PartTransactionListDto>> AdjustPartStockAsync(
        AdjustPartStockDto dto,
        string createdById)
    {
        if (dto.QuantityChanged == 0)
        {
            return ApiResponse<PartTransactionListDto>.FailureResponse(
                "Quantity changed cannot be zero.");
        }

        if (string.IsNullOrWhiteSpace(dto.Remarks))
        {
            return ApiResponse<PartTransactionListDto>.FailureResponse(
                "Remarks are required for stock adjustment.");
        }

        var part = await _partTransactionRepository.GetPartByIdAsync(
            dto.PartId,
            trackChanges: true);

        if (part is null)
        {
            return ApiResponse<PartTransactionListDto>.NotFoundResponse(
                "Part not found.");
        }

        var stockBefore = part.StockQuantity;
        var stockAfter = stockBefore + dto.QuantityChanged;

        if (stockAfter < 0)
        {
            return ApiResponse<PartTransactionListDto>.FailureResponse(
                "Stock adjustment cannot make stock quantity negative.");
        }

        part.StockQuantity = stockAfter;

        var transaction = new PartTransaction
        {
            PartId = part.PartId,
            TransactionType = PartTransactionType.Adjustment,
            QuantityChanged = dto.QuantityChanged,
            StockBefore = stockBefore,
            StockAfter = stockAfter,
            CostPricePerUnit = part.CostPricePerUnit,
            Remarks = dto.Remarks.Trim(),
            CreatedById = createdById,
            CreatedAt = DateTime.UtcNow
        };

        _partTransactionRepository.Create(transaction);

        await _partTransactionRepository.SaveChangesAsync();

        var createdTransaction = await _partTransactionRepository.GetPartTransactionByIdWithDetailsAsync(
            transaction.PartTransactionId);

        if (createdTransaction is null)
        {
            return ApiResponse<PartTransactionListDto>.ServerErrorResponse(
                "Stock adjustment was saved but could not be loaded.");
        }

        return ApiResponse<PartTransactionListDto>.CreatedResponse(
            MapToListDto(createdTransaction),
            "Stock adjusted successfully.");
    }

    public async Task<ApiResponse<PartTransactionListDto>> GetPartTransactionByIdAsync(
        int partTransactionId)
    {
        var transaction = await _partTransactionRepository.GetPartTransactionByIdWithDetailsAsync(
            partTransactionId);

        if (transaction is null)
        {
            return ApiResponse<PartTransactionListDto>.NotFoundResponse(
                "Part transaction not found.");
        }

        return ApiResponse<PartTransactionListDto>.SuccessResponse(
            MapToListDto(transaction),
            "Part transaction retrieved successfully.");
    }

    public async Task<ApiResponse<PagedResult<PartTransactionListDto>>> GetPartTransactionsAsync(
        PartTransactionQueryDto query)
    {
        query.PageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
        query.PageSize = query.PageSize < 1 ? 10 : query.PageSize;
        query.PageSize = query.PageSize > 100 ? 100 : query.PageSize;

        var result = await _partTransactionRepository.GetPartTransactionsAsync(query);

        var items = result.Items
            .Select(MapToListDto)
            .ToList();

        var pagedResult = PagedResult<PartTransactionListDto>.Create(
            items,
            query.PageNumber,
            query.PageSize,
            result.TotalRecords);

        return ApiResponse<PagedResult<PartTransactionListDto>>.SuccessResponse(
            pagedResult,
            "Part transactions retrieved successfully.");
    }

    private static PartTransactionListDto MapToListDto(PartTransaction transaction)
    {
        return new PartTransactionListDto
        {
            PartTransactionId = transaction.PartTransactionId,
            PartId = transaction.PartId,
            PartName = transaction.Part.PartName,
            PartNumber = transaction.Part.PartNumber,
            TransactionType = transaction.TransactionType,
            QuantityChanged = transaction.QuantityChanged,
            StockBefore = transaction.StockBefore,
            StockAfter = transaction.StockAfter,
            CostPricePerUnit = transaction.CostPricePerUnit,
            PurchaseInvoiceId = transaction.PurchaseInvoiceId,
            PurchaseInvoiceNumber = transaction.PurchaseInvoice?.InvoiceNumber,
            Remarks = transaction.Remarks,
            CreatedById = transaction.CreatedById,
            CreatedByName = transaction.CreatedBy.FullName,
            CreatedAt = transaction.CreatedAt
        };
    }
}