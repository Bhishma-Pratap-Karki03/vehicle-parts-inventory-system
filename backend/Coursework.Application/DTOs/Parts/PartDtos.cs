using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.Parts;

public class CreatePartDto
{
    [Required(ErrorMessage = "Vendor is required.")]
    public int VendorId { get; set; }

    [Required(ErrorMessage = "Part name is required.")]
    [MaxLength(100, ErrorMessage = "Part name cannot exceed 100 characters.")]
    public string PartName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Part number is required.")]
    [MaxLength(100, ErrorMessage = "Part number cannot exceed 100 characters.")]
    public string PartNumber { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "Category cannot exceed 100 characters.")]
    public string? Category { get; set; }

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Cost price must be greater than 0.")]
    public decimal CostPricePerUnit { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Selling price must be greater than 0.")]
    public decimal SellingPricePerUnit { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Minimum stock level must be greater than 0.")]
    public int MinimumStockLevel { get; set; } = 10;

    public PartStatus Status { get; set; } = PartStatus.Available;
}

public class UpdatePartDto
{
    [Required(ErrorMessage = "Part name is required.")]
    [MaxLength(100, ErrorMessage = "Part name cannot exceed 100 characters.")]
    public string PartName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Part number is required.")]
    [MaxLength(100, ErrorMessage = "Part number cannot exceed 100 characters.")]
    public string PartNumber { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "Category cannot exceed 100 characters.")]
    public string? Category { get; set; }

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Vendor is required.")]
    public int VendorId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Minimum stock level must be greater than 0.")]
    public int MinimumStockLevel { get; set; } = 10;

    [Range(0.01, double.MaxValue, ErrorMessage = "Cost price must be greater than 0.")]
    public decimal CostPricePerUnit { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Selling price must be greater than 0.")]
    public decimal SellingPricePerUnit { get; set; }

    [Required(ErrorMessage = "Part status is required.")]
    public PartStatus Status { get; set; }
}

public class PartDto
{
    public int PartId { get; set; }

    public int VendorId { get; set; }

    public string VendorName { get; set; } = string.Empty;

    public string PartName { get; set; } = string.Empty;

    public string PartNumber { get; set; } = string.Empty;

    public string? Category { get; set; }

    public string? Description { get; set; }

    public string? ImagePublicId { get; set; }

    public decimal CostPricePerUnit { get; set; }

    public decimal SellingPricePerUnit { get; set; }

    public int StockQuantity { get; set; }

    public int MinimumStockLevel { get; set; }

    public bool IsLowStock { get; set; }

    public PartStatus Status { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public class PartQueryDto
{
    public string? SearchTerm { get; set; }

    public int? VendorId { get; set; }

    public string? Category { get; set; }

    public PartStatus? Status { get; set; }

    public bool? LowStockOnly { get; set; }

    public bool IncludeDeleted { get; set; } = false;

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
    public int PageSize { get; set; } = 10;
}

public class PartSummaryDto
{
    public int TotalParts { get; set; }

    public int AvailableParts { get; set; }

    public int LowStockParts { get; set; }

    public int UnavailableParts { get; set; }
}

public class DeletePartResultDto
{
    public int PartId { get; set; }

    public DateTime DeletedAt { get; set; }
}

public class UploadPartImageResultDto
{
    public int PartId { get; set; }

    public string ImagePublicId { get; set; } = string.Empty;
}