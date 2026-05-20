using Coursework.Application.Common;
using Coursework.Application.DTOs.Parts;
using Coursework.Application.Interfaces;
using Coursework.Application.DTOs.Cloudinary;
using Coursework.Application.DTOs.Common;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace Coursework.Application.Services;

public class PartService(
    IPartRepository partRepository,
    IVendorRepository vendorRepository,
    IPurchaseInvoiceItemRepository purchaseInvoiceItemRepository,
    ISalesInvoiceItemRepository salesInvoiceItemRepository,
    IPartTransactionRepository partTransactionRepository,
    ICloudinaryService cloudinaryService,
    ILogger<PartService> logger) : IPartService
{
    public async Task<ApiResponse<PagedResult<PartDto>>> GetAllAsync(PartQueryDto query)
    {
        var partsQuery = partRepository.FindAll()
            .Include(p => p.Vendor)
            .AsQueryable();

        if (!query.IncludeDeleted)
        {
            partsQuery = partsQuery.Where(p => !p.IsDeleted);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var searchTerm = query.SearchTerm.Trim().ToLower();

            partsQuery = partsQuery.Where(p =>
                p.PartName.ToLower().Contains(searchTerm) ||
                p.PartNumber.ToLower().Contains(searchTerm) ||
                (p.Category != null && p.Category.ToLower().Contains(searchTerm)));
        }

        if (query.VendorId.HasValue)
        {
            partsQuery = partsQuery.Where(p => p.VendorId == query.VendorId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            var category = query.Category.Trim().ToLower();
            partsQuery = partsQuery.Where(p => p.Category != null && p.Category.ToLower() == category);
        }

        if (query.Status.HasValue)
        {
            partsQuery = partsQuery.Where(p => p.Status == query.Status.Value);
        }

        if (query.LowStockOnly == true)
        {
            partsQuery = partsQuery.Where(p => p.StockQuantity < p.MinimumStockLevel);
        }

        var totalRecords = await partsQuery.CountAsync();

        var parts = await partsQuery
            .OrderBy(p => p.PartName)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => MapToDto(p))
            .ToListAsync();

        var pagedResult = PagedResult<PartDto>.Create(
            parts,
            query.PageNumber,
            query.PageSize,
            totalRecords);

        return ApiResponse<PagedResult<PartDto>>.SuccessResponse(
            pagedResult,
            "Parts retrieved successfully.");
    }

    public async Task<ApiResponse<PartDto>> GetByIdAsync(int id)
    {
        var part = await partRepository
            .FindByCondition(p => p.PartId == id && !p.IsDeleted)
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync();

        if (part is null)
        {
            return ApiResponse<PartDto>.NotFoundResponse("Part not found.");
        }

        return ApiResponse<PartDto>.SuccessResponse(
            MapToDto(part),
            "Part retrieved successfully.");
    }

    public async Task<ApiResponse<PartDto>> CreateAsync(CreatePartDto dto)
    {
        var vendorExists = await vendorRepository
            .FindByCondition(v => v.VendorId == dto.VendorId && v.IsActive)
            .AnyAsync();

        if (!vendorExists)
        {
            return ApiResponse<PartDto>.NotFoundResponse("Vendor not found.");
        }

        var normalizedPartNumber = dto.PartNumber.Trim().ToLower();

        var duplicatePartNumber = await partRepository
            .FindByCondition(p => p.PartNumber.ToLower() == normalizedPartNumber)
            .AnyAsync();

        if (duplicatePartNumber)
        {
            return ApiResponse<PartDto>.ConflictResponse("Part number already exists.");
        }

        var part = new Part
        {
            VendorId = dto.VendorId,
            PartName = dto.PartName.Trim(),
            PartNumber = dto.PartNumber.Trim(),
            Category = string.IsNullOrWhiteSpace(dto.Category)
                ? null
                : dto.Category.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description)
                ? null
                : dto.Description.Trim(),
            
            CostPricePerUnit = 0,
            StockQuantity = 0,

            SellingPricePerUnit = dto.SellingPricePerUnit,
            MinimumStockLevel = dto.MinimumStockLevel,
            Status = dto.Status,
            IsDeleted = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        partRepository.Create(part);
        await partRepository.SaveChangesAsync();

        logger.LogInformation("Part created successfully. PartId: {PartId}, PartNumber: {PartNumber}",
            part.PartId,
            part.PartNumber);

        var createdPart = await partRepository
            .FindByCondition(p => p.PartId == part.PartId)
            .Include(p => p.Vendor)
            .FirstAsync();

        return ApiResponse<PartDto>.CreatedResponse(
            MapToDto(createdPart),
            "Part created successfully.");
    }

    public async Task<ApiResponse<PartDto>> UpdateAsync(int id, UpdatePartDto dto)
    {
        var part = await partRepository
            .FindByCondition(p => p.PartId == id && !p.IsDeleted, trackChanges: true)
            .FirstOrDefaultAsync();

        if (part is null)
        {
            return ApiResponse<PartDto>.NotFoundResponse("Part not found.");
        }

        var vendorExists = await vendorRepository
            .FindByCondition(v => v.VendorId == dto.VendorId && v.IsActive)
            .AnyAsync();

        if (!vendorExists)
        {
            return ApiResponse<PartDto>.NotFoundResponse("Vendor not found.");
        }

        var normalizedPartNumber = dto.PartNumber.Trim().ToLower();

        var duplicatePartNumber = await partRepository
            .FindByCondition(p =>
                p.PartId != id &&
                p.PartNumber.ToLower() == normalizedPartNumber)
            .AnyAsync();

        if (duplicatePartNumber)
        {
            return ApiResponse<PartDto>.ConflictResponse("Part number already exists.");
        }

        part.VendorId = dto.VendorId;
        part.PartName = dto.PartName.Trim();
        part.PartNumber = dto.PartNumber.Trim();
        part.Category = string.IsNullOrWhiteSpace(dto.Category)
            ? null
            : dto.Category.Trim();
        part.Description = string.IsNullOrWhiteSpace(dto.Description)
            ? null
            : dto.Description.Trim();
        
        part.SellingPricePerUnit = dto.SellingPricePerUnit;
        part.MinimumStockLevel = dto.MinimumStockLevel;
        part.Status = dto.Status;
        part.UpdatedAt = DateTime.UtcNow;

        await partRepository.SaveChangesAsync();

        logger.LogInformation("Part updated successfully. PartId: {PartId}", part.PartId);

        var updatedPart = await partRepository
            .FindByCondition(p => p.PartId == part.PartId)
            .Include(p => p.Vendor)
            .FirstAsync();

        return ApiResponse<PartDto>.SuccessResponse(
            MapToDto(updatedPart),
            "Part updated successfully.");
    }

    public async Task<ApiResponse<DeletePartResultDto>> DeleteAsync(int id)
    {
        var part = await partRepository
            .FindByCondition(p => p.PartId == id && !p.IsDeleted, trackChanges: true)
            .FirstOrDefaultAsync();

        if (part is null)
        {
            return ApiResponse<DeletePartResultDto>.NotFoundResponse("Part not found.");
        }

        if (part.StockQuantity > 0)
        {
            return ApiResponse<DeletePartResultDto>.ConflictResponse(
                "This part cannot be deleted because it still has stock on hand. Adjust the stock to zero first.");
        }

        var hasPurchaseHistory = await purchaseInvoiceItemRepository
            .FindByCondition(item => item.PartId == id)
            .AnyAsync();

        var hasSalesHistory = await salesInvoiceItemRepository
            .FindByCondition(item => item.PartId == id)
            .AnyAsync();

        var hasTransactionHistory = await partTransactionRepository
            .FindByCondition(transaction => transaction.PartId == id)
            .AnyAsync();

        if (hasPurchaseHistory || hasSalesHistory || hasTransactionHistory)
        {
            return ApiResponse<DeletePartResultDto>.ConflictResponse(
                "This part cannot be deleted because it already has purchase, sales, or stock transaction history.");
        }

        part.IsDeleted = true;
        part.DeletedAt = DateTime.UtcNow;
        part.UpdatedAt = DateTime.UtcNow;

        await partRepository.SaveChangesAsync();

        logger.LogInformation("Part soft deleted successfully. PartId: {PartId}", part.PartId);

        return ApiResponse<DeletePartResultDto>.SuccessResponse(
            new DeletePartResultDto
            {
                PartId = part.PartId,
                DeletedAt = part.DeletedAt.Value
            },
            "Part deleted successfully.");
    }

    public async Task<ApiResponse<List<PartDto>>> GetLowStockAsync()
    {
        var parts = await partRepository
            .FindByCondition(p => !p.IsDeleted && p.StockQuantity < p.MinimumStockLevel)
            .Include(p => p.Vendor)
            .OrderBy(p => p.StockQuantity)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return ApiResponse<List<PartDto>>.SuccessResponse(
            parts,
            "Low-stock parts retrieved successfully.");
    }
    
    public async Task<ApiResponse<UploadPartImageResultDto>> UploadImageAsync(
        int id,
        FileUploadDto file)
    {
        var part = await partRepository
            .FindByCondition(p => p.PartId == id && !p.IsDeleted, trackChanges: true)
            .FirstOrDefaultAsync();

        if (part is null)
        {
            return ApiResponse<UploadPartImageResultDto>.NotFoundResponse("Part not found.");
        }

        if (!string.IsNullOrWhiteSpace(part.ImagePublicId))
        {
            return ApiResponse<UploadPartImageResultDto>.ConflictResponse(
                "Part already has an image. Use PATCH to replace it.");
        }

        var validationResponse = ValidateImageFile(file);
        if (validationResponse is not null)
        {
            return validationResponse;
        }

        var publicId = $"part-{part.PartId}";
        const string folder = "autocareims_parts";

        var uploadResult = await cloudinaryService.UploadImageAsync(
            file,
            publicId,
            folder);

        part.ImagePublicId = uploadResult.PublicId;
        part.UpdatedAt = DateTime.UtcNow;

        await partRepository.SaveChangesAsync();

        logger.LogInformation(
            "Part image uploaded successfully. PartId: {PartId}, PublicId: {PublicId}",
            part.PartId,
            part.ImagePublicId);

        return ApiResponse<UploadPartImageResultDto>.SuccessResponse(
            new UploadPartImageResultDto
            {
                PartId = part.PartId,
                ImagePublicId = part.ImagePublicId
            },
            "Part image uploaded successfully.");
    }
    
    public async Task<ApiResponse<UploadPartImageResultDto>> ReplaceImageAsync(
        int id,
        FileUploadDto file)
    {
        var part = await partRepository
            .FindByCondition(p => p.PartId == id && !p.IsDeleted, trackChanges: true)
            .FirstOrDefaultAsync();

        if (part is null)
        {
            return ApiResponse<UploadPartImageResultDto>.NotFoundResponse("Part not found.");
        }

        if (string.IsNullOrWhiteSpace(part.ImagePublicId))
        {
            return ApiResponse<UploadPartImageResultDto>.FailureResponse(
                "Part does not have an image to replace. Use POST to upload a new image.",
                400);
        }

        var validationResponse = ValidateImageFile(file);
        if (validationResponse is not null)
        {
            return validationResponse;
        }

        await cloudinaryService.DeleteImageAsync(part.ImagePublicId);

        var publicId = $"part-{part.PartId}";
        const string folder = "autocareims_parts";

        var uploadResult = await cloudinaryService.UploadImageAsync(
            file,
            publicId,
            folder);

        part.ImagePublicId = uploadResult.PublicId;
        part.UpdatedAt = DateTime.UtcNow;

        await partRepository.SaveChangesAsync();

        logger.LogInformation(
            "Part image replaced successfully. PartId: {PartId}, PublicId: {PublicId}",
            part.PartId,
            part.ImagePublicId);

        return ApiResponse<UploadPartImageResultDto>.SuccessResponse(
            new UploadPartImageResultDto
            {
                PartId = part.PartId,
                ImagePublicId = part.ImagePublicId
            },
            "Part image replaced successfully.");
    }
    public async Task<ApiResponse<string>> DeleteImageAsync(int id)
    {
        var part = await partRepository
            .FindByCondition(p => p.PartId == id && !p.IsDeleted, trackChanges: true)
            .FirstOrDefaultAsync();

        if (part is null)
        {
            return ApiResponse<string>.NotFoundResponse("Part not found.");
        }

        if (string.IsNullOrWhiteSpace(part.ImagePublicId))
        {
            return ApiResponse<string>.FailureResponse(
                "This part does not have an image to delete.",
                400);
        }

        await cloudinaryService.DeleteImageAsync(part.ImagePublicId);

        part.ImagePublicId = null;
        part.UpdatedAt = DateTime.UtcNow;

        await partRepository.SaveChangesAsync();

        logger.LogInformation("Part image deleted successfully. PartId: {PartId}", part.PartId);

        return ApiResponse<string>.SuccessResponse(
            $"Image deleted for PartId: {part.PartId}",
            "Part image deleted successfully.");
    }
    
    private static ApiResponse<UploadPartImageResultDto>? ValidateImageFile(FileUploadDto file)
    {
        if (file.Length == 0)
        {
            return ApiResponse<UploadPartImageResultDto>.FailureResponse(
                "Image file is required.",
                400);
        }

        var allowedContentTypes = new[]
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        if (!allowedContentTypes.Contains(file.ContentType.ToLower()))
        {
            return ApiResponse<UploadPartImageResultDto>.FailureResponse(
                "Only JPG, PNG, and WEBP images are allowed.",
                400);
        }

        const long maxFileSize = 2 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return ApiResponse<UploadPartImageResultDto>.FailureResponse(
                "Image size must be less than 2 MB.",
                400);
        }

        return null;
    }
    
    public async Task<ApiResponse<PartSummaryDto>> GetSummaryAsync()
    {
        var partsQuery = partRepository
            .FindByCondition(p => !p.IsDeleted);

        var summary = new PartSummaryDto
        {
            TotalParts = await partsQuery.CountAsync(),

            AvailableParts = await partsQuery
                .CountAsync(p => p.Status == PartStatus.Available),

            LowStockParts = await partsQuery
                .CountAsync(p => p.StockQuantity < p.MinimumStockLevel),

            UnavailableParts = await partsQuery
                .CountAsync(p =>
                    p.Status == PartStatus.Unavailable ||
                    p.Status == PartStatus.Discontinued)
        };

        return ApiResponse<PartSummaryDto>.SuccessResponse(
            summary,
            "Parts summary retrieved successfully.");
    }
    
    public async Task<ApiResponse<List<DropdownOptionDto>>> GetVendorOptionsAsync()
    {
        var vendors = await vendorRepository
            .FindByCondition(v => v.IsActive)
            .OrderBy(v => v.VendorName)
            .Select(v => new DropdownOptionDto
            {
                Id = v.VendorId,
                Name = v.VendorName
            })
            .ToListAsync();

        return ApiResponse<List<DropdownOptionDto>>.SuccessResponse(
            vendors,
            "Vendor options retrieved successfully.");
    }

    public async Task<ApiResponse<List<StringDropdownOptionDto>>> GetCategoryOptionsAsync()
    {
        var categories = await partRepository
            .FindByCondition(p =>
                !p.IsDeleted &&
                p.Category != null &&
                p.Category != "")
            .Select(p => p.Category!)
            .Distinct()
            .OrderBy(category => category)
            .Select(category => new StringDropdownOptionDto
            {
                Value = category,
                Label = category
            })
            .ToListAsync();

        return ApiResponse<List<StringDropdownOptionDto>>.SuccessResponse(
            categories,
            "Category options retrieved successfully.");
    }

    private static PartDto MapToDto(Part part)
    {
        return new PartDto
        {
            PartId = part.PartId,
            VendorId = part.VendorId,
            VendorName = part.Vendor.VendorName,
            PartName = part.PartName,
            PartNumber = part.PartNumber,
            Category = part.Category,
            Description = part.Description,
            ImagePublicId = part.ImagePublicId,
            CostPricePerUnit = part.CostPricePerUnit,
            SellingPricePerUnit = part.SellingPricePerUnit,
            StockQuantity = part.StockQuantity,
            MinimumStockLevel = part.MinimumStockLevel,
            IsLowStock = part.StockQuantity < part.MinimumStockLevel,
            Status = part.Status,
            IsDeleted = part.IsDeleted,
            DeletedAt = part.DeletedAt,
            CreatedAt = part.CreatedAt,
            UpdatedAt = part.UpdatedAt
        };
    }
    
}
