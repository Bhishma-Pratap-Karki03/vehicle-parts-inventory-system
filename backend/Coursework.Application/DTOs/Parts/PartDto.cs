using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.Parts;

public class PartDto
{
    public int PartId { get; set; }

    public int VendorId { get; set; }

    public string VendorName { get; set; } = string.Empty;

    public string PartName { get; set; } = string.Empty;

    public string PartNumber { get; set; } = string.Empty;

    public string? Category { get; set; }

    public string? Description { get; set; }
    
    public string? ImageUrl { get; set; }

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