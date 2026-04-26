using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.Parts;

public class UpdatePartDto
{
    [Required]
    public int VendorId { get; set; }

    [Required]
    [MaxLength(100)]
    public string PartName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string PartNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal CostPricePerUnit { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal SellingPricePerUnit { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Range(1, int.MaxValue)]
    public int MinimumStockLevel { get; set; } = 10;

    public PartStatus Status { get; set; } = PartStatus.Available;
}