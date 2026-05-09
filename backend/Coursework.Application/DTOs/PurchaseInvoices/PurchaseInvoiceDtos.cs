using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.PurchaseInvoices;

public class CreatePurchaseInvoiceDto
{
    [Required]
    public int VendorId { get; set; }

    public DateTime? PurchaseDate { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one invoice item is required.")]
    public List<CreatePurchaseInvoiceItemDto> Items { get; set; } = new();
}

public class CreatePurchaseInvoiceItemDto
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Cost price must be greater than 0.")]
    public decimal CostPricePerUnit { get; set; }
}

public class PurchaseInvoiceListDto
{
    public int PurchaseInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public int VendorId { get; set; }

    public string VendorName { get; set; } = string.Empty;

    public DateTime PurchaseDate { get; set; }

    public decimal TotalAmount { get; set; }

    public PurchaseInvoiceStatus Status { get; set; }

    public string? PdfPublicId { get; set; }

    public bool IsEmailSent { get; set; }

    public DateTime? EmailSentAt { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class PurchaseInvoiceDetailDto
{
    public int PurchaseInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public int VendorId { get; set; }

    public string VendorName { get; set; } = string.Empty;

    public string VendorEmail { get; set; } = string.Empty;

    public string CreatedById { get; set; } = string.Empty;

    public string CreatedByName { get; set; } = string.Empty;

    public DateTime PurchaseDate { get; set; }

    public decimal TotalAmount { get; set; }

    public PurchaseInvoiceStatus Status { get; set; }

    public string? PdfPublicId { get; set; }

    public bool IsEmailSent { get; set; }

    public DateTime? EmailSentAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<PurchaseInvoiceItemDto> Items { get; set; } = new();
}

public class PurchaseInvoiceItemDto
{
    public int PurchaseInvoiceItemId { get; set; }

    public int PartId { get; set; }

    public string PartName { get; set; } = string.Empty;

    public string PartNumber { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal CostPricePerUnit { get; set; }

    public decimal LineTotal { get; set; }
}

public class PurchaseInvoiceQueryDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
    public int PageSize { get; set; } = 10;

    public string? SearchTerm { get; set; }
}