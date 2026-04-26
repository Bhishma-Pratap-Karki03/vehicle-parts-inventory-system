using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.Parts;

public class PartQueryDto
{
    public string? SearchTerm { get; set; }

    public int? VendorId { get; set; }

    public string? Category { get; set; }

    public PartStatus? Status { get; set; }

    public bool? LowStockOnly { get; set; }

    public bool IncludeDeleted { get; set; } = false;

    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;
}