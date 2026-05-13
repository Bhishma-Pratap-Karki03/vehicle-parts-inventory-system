using System.ComponentModel.DataAnnotations;
using Coursework.Domain.Enums;

namespace Coursework.Application.DTOs.Customers;

public class CustomerProfileDto
{
    public string CustomerId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Address { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public class UpdateCustomerProfileDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Phone]
    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }
}

public class CustomerVehicleDto
{
    public int VehicleId { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public int Mileage { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public class CreateCustomerVehicleDto
{
    [Required]
    [MaxLength(50)]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2100)]
    public int Year { get; set; }

    [Range(0, int.MaxValue)]
    public int Mileage { get; set; }
}

public class UpdateCustomerVehicleDto : CreateCustomerVehicleDto
{
}

public class CustomerPurchaseHistoryItemDto
{
    public int SalesInvoiceId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string VehicleBrandModel { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal RemainingAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; }

    public DateTime? DueDate { get; set; }

    public int ItemCount { get; set; }

    public List<CustomerPurchaseHistoryLineDto> Items { get; set; } = new();
}

public class CustomerPurchaseHistoryLineDto
{
    public string PartName { get; set; } = string.Empty;

    public string PartNumber { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal PricePerUnit { get; set; }

    public decimal LineTotal { get; set; }
}

public class CustomerServiceHistoryItemDto
{
    public int ServiceRecordId { get; set; }

    public DateTime ServiceDate { get; set; }

    public string VehicleNumber { get; set; } = string.Empty;

    public string VehicleBrandModel { get; set; } = string.Empty;

    public string ServiceDescription { get; set; } = string.Empty;

    public string? PartsChangedOrSuggested { get; set; }

    public decimal LaborCost { get; set; }

    public ServiceStatus Status { get; set; }

    public string StaffName { get; set; } = string.Empty;
}

public class CustomerHistorySummaryDto
{
    public int TotalPurchases { get; set; }

    public decimal TotalSpent { get; set; }

    public decimal OutstandingBalance { get; set; }

    public int TotalServices { get; set; }

    public int VehicleCount { get; set; }
}

public class RegularCustomerReportDto
{
    public string CustomerId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public int PurchaseCount { get; set; }

    public decimal TotalSpent { get; set; }

    public DateTime? LastPurchaseDate { get; set; }
}

public class HighSpenderReportDto
{
    public string CustomerId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public decimal TotalSpent { get; set; }

    public int PurchaseCount { get; set; }

    public DateTime? LastPurchaseDate { get; set; }
}

public class PendingCreditReportDto
{
    public string CustomerId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public decimal OutstandingBalance { get; set; }

    public int UnpaidInvoiceCount { get; set; }

    public int OverdueInvoiceCount { get; set; }

    public DateTime? OldestUnpaidInvoiceDate { get; set; }
}
