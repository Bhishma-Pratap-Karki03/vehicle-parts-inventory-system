using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.SalesInvoices;

public class CreateSalesInvoiceDto
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;

    [Required]
    public int VehicleId { get; set; }


    [Range(0, double.MaxValue, ErrorMessage = "Paid amount cannot be negative.")]
    public decimal PaidAmount { get; set; }

    public DateTime? DueDate { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one part must be added to the sales invoice.")]
    public List<CreateSalesInvoiceItemDto> Items { get; set; } = new();
}

public class CreateSalesInvoiceItemDto
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}

public class SalesInvoiceResponseDto
{
    public int SalesInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string StaffId { get; set; } = string.Empty;

    public string StaffName { get; set; } = string.Empty;

    public int VehicleId { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public decimal SubTotal { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; }

    public DateTime? DueDate { get; set; }

    public bool HasInvoicePdf { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class SalesInvoiceDetailDto
{
    public int SalesInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public string? CustomerPhoneNumber { get; set; }

    public string StaffId { get; set; } = string.Empty;

    public string StaffName { get; set; } = string.Empty;

    public int VehicleId { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string VehicleBrand { get; set; } = string.Empty;

    public string VehicleModel { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public decimal SubTotal { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal RemainingAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; }

    public DateTime? DueDate { get; set; }

    public bool HasInvoicePdf { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<SalesInvoiceItemResponseDto> Items { get; set; } = new();
}

public class SalesInvoiceItemResponseDto
{
    public int SalesInvoiceItemId { get; set; }

    public int PartId { get; set; }

    public string PartName { get; set; } = string.Empty;

    public string PartNumber { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal PricePerUnit { get; set; }

    public decimal LineTotal { get; set; }
}

public class SalesInvoiceCustomerOptionDto
{
    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string? CustomerEmail { get; set; }

    public string? CustomerPhoneNumber { get; set; }
}

public class SalesInvoiceVehicleOptionDto
{
    public int VehicleId { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;
}

public class SalesInvoiceQueryParameters
{
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
    public int PageSize { get; set; } = 10;

    public string? SearchTerm { get; set; }

    public string? CustomerId { get; set; }

    public string? StaffId { get; set; }

    public PaymentStatus? PaymentStatus { get; set; }
}

public class SendSalesInvoiceEmailDto
{
    [EmailAddress(ErrorMessage = "Recipient email must be a valid email address.")]
    public string? ToEmail { get; set; }

    [MaxLength(500)]
    public string? Message { get; set; }
}
