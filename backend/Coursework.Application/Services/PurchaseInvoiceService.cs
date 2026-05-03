using Coursework.Application.Common;
using Coursework.Application.DTOs.Cloudinary;
using Coursework.Application.DTOs.PurchaseInvoices;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Coursework.Application.DTOs.Emails;

namespace Coursework.Application.Services;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private const string InvoicePdfFolder = "purchase-invoices";

    private readonly IPurchaseInvoiceRepository _purchaseInvoiceRepository;
    private readonly IInvoicePdfService _invoicePdfService;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly IEmailService _emailService;

    public PurchaseInvoiceService(
        IPurchaseInvoiceRepository purchaseInvoiceRepository,
        IInvoicePdfService invoicePdfService,
        ICloudinaryService cloudinaryService,
        IEmailService emailService)
    {
        _purchaseInvoiceRepository = purchaseInvoiceRepository;
        _invoicePdfService = invoicePdfService;
        _cloudinaryService = cloudinaryService;
        _emailService = emailService;
    }

    public async Task<ApiResponse<PurchaseInvoiceDetailDto>> CreatePurchaseInvoiceAsync(
        CreatePurchaseInvoiceDto dto,
        string createdById)
    {
        if (dto.Items.Count == 0)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.FailureResponse(
                "At least one invoice item is required.");
        }

        if (dto.Items.Select(i => i.PartId).Distinct().Count() != dto.Items.Count)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.FailureResponse(
                "Duplicate parts are not allowed in the same purchase invoice.");
        }

        var vendor = await _purchaseInvoiceRepository.GetVendorByIdAsync(dto.VendorId);

        if (vendor is null)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.NotFoundResponse("Vendor not found.");
        }

        var partIds = dto.Items.Select(i => i.PartId).ToList();
        var parts = await _purchaseInvoiceRepository.GetPartsByIdsAsync(partIds);

        if (parts.Count != partIds.Count)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.FailureResponse(
                "One or more selected parts were not found.");
        }

        var invalidVendorParts = parts
            .Where(p => p.VendorId != dto.VendorId)
            .Select(p => p.PartName)
            .ToList();

        if (invalidVendorParts.Count > 0)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.FailureResponse(
                "All selected parts must belong to the selected vendor.",
                errors: invalidVendorParts);
        }

        PurchaseInvoice? createdInvoice = null;

        await _purchaseInvoiceRepository.ExecuteInTransactionAsync(async () =>
        {
            var invoiceNumber = await GenerateInvoiceNumberAsync();

            var purchaseInvoice = new PurchaseInvoice
            {
                VendorId = dto.VendorId,
                CreatedById = createdById,
                InvoiceNumber = invoiceNumber,
                PurchaseDate = dto.PurchaseDate ?? DateTime.UtcNow,
                Status = PurchaseInvoiceStatus.Completed,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var itemDto in dto.Items)
            {
                var lineTotal = itemDto.Quantity * itemDto.CostPricePerUnit;

                purchaseInvoice.Items.Add(new PurchaseInvoiceItem
                {
                    PartId = itemDto.PartId,
                    Quantity = itemDto.Quantity,
                    CostPricePerUnit = itemDto.CostPricePerUnit,
                    LineTotal = lineTotal
                });

                purchaseInvoice.TotalAmount += lineTotal;
            }

            _purchaseInvoiceRepository.Create(purchaseInvoice);
            await _purchaseInvoiceRepository.SaveChangesAsync();

            var transactions = new List<PartTransaction>();

            foreach (var invoiceItem in purchaseInvoice.Items)
            {
                var part = parts.First(p => p.PartId == invoiceItem.PartId);

                var stockBefore = part.StockQuantity;
                var stockAfter = stockBefore + invoiceItem.Quantity;

                part.StockQuantity = stockAfter;

                part.CostPricePerUnit = invoiceItem.CostPricePerUnit;
                transactions.Add(new PartTransaction
                {
                    PartId = part.PartId,
                    PurchaseInvoiceId = purchaseInvoice.PurchaseInvoiceId,
                    PurchaseInvoiceItemId = invoiceItem.PurchaseInvoiceItemId,
                    TransactionType = PartTransactionType.Purchase,
                    QuantityChanged = invoiceItem.Quantity,
                    StockBefore = stockBefore,
                    StockAfter = stockAfter,
                    CostPricePerUnit = invoiceItem.CostPricePerUnit,
                    Remarks = $"Stock added through purchase invoice {purchaseInvoice.InvoiceNumber}.",
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow
                });
            }

            _purchaseInvoiceRepository.AddPartTransactions(transactions);
            await _purchaseInvoiceRepository.SaveChangesAsync();

            createdInvoice = await _purchaseInvoiceRepository.GetPurchaseInvoiceByIdWithDetailsAsync(
                purchaseInvoice.PurchaseInvoiceId,
                trackChanges: true);

            if (createdInvoice is null)
            {
                throw new InvalidOperationException("Created purchase invoice could not be loaded.");
            }

            var invoiceDto = MapToDetailDto(createdInvoice);

            var pdfBytes = _invoicePdfService.GeneratePurchaseInvoicePdf(invoiceDto);

            await using var stream = new MemoryStream(pdfBytes);

            var fileUploadDto = new FileUploadDto
            {
                Content = stream,
                FileName = $"{createdInvoice.InvoiceNumber}.pdf",
                ContentType = "application/pdf",
                Length = pdfBytes.Length
            };

            var uploadResult = await _cloudinaryService.UploadPdfAsync(
                fileUploadDto,
                createdInvoice.InvoiceNumber,
                InvoicePdfFolder);

            createdInvoice.PdfPublicId = uploadResult.PublicId;

            await _purchaseInvoiceRepository.SaveChangesAsync();
        });

        if (createdInvoice is null)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.ServerErrorResponse(
                "Purchase invoice could not be created.");
        }

        var result = MapToDetailDto(createdInvoice);

        return ApiResponse<PurchaseInvoiceDetailDto>.CreatedResponse(
            result,
            "Purchase invoice created successfully.");
    }

    public async Task<ApiResponse<PurchaseInvoiceDetailDto>> GetPurchaseInvoiceByIdAsync(
        int purchaseInvoiceId)
    {
        var invoice = await _purchaseInvoiceRepository.GetPurchaseInvoiceByIdWithDetailsAsync(
            purchaseInvoiceId);

        if (invoice is null)
        {
            return ApiResponse<PurchaseInvoiceDetailDto>.NotFoundResponse(
                "Purchase invoice not found.");
        }

        return ApiResponse<PurchaseInvoiceDetailDto>.SuccessResponse(
            MapToDetailDto(invoice),
            "Purchase invoice retrieved successfully.");
    }

    public async Task<ApiResponse<PagedResult<PurchaseInvoiceListDto>>> GetPurchaseInvoicesAsync(
        PurchaseInvoiceQueryDto query)
    {
        var pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        query.PageNumber = pageNumber;
        query.PageSize = pageSize;

        var result = await _purchaseInvoiceRepository.GetPurchaseInvoicesAsync(query);

        var items = result.Items
            .Select(MapToListDto)
            .ToList();

        var pagedResult = PagedResult<PurchaseInvoiceListDto>.Create(
            items,
            query.PageNumber,
            query.PageSize,
            result.TotalRecords);

        return ApiResponse<PagedResult<PurchaseInvoiceListDto>>.SuccessResponse(
            pagedResult,
            "Purchase invoices retrieved successfully.");
    }

    public async Task<ApiResponse<string>> SendPurchaseInvoiceEmailAsync(
    int purchaseInvoiceId)
    {
        var invoice = await _purchaseInvoiceRepository.GetPurchaseInvoiceByIdWithDetailsAsync(
            purchaseInvoiceId,
            trackChanges: true);

        if (invoice is null)
        {
            return ApiResponse<string>.NotFoundResponse("Purchase invoice not found.");
        }

        if (string.IsNullOrWhiteSpace(invoice.Vendor.Email))
        {
            return ApiResponse<string>.FailureResponse(
                "Vendor email address is missing.");
        }

        if (string.IsNullOrWhiteSpace(invoice.PdfPublicId))
        {
            return ApiResponse<string>.FailureResponse(
                "Invoice PDF has not been generated.");
        }

        var invoiceDto = MapToDetailDto(invoice);

        var pdfBytes = _invoicePdfService.GeneratePurchaseInvoicePdf(invoiceDto);

        var attachment = new EmailAttachmentDto
        {
            FileName = $"{invoice.InvoiceNumber}.pdf",
            ContentType = "application/pdf",
            Content = pdfBytes
        };

        var subject = $"Purchase Invoice {invoice.InvoiceNumber}";

        var plainTextContent =
            $"Dear {invoice.Vendor.VendorName},\n\n" +
            $"Please find attached purchase invoice {invoice.InvoiceNumber}.\n\n" +
            $"Total Amount: {invoice.TotalAmount:N2}\n\n" +
            "Regards,\n" +
            "AutoCare IMS";

        var htmlContent =
            $"""
            <p>Dear {invoice.Vendor.VendorName},</p>

            <p>Please find attached purchase invoice <strong>{invoice.InvoiceNumber}</strong>.</p>

            <p><strong>Total Amount:</strong> {invoice.TotalAmount:N2}</p>

            <p>Regards,<br/>AutoCare IMS</p>
            """;

        await _emailService.SendEmailWithAttachmentAsync(
            invoice.Vendor.Email,
            subject,
            plainTextContent,
            htmlContent,
            attachment);

        invoice.IsEmailSent = true;
        invoice.EmailSentAt = DateTime.UtcNow;

        await _purchaseInvoiceRepository.SaveChangesAsync();

        return ApiResponse<string>.SuccessResponse(
            "Purchase invoice email sent successfully.",
            "Purchase invoice email sent successfully.");
    }

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        string invoiceNumber;

        do
        {
            invoiceNumber = $"PINV-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        }
        while (await _purchaseInvoiceRepository.InvoiceNumberExistsAsync(invoiceNumber));

        return invoiceNumber;
    }
    
    public async Task<ApiResponse<string>> GetPurchaseInvoicePdfUrlAsync(
        int purchaseInvoiceId)
    {
        var invoice = await _purchaseInvoiceRepository.GetPurchaseInvoiceByIdWithDetailsAsync(
            purchaseInvoiceId);

        if (invoice is null)
        {
            return ApiResponse<string>.NotFoundResponse(
                "Purchase invoice not found.");
        }

        if (string.IsNullOrWhiteSpace(invoice.PdfPublicId))
        {
            return ApiResponse<string>.FailureResponse(
                "Invoice PDF has not been generated.");
        }

        var pdfUrl = _cloudinaryService.GetPdfUrl(invoice.PdfPublicId);

        return ApiResponse<string>.SuccessResponse(
            pdfUrl,
            "PDF URL generated successfully.");
    }

    private static PurchaseInvoiceListDto MapToListDto(PurchaseInvoice invoice)
    {
        return new PurchaseInvoiceListDto
        {
            PurchaseInvoiceId = invoice.PurchaseInvoiceId,
            InvoiceNumber = invoice.InvoiceNumber,
            VendorId = invoice.VendorId,
            VendorName = invoice.Vendor.VendorName,
            PurchaseDate = invoice.PurchaseDate,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status,
            PdfPublicId = invoice.PdfPublicId,
            IsEmailSent = invoice.IsEmailSent,
            EmailSentAt = invoice.EmailSentAt,
            CreatedAt = invoice.CreatedAt
        };
    }

    private static PurchaseInvoiceDetailDto MapToDetailDto(PurchaseInvoice invoice)
    {
        return new PurchaseInvoiceDetailDto
        {
            PurchaseInvoiceId = invoice.PurchaseInvoiceId,
            InvoiceNumber = invoice.InvoiceNumber,
            VendorId = invoice.VendorId,
            VendorName = invoice.Vendor.VendorName,
            VendorEmail = invoice.Vendor.Email ?? string.Empty,
            CreatedById = invoice.CreatedById,
            CreatedByName = invoice.CreatedBy.UserName ?? invoice.CreatedBy.Email ?? invoice.CreatedById,
            PurchaseDate = invoice.PurchaseDate,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status,
            PdfPublicId = invoice.PdfPublicId,
            IsEmailSent = invoice.IsEmailSent,
            EmailSentAt = invoice.EmailSentAt,
            CreatedAt = invoice.CreatedAt,
            Items = invoice.Items.Select(item => new PurchaseInvoiceItemDto
            {
                PurchaseInvoiceItemId = item.PurchaseInvoiceItemId,
                PartId = item.PartId,
                PartName = item.Part.PartName,
                PartNumber = item.Part.PartNumber,
                Quantity = item.Quantity,
                CostPricePerUnit = item.CostPricePerUnit,
                LineTotal = item.LineTotal
            }).ToList()
        };
    }
}