using Coursework.Application.Common;
using Coursework.Application.DTOs.Parts;
using Coursework.Application.Interfaces;
using Coursework.Application.DTOs.Cloudinary;
using Coursework.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace Coursework.Application.Services;

public class PartService(
    IPartRepository partRepository,
    IVendorRepository vendorRepository,
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

        if (dto.SellingPricePerUnit <= dto.CostPricePerUnit)
        {
            return ApiResponse<PartDto>.FailureResponse(
                "Selling price must be greater than cost price.",
                400);
        }

        var part = new Part
        {
            VendorId = dto.VendorId,
            PartName = dto.PartName.Trim(),
            PartNumber = dto.PartNumber.Trim(),
            Category = dto.Category?.Trim(),
            Description = dto.Description?.Trim(),
            CostPricePerUnit = dto.CostPricePerUnit,
            SellingPricePerUnit = dto.SellingPricePerUnit,
            StockQuantity = dto.StockQuantity,
            MinimumStockLevel = dto.MinimumStockLevel,
            Status = dto.Status,
            IsDeleted = false,
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

        if (dto.SellingPricePerUnit <= dto.CostPricePerUnit)
        {
            return ApiResponse<PartDto>.FailureResponse(
                "Selling price must be greater than cost price.",
                400);
        }

        part.VendorId = dto.VendorId;
        part.PartName = dto.PartName.Trim();
        part.PartNumber = dto.PartNumber.Trim();
        part.Category = dto.Category?.Trim();
        part.Description = dto.Description?.Trim();
        part.CostPricePerUnit = dto.CostPricePerUnit;
        part.SellingPricePerUnit = dto.SellingPricePerUnit;
        part.StockQuantity = dto.StockQuantity;
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

        if (!string.IsNullOrWhiteSpace(part.ImagePublicId))
        {
            await cloudinaryService.DeleteImageAsync(part.ImagePublicId);
        }

        var publicId = $"part-{part.PartId}";
        const string folder = "autocareims/parts";

        var uploadResult = await cloudinaryService.UploadImageAsync(
            file,
            publicId,
            folder);

        part.ImageUrl = uploadResult.ImageUrl;
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
                ImageUrl = part.ImageUrl,
                ImagePublicId = part.ImagePublicId
            },
            "Part image uploaded successfully.");
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

        part.ImageUrl = null;
        part.ImagePublicId = null;
        part.UpdatedAt = DateTime.UtcNow;

        await partRepository.SaveChangesAsync();

        logger.LogInformation("Part image deleted successfully. PartId: {PartId}", part.PartId);

        return ApiResponse<string>.SuccessResponse(
            $"Image deleted for PartId: {part.PartId}",
            "Part image deleted successfully.");
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
            ImageUrl = part.ImageUrl,
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