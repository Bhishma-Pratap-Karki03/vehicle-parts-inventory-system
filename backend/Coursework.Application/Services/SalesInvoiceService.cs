using System.Net;
using Coursework.Application.Common;
using Coursework.Application.DTOs.Cloudinary;
using Coursework.Application.DTOs.Emails;
using Coursework.Application.DTOs.SalesInvoices;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Coursework.Application.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly IPartRepository _partRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IPartTransactionRepository _partTransactionRepository;
    private readonly ISalesInvoicePdfService _salesInvoicePdfService;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<SalesInvoiceService> _logger;
    private readonly IEmailAttachmentService _emailService;

    public SalesInvoiceService(
        ISalesInvoiceRepository salesInvoiceRepository,
        IPartRepository partRepository,
        IVehicleRepository vehicleRepository,
        IPartTransactionRepository partTransactionRepository,
        ISalesInvoicePdfService salesInvoicePdfService,
        ICloudinaryService cloudinaryService,
        IEmailAttachmentService emailService,
        UserManager<ApplicationUser> userManager,
        ILogger<SalesInvoiceService> logger)
    {
        _salesInvoiceRepository = salesInvoiceRepository;
        _partRepository = partRepository;
        _vehicleRepository = vehicleRepository;
        _partTransactionRepository = partTransactionRepository;
        _salesInvoicePdfService = salesInvoicePdfService;
        _cloudinaryService = cloudinaryService;
        _emailService = emailService;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<ApiResponse<List<SalesInvoiceCustomerOptionDto>>> GetCustomerOptionsAsync()
    {
        try
        {
            var customers = await _userManager.GetUsersInRoleAsync("Customer");

            var options = customers
                .Where(customer => customer.IsActive)
                .OrderBy(customer => customer.FullName)
                .Select(customer => new SalesInvoiceCustomerOptionDto
                {
                    CustomerId = customer.Id,
                    CustomerName = customer.FullName,
                    CustomerEmail = customer.Email,
                    CustomerPhoneNumber = customer.PhoneNumber
                })
                .ToList();

            return ApiResponse<List<SalesInvoiceCustomerOptionDto>>.SuccessResponse(
                options,
                "Customer options retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving customer options for sales invoices.");

            return ApiResponse<List<SalesInvoiceCustomerOptionDto>>.ServerErrorResponse(
                "An error occurred while retrieving customer options.");
        }
    }

    public async Task<ApiResponse<List<SalesInvoiceVehicleOptionDto>>> GetCustomerVehicleOptionsAsync(
        string customerId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customerId))
            {
                return ApiResponse<List<SalesInvoiceVehicleOptionDto>>.FailureResponse(
                    "Customer id is required.");
            }

            var customerExists = await _userManager.Users
                .AnyAsync(user => user.Id == customerId && user.IsActive);

            if (!customerExists)
            {
                return ApiResponse<List<SalesInvoiceVehicleOptionDto>>.NotFoundResponse(
                    "Customer was not found or is inactive.");
            }

            var vehicles = await _vehicleRepository.GetCustomerVehiclesAsync(
                customerId,
                trackChanges: false);

            var options = vehicles
                .Select(vehicle => new SalesInvoiceVehicleOptionDto
                {
                    VehicleId = vehicle.VehicleId,
                    VehicleNumber = vehicle.VehicleNumber,
                    Brand = vehicle.Brand,
                    Model = vehicle.Model
                })
                .ToList();

            return ApiResponse<List<SalesInvoiceVehicleOptionDto>>.SuccessResponse(
                options,
                "Customer vehicle options retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while retrieving vehicle options for customer {CustomerId}.",
                customerId);

            return ApiResponse<List<SalesInvoiceVehicleOptionDto>>.ServerErrorResponse(
                "An error occurred while retrieving customer vehicle options.");
        }
    }

    public async Task<ApiResponse<SalesInvoiceDetailDto>> CreateSalesInvoiceAsync(
    CreateSalesInvoiceDto dto,
    string staffId)
    {
        try
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                return ApiResponse<SalesInvoiceDetailDto>.FailureResponse(
                    "At least one part must be added to the sales invoice.");
            }

            if (dto.Items.Any(i => i.Quantity <= 0))
            {
                return ApiResponse<SalesInvoiceDetailDto>.FailureResponse(
                    "Each selected part must have a quantity greater than zero.");
            }

            var staff = await _userManager.FindByIdAsync(staffId);

            if (staff == null || !staff.IsActive)
            {
                return ApiResponse<SalesInvoiceDetailDto>.NotFoundResponse(
                    "Staff user was not found or is inactive.");
            }

            var customer = await _userManager.FindByIdAsync(dto.CustomerId);

            if (customer == null || !customer.IsActive)
            {
                return ApiResponse<SalesInvoiceDetailDto>.NotFoundResponse(
                    "Customer was not found or is inactive.");
            }

            var vehicle = await _vehicleRepository.GetCustomerVehicleAsync(
                dto.VehicleId,
                dto.CustomerId,
                trackChanges: false);

            if (vehicle == null)
            {
                return ApiResponse<SalesInvoiceDetailDto>.FailureResponse(
                    "Selected vehicle does not belong to the selected customer.");
            }

            var partQuantityMap = BuildPartQuantityMap(dto.Items);
            var partIds = partQuantityMap.Keys.ToList();

            var parts = await _partRepository
                .FindByCondition(
                    p => partIds.Contains(p.PartId),
                    trackChanges: true)
                .ToListAsync();

            if (parts.Count != partIds.Count)
            {
                return ApiResponse<SalesInvoiceDetailDto>.NotFoundResponse(
                    "One or more selected parts were not found.");
            }

            foreach (var part in parts)
            {
                var requestedQuantity = partQuantityMap[part.PartId];

                if (part.IsDeleted || !part.IsActive)
                {
                    return ApiResponse<SalesInvoiceDetailDto>.ConflictResponse(
                        $"Part '{part.PartName}' is not active.");
                }

                if (part.Status != PartStatus.Available)
                {
                    return ApiResponse<SalesInvoiceDetailDto>.ConflictResponse(
                        $"Part '{part.PartName}' is not available for sale.");
                }

                if (part.StockQuantity < requestedQuantity)
                {
                    return ApiResponse<SalesInvoiceDetailDto>.ConflictResponse(
                        $"Insufficient stock for part '{part.PartName}'. Available stock: {part.StockQuantity}.");
                }
            }

            var subTotal = parts.Sum(part =>
            {
                var quantity = partQuantityMap[part.PartId];
                return part.SellingPricePerUnit * quantity;
            });

            if (dto.DiscountAmount > subTotal)
            {
                return ApiResponse<SalesInvoiceDetailDto>.FailureResponse(
                    "Discount amount cannot be greater than subtotal.");
            }

            var finalAmount = subTotal - dto.DiscountAmount;

            if (!IsPaidAmountValid(finalAmount, dto.PaidAmount))
            {
                return ApiResponse<SalesInvoiceDetailDto>.FailureResponse(
                    "Paid amount cannot be negative or greater than final amount.");
            }

            var paymentStatus = CalculatePaymentStatus(finalAmount, dto.PaidAmount);
            var invoiceNumber = GenerateInvoiceNumber();

            var salesInvoice = new SalesInvoice
            {
                InvoiceNumber = invoiceNumber,
                CustomerId = dto.CustomerId,
                StaffId = staffId,
                VehicleId = dto.VehicleId,
                InvoiceDate = DateTime.UtcNow,
                SubTotal = subTotal,
                DiscountAmount = dto.DiscountAmount,
                FinalAmount = finalAmount,
                PaidAmount = dto.PaidAmount,
                PaymentStatus = paymentStatus,
                DueDate = dto.DueDate,
                CreatedAt = DateTime.UtcNow
            };

            var itemPairs = new List<(SalesInvoiceItem InvoiceItem, Part Part)>();

            foreach (var part in parts)
            {
                var quantity = partQuantityMap[part.PartId];
                var stockBefore = part.StockQuantity;
                var stockAfter = stockBefore - quantity;
                var lineTotal = part.SellingPricePerUnit * quantity;

                var invoiceItem = new SalesInvoiceItem
                {
                    PartId = part.PartId,
                    Quantity = quantity,
                    PricePerUnit = part.SellingPricePerUnit,
                    LineTotal = lineTotal
                };

                salesInvoice.Items.Add(invoiceItem);
                itemPairs.Add((invoiceItem, part));

                part.StockQuantity = stockAfter;
                part.UpdatedAt = DateTime.UtcNow;

                var partTransaction = new PartTransaction
                {
                    PartId = part.PartId,
                    TransactionType = PartTransactionType.Sale,
                    QuantityChanged = -quantity,
                    StockBefore = stockBefore,
                    StockAfter = stockAfter,
                    CostPricePerUnit = null,
                    SalesInvoice = salesInvoice,
                    SalesInvoiceItem = invoiceItem,
                    Remarks = $"Sold through sales invoice {invoiceNumber}",
                    CreatedById = staffId,
                    CreatedAt = DateTime.UtcNow
                };

                salesInvoice.PartTransactions.Add(partTransaction);
            }

            var detailDtoForPdf = new SalesInvoiceDetailDto
            {
                SalesInvoiceId = 0,
                InvoiceNumber = salesInvoice.InvoiceNumber,
                CustomerId = salesInvoice.CustomerId,
                CustomerName = customer.FullName,
                CustomerEmail = customer.Email ?? string.Empty,
                CustomerPhoneNumber = customer.PhoneNumber,
                StaffId = salesInvoice.StaffId,
                StaffName = staff.FullName,
                VehicleId = salesInvoice.VehicleId,
                VehicleNumber = vehicle.VehicleNumber,
                VehicleBrand = vehicle.Brand,
                VehicleModel = vehicle.Model,
                InvoiceDate = salesInvoice.InvoiceDate,
                SubTotal = salesInvoice.SubTotal,
                DiscountAmount = salesInvoice.DiscountAmount,
                FinalAmount = salesInvoice.FinalAmount,
                PaidAmount = salesInvoice.PaidAmount,
                RemainingAmount = salesInvoice.FinalAmount - salesInvoice.PaidAmount,
                PaymentStatus = salesInvoice.PaymentStatus,
                DueDate = salesInvoice.DueDate,
                HasInvoicePdf = false,
                CreatedAt = salesInvoice.CreatedAt,
                Items = itemPairs.Select(pair => new SalesInvoiceItemResponseDto
                {
                    SalesInvoiceItemId = 0,
                    PartId = pair.Part.PartId,
                    PartName = pair.Part.PartName,
                    PartNumber = pair.Part.PartNumber,
                    Quantity = pair.InvoiceItem.Quantity,
                    PricePerUnit = pair.InvoiceItem.PricePerUnit,
                    LineTotal = pair.InvoiceItem.LineTotal
                }).ToList()
            };

            var pdfBytes = _salesInvoicePdfService.GenerateSalesInvoicePdf(detailDtoForPdf);

            var pdfFile = new FileUploadDto
            {
                FileName = $"{salesInvoice.InvoiceNumber}.pdf",
                Content = new MemoryStream(pdfBytes),
                Length = pdfBytes.Length
            };

            var uploadResult = await _cloudinaryService.UploadPdfAsync(
                pdfFile,
                salesInvoice.InvoiceNumber,
                "sales-invoices");

            salesInvoice.InvoicePdfPublicId = uploadResult.PublicId;

            _salesInvoiceRepository.Create(salesInvoice);

            await _salesInvoiceRepository.SaveChangesAsync();

            var createdInvoice = await _salesInvoiceRepository.GetSalesInvoiceDetailsAsync(
                salesInvoice.SalesInvoiceId,
                trackChanges: false);

            if (createdInvoice == null)
            {
                return ApiResponse<SalesInvoiceDetailDto>.ServerErrorResponse(
                    "Sales invoice was created but could not be loaded.");
            }

            var response = MapToDetailDto(createdInvoice);

            return ApiResponse<SalesInvoiceDetailDto>.CreatedResponse(
                response,
                "Sales invoice created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while creating sales invoice for customer {CustomerId}.",
                dto.CustomerId);

            return ApiResponse<SalesInvoiceDetailDto>.ServerErrorResponse(
                "An error occurred while creating the sales invoice.");
        }
    }

    public async Task<ApiResponse<PagedResult<SalesInvoiceResponseDto>>> GetSalesInvoicesAsync(
    SalesInvoiceQueryParameters queryParameters)
    {
        try
        {
            if (queryParameters.PageNumber < 1)
            {
                return ApiResponse<PagedResult<SalesInvoiceResponseDto>>.FailureResponse(
                    "Page number must be at least 1.");
            }

            if (queryParameters.PageSize < 1 || queryParameters.PageSize > 100)
            {
                return ApiResponse<PagedResult<SalesInvoiceResponseDto>>.FailureResponse(
                    "Page size must be between 1 and 100.");
            }

            var query = _salesInvoiceRepository
                .FindAll(trackChanges: false)
                .Include(s => s.Customer)
                .Include(s => s.Staff)
                .Include(s => s.Vehicle)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryParameters.CustomerId))
            {
                query = query.Where(s => s.CustomerId == queryParameters.CustomerId);
            }

            if (!string.IsNullOrWhiteSpace(queryParameters.StaffId))
            {
                query = query.Where(s => s.StaffId == queryParameters.StaffId);
            }

            if (queryParameters.PaymentStatus.HasValue)
            {
                query = query.Where(s => s.PaymentStatus == queryParameters.PaymentStatus.Value);
            }

            if (!string.IsNullOrWhiteSpace(queryParameters.SearchTerm))
            {
                var searchTerm = queryParameters.SearchTerm.Trim().ToLower();

                query = query.Where(s =>
                    s.InvoiceNumber.ToLower().Contains(searchTerm) ||
                    s.Customer.FullName.ToLower().Contains(searchTerm) ||
                    s.Vehicle.VehicleNumber.ToLower().Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var invoices = await query
                .OrderByDescending(s => s.InvoiceDate)
                .ThenByDescending(s => s.SalesInvoiceId)
                .Skip((queryParameters.PageNumber - 1) * queryParameters.PageSize)
                .Take(queryParameters.PageSize)
                .ToListAsync();

            var invoiceDto = invoices
                .Select(MapToResponseDto)
                .ToList();

            var pagedResult = PagedResult<SalesInvoiceResponseDto>.Create(
                invoiceDto,
                queryParameters.PageNumber,
                queryParameters.PageSize,
                totalCount);

            return ApiResponse<PagedResult<SalesInvoiceResponseDto>>.SuccessResponse(
                pagedResult,
                "Sales invoices retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while retrieving sales invoices.");

            return ApiResponse<PagedResult<SalesInvoiceResponseDto>>.ServerErrorResponse(
                "An error occurred while retrieving sales invoices.");
        }
    }

    public async Task<ApiResponse<SalesInvoiceDetailDto>> GetSalesInvoiceByIdAsync(
        int salesInvoiceId)
    {
        try
        {
            if (salesInvoiceId <= 0)
            {
                return ApiResponse<SalesInvoiceDetailDto>.FailureResponse(
                    "Invalid sales invoice id.");
            }

            var invoice = await _salesInvoiceRepository.GetSalesInvoiceDetailsAsync(
                salesInvoiceId,
                trackChanges: false);

            if (invoice == null)
            {
                return ApiResponse<SalesInvoiceDetailDto>.NotFoundResponse(
                    "Sales invoice was not found.");
            }

            var response = MapToDetailDto(invoice);

            return ApiResponse<SalesInvoiceDetailDto>.SuccessResponse(
                response,
                "Sales invoice retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while retrieving sales invoice with id {SalesInvoiceId}.",
                salesInvoiceId);

            return ApiResponse<SalesInvoiceDetailDto>.ServerErrorResponse(
                "An error occurred while retrieving the sales invoice.");
        }
    }
    public async Task<ApiResponse<string>> GetSalesInvoicePdfDownloadUrlAsync(
        int salesInvoiceId)
    {
        try
        {
            if (salesInvoiceId <= 0)
            {
                return ApiResponse<string>.FailureResponse(
                    "Invalid sales invoice id.");
            }

            var invoice = await _salesInvoiceRepository.GetByIdAsync(salesInvoiceId);

            if (invoice == null)
            {
                return ApiResponse<string>.NotFoundResponse(
                    "Sales invoice was not found.");
            }

            if (string.IsNullOrWhiteSpace(invoice.InvoicePdfPublicId))
            {
                return ApiResponse<string>.NotFoundResponse(
                    "Sales invoice PDF was not found.");
            }

            var pdfUrl = _cloudinaryService.GetPdfUrl(invoice.InvoicePdfPublicId);

            return ApiResponse<string>.SuccessResponse(
                pdfUrl,
                "Sales invoice PDF download URL generated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while generating PDF download URL for sales invoice with id {SalesInvoiceId}.",
                salesInvoiceId);

            return ApiResponse<string>.ServerErrorResponse(
                "An error occurred while generating the sales invoice PDF download URL.");
        }
    }
    
    private static string GenerateInvoiceNumber()
    {
        return $"SINV-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
    }
    
    private static PaymentStatus CalculatePaymentStatus(decimal finalAmount, decimal paidAmount)
    {
        if (paidAmount <= 0)
        {
            return PaymentStatus.Unpaid;
        }

        if (paidAmount >= finalAmount)
        {
            return PaymentStatus.Paid;
        }

        return PaymentStatus.PartiallyPaid;
    }
    
    private static Dictionary<int, int> BuildPartQuantityMap(List<CreateSalesInvoiceItemDto> items)
    {
        return items
            .GroupBy(i => i.PartId)
            .ToDictionary(
                group => group.Key,
                group => group.Sum(i => i.Quantity));
    }
    
    private static bool IsPaidAmountValid(decimal finalAmount, decimal paidAmount)
    {
        return paidAmount >= 0 && paidAmount <= finalAmount;
    }
    
    public async Task<ApiResponse<string>> SendSalesInvoiceEmailAsync(
    int salesInvoiceId,
    SendSalesInvoiceEmailDto dto)
{
    try
    {
        if (salesInvoiceId <= 0)
        {
            return ApiResponse<string>.FailureResponse(
                "Invalid sales invoice id.");
        }

        var invoice = await _salesInvoiceRepository.GetSalesInvoiceDetailsAsync(
            salesInvoiceId,
            trackChanges: false);

        if (invoice == null)
        {
            return ApiResponse<string>.NotFoundResponse(
                "Sales invoice was not found.");
        }

        var recipientEmail = string.IsNullOrWhiteSpace(dto.ToEmail)
            ? invoice.Customer.Email
            : dto.ToEmail.Trim();

        if (string.IsNullOrWhiteSpace(recipientEmail))
        {
            return ApiResponse<string>.FailureResponse(
                "Recipient email is required. Customer email is not available.");
        }

        var invoiceDto = MapToDetailDto(invoice);

        var pdfBytes = _salesInvoicePdfService.GenerateSalesInvoicePdf(invoiceDto);

        var attachment = new EmailAttachmentDto
        {
            FileName = $"{invoice.InvoiceNumber}.pdf",
            ContentType = "application/pdf",
            Content = pdfBytes
        };

        var customMessage = string.IsNullOrWhiteSpace(dto.Message)
            ? "Please find your sales invoice attached."
            : dto.Message.Trim();

        var encodedCustomerName = WebUtility.HtmlEncode(invoice.Customer.FullName);
        var encodedMessage = WebUtility.HtmlEncode(customMessage);

        var subject = $"Sales Invoice {invoice.InvoiceNumber} - AutoCare IMS";

        var plainTextContent =
            $"Dear {invoice.Customer.FullName},\n\n" +
            $"{customMessage}\n\n" +
            $"Invoice Number: {invoice.InvoiceNumber}\n" +
            $"Invoice Date: {invoice.InvoiceDate:yyyy-MM-dd}\n" +
            $"Final Amount: {invoice.FinalAmount:N2}\n" +
            $"Paid Amount: {invoice.PaidAmount:N2}\n" +
            $"Payment Status: {invoice.PaymentStatus}\n\n" +
            "Regards,\n" +
            "AutoCare IMS";

        var htmlContent = $@"
            <p>Dear {encodedCustomerName},</p>

            <p>{encodedMessage}</p>

            <table style='border-collapse: collapse;'>
                <tr>
                    <td><strong>Invoice Number:</strong></td>
                    <td>{invoice.InvoiceNumber}</td>
                </tr>
                <tr>
                    <td><strong>Invoice Date:</strong></td>
                    <td>{invoice.InvoiceDate:yyyy-MM-dd}</td>
                </tr>
                <tr>
                    <td><strong>Final Amount:</strong></td>
                    <td>{invoice.FinalAmount:N2}</td>
                </tr>
                <tr>
                    <td><strong>Paid Amount:</strong></td>
                    <td>{invoice.PaidAmount:N2}</td>
                </tr>
                <tr>
                    <td><strong>Payment Status:</strong></td>
                    <td>{invoice.PaymentStatus}</td>
                </tr>
            </table>

            <p>The sales invoice PDF is attached with this email.</p>

            <p>Regards,<br/>AutoCare IMS</p>";

        await _emailService.SendEmailWithAttachmentAsync(
            recipientEmail,
            subject,
            plainTextContent,
            htmlContent,
            attachment);

        return ApiResponse<string>.SuccessResponse(
            recipientEmail,
            "Sales invoice email sent successfully.");
    }
    catch (Exception ex)
    {
        _logger.LogError(
            ex,
            "Error occurred while sending sales invoice email for invoice id {SalesInvoiceId}.",
            salesInvoiceId);

        return ApiResponse<string>.ServerErrorResponse(
            "An error occurred while sending the sales invoice email.");
    }
}

    private static SalesInvoiceResponseDto MapToResponseDto(SalesInvoice invoice)
    {
        return new SalesInvoiceResponseDto
        {
            SalesInvoiceId = invoice.SalesInvoiceId,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer?.FullName ?? "Unknown Customer",
            StaffId = invoice.StaffId,
            StaffName = invoice.Staff?.FullName ?? "Unknown Staff",
            VehicleId = invoice.VehicleId,
            VehicleNumber = invoice.Vehicle?.VehicleNumber ?? "Unknown Vehicle",
            InvoiceDate = invoice.InvoiceDate,
            SubTotal = invoice.SubTotal,
            DiscountAmount = invoice.DiscountAmount,
            FinalAmount = invoice.FinalAmount,
            PaidAmount = invoice.PaidAmount,
            PaymentStatus = invoice.PaymentStatus,
            DueDate = invoice.DueDate,
            HasInvoicePdf = !string.IsNullOrWhiteSpace(invoice.InvoicePdfPublicId),
            CreatedAt = invoice.CreatedAt
        };
    }

    private static SalesInvoiceDetailDto MapToDetailDto(SalesInvoice invoice)
    {
        return new SalesInvoiceDetailDto
        {
            SalesInvoiceId = invoice.SalesInvoiceId,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer?.FullName ?? "Unknown Customer",
            CustomerEmail = invoice.Customer?.Email ?? string.Empty,
            CustomerPhoneNumber = invoice.Customer?.PhoneNumber,
            StaffId = invoice.StaffId,
            StaffName = invoice.Staff?.FullName ?? "Unknown Staff",
            VehicleId = invoice.VehicleId,
            VehicleNumber = invoice.Vehicle?.VehicleNumber ?? "Unknown Vehicle",
            VehicleBrand = invoice.Vehicle?.Brand ?? string.Empty,
            VehicleModel = invoice.Vehicle?.Model ?? string.Empty,
            InvoiceDate = invoice.InvoiceDate,
            SubTotal = invoice.SubTotal,
            DiscountAmount = invoice.DiscountAmount,
            FinalAmount = invoice.FinalAmount,
            PaidAmount = invoice.PaidAmount,
            RemainingAmount = invoice.FinalAmount - invoice.PaidAmount,
            PaymentStatus = invoice.PaymentStatus,
            DueDate = invoice.DueDate,
            HasInvoicePdf = !string.IsNullOrWhiteSpace(invoice.InvoicePdfPublicId),
            CreatedAt = invoice.CreatedAt,
            Items = invoice.Items.Select(item => new SalesInvoiceItemResponseDto
            {
                SalesInvoiceItemId = item.SalesInvoiceItemId,
                PartId = item.PartId,
                PartName = item.Part?.PartName ?? "Unknown Part",
                PartNumber = item.Part?.PartNumber ?? string.Empty,
                Quantity = item.Quantity,
                PricePerUnit = item.PricePerUnit,
                LineTotal = item.LineTotal
            }).ToList()
        };
    }
}
