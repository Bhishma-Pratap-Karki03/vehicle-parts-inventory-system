using System.Net;
using Coursework.Application.Common;
using Coursework.Application.DTOs.Emails;
using Coursework.Application.DTOs.Notifications;
using Coursework.Application.DTOs.SalesInvoices;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Coursework.Application.Services;

public class NotificationService : INotificationService
{
    private const int LowStockThreshold = 10;
    private const string SalesInvoiceEntityType = "SalesInvoice";

    private readonly INotificationRepository _notificationRepository;
    private readonly IPartRepository _partRepository;
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly ISalesInvoicePdfService _salesInvoicePdfService;
    private readonly IEmailAttachmentService _emailAttachmentService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository notificationRepository,
        IPartRepository partRepository,
        ISalesInvoiceRepository salesInvoiceRepository,
        ISalesInvoicePdfService salesInvoicePdfService,
        IEmailAttachmentService emailAttachmentService,
        ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _partRepository = partRepository;
        _salesInvoiceRepository = salesInvoiceRepository;
        _salesInvoicePdfService = salesInvoicePdfService;
        _emailAttachmentService = emailAttachmentService;
        _logger = logger;
    }

    public async Task<ApiResponse<List<AdminNotificationDto>>> GetAdminNotificationsAsync()
    {
        try
        {
            var notifications = new List<AdminNotificationDto>();
            var overdueInvoices = await _salesInvoiceRepository.GetUnpaidCreditsOlderThanAsync(
                DateTime.UtcNow,
                trackChanges: false);
            var lowStockParts = await _partRepository.GetLowStockPartsAsync(
                LowStockThreshold,
                trackChanges: false);

            notifications.AddRange(lowStockParts.Select(part => new AdminNotificationDto
            {
                NotificationId = part.PartId,
                Title = "Low stock alert",
                Message = $"{part.PartName} is down to {part.StockQuantity} units and needs replenishment.",
                NotificationType = NotificationType.LowStock.ToString(),
                DeliveryMethod = DeliveryMethod.InApp.ToString(),
                IsRead = false,
                IsSent = false,
                CreatedAt = part.UpdatedAt ?? part.CreatedAt,
                RelatedEntityType = "Part",
                RelatedEntityId = part.PartId,
                ActionUrl = "/parts",
            }));

            notifications.AddRange(overdueInvoices.Select(invoice => new AdminNotificationDto
            {
                NotificationId = 1_000_000 + invoice.SalesInvoiceId,
                Title = "Overdue credit reminder",
                Message =
                    $"{invoice.Customer?.FullName ?? "A customer"} still owes {invoice.FinalAmount - invoice.PaidAmount:N2} on invoice {invoice.InvoiceNumber}.",
                NotificationType = NotificationType.CreditReminder.ToString(),
                DeliveryMethod = DeliveryMethod.InApp.ToString(),
                IsRead = false,
                IsSent = false,
                CreatedAt = invoice.DueDate ?? invoice.InvoiceDate,
                RelatedEntityType = SalesInvoiceEntityType,
                RelatedEntityId = invoice.SalesInvoiceId,
                ActionUrl = "/admin/notifications",
            }));

            var orderedNotifications = notifications
                .OrderByDescending(notification => notification.CreatedAt)
                .ThenByDescending(notification => notification.NotificationId)
                .ToList();

            return ApiResponse<List<AdminNotificationDto>>.SuccessResponse(
                orderedNotifications,
                "Notifications retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving admin notifications.");

            return ApiResponse<List<AdminNotificationDto>>.ServerErrorResponse(
                "An error occurred while retrieving notifications.");
        }
    }

    public async Task<ApiResponse<List<OverdueCreditReminderDto>>> GetOverdueCreditRemindersAsync()
    {
        try
        {
            var overdueInvoices = await _salesInvoiceRepository.GetUnpaidCreditsOlderThanAsync(
                DateTime.UtcNow,
                trackChanges: false);
            var latestSentLookup = await _notificationRepository.GetLatestSentAtByEntityIdsAsync(
                NotificationType.CreditReminder,
                SalesInvoiceEntityType,
                overdueInvoices.Select(invoice => invoice.SalesInvoiceId),
                trackChanges: false);

            var items = overdueInvoices
                .Select(invoice => new OverdueCreditReminderDto
                {
                    SalesInvoiceId = invoice.SalesInvoiceId,
                    InvoiceNumber = invoice.InvoiceNumber,
                    CustomerId = invoice.CustomerId,
                    CustomerName = invoice.Customer?.FullName ?? "Unknown Customer",
                    CustomerEmail = invoice.Customer?.Email ?? string.Empty,
                    CustomerPhoneNumber = invoice.Customer?.PhoneNumber,
                    VehicleNumber = invoice.Vehicle?.VehicleNumber ?? "Unknown Vehicle",
                    FinalAmount = invoice.FinalAmount,
                    PaidAmount = invoice.PaidAmount,
                    RemainingAmount = invoice.FinalAmount - invoice.PaidAmount,
                    InvoiceDate = invoice.InvoiceDate,
                    DueDate = invoice.DueDate,
                    HasInvoicePdf = !string.IsNullOrWhiteSpace(invoice.InvoicePdfPublicId),
                    LastReminderSentAt = latestSentLookup.GetValueOrDefault(invoice.SalesInvoiceId),
                })
                .OrderByDescending(item => item.DueDate ?? item.InvoiceDate)
                .ThenByDescending(item => item.SalesInvoiceId)
                .ToList();

            return ApiResponse<List<OverdueCreditReminderDto>>.SuccessResponse(
                items,
                "Overdue credit reminders retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving overdue credit reminders.");

            return ApiResponse<List<OverdueCreditReminderDto>>.ServerErrorResponse(
                "An error occurred while retrieving overdue credit reminders.");
        }
    }

    public async Task<ApiResponse<OverdueCreditReminderSendResultDto>> SendOverdueCreditReminderAsync(int salesInvoiceId)
    {
        try
        {
            if (salesInvoiceId <= 0)
            {
                return ApiResponse<OverdueCreditReminderSendResultDto>.FailureResponse(
                    "Invalid sales invoice id.");
            }

            var invoice = await _salesInvoiceRepository.GetSalesInvoiceDetailsAsync(
                salesInvoiceId,
                trackChanges: false);

            if (invoice == null)
            {
                return ApiResponse<OverdueCreditReminderSendResultDto>.NotFoundResponse(
                    "Sales invoice was not found.");
            }

            if (invoice.PaymentStatus == PaymentStatus.Paid || invoice.FinalAmount - invoice.PaidAmount <= 0)
            {
                return ApiResponse<OverdueCreditReminderSendResultDto>.ConflictResponse(
                    "This invoice is already fully paid.");
            }

            if (!invoice.DueDate.HasValue || invoice.DueDate.Value >= DateTime.UtcNow)
            {
                return ApiResponse<OverdueCreditReminderSendResultDto>.ConflictResponse(
                    "This invoice is not overdue yet.");
            }

            var customerEmail = invoice.Customer?.Email?.Trim();

            if (string.IsNullOrWhiteSpace(customerEmail))
            {
                return ApiResponse<OverdueCreditReminderSendResultDto>.FailureResponse(
                    "Customer email address is missing.");
            }

            var invoiceDetail = MapToSalesInvoiceDetail(invoice);
            var pdfBytes = _salesInvoicePdfService.GenerateSalesInvoicePdf(invoiceDetail);
            var sentAt = DateTime.UtcNow;
            var remainingAmount = invoice.FinalAmount - invoice.PaidAmount;
            var dueDateLabel = invoice.DueDate.Value.ToString("yyyy-MM-dd");
            var customerName = invoice.Customer?.FullName ?? "Customer";

            var subject = $"Payment Reminder for Invoice {invoice.InvoiceNumber}";
            var plainTextContent =
                $"Dear {customerName},\n\n" +
                $"This is a reminder that invoice {invoice.InvoiceNumber} became overdue on {dueDateLabel}.\n" +
                $"Remaining Amount: {remainingAmount:N2}\n\n" +
                "Please clear the outstanding balance at your earliest convenience.\n\n" +
                "Regards,\n" +
                "AutoCare IMS";

            var htmlContent = $@"
                <p>Dear {WebUtility.HtmlEncode(customerName)},</p>
                <p>This is a reminder that invoice <strong>{WebUtility.HtmlEncode(invoice.InvoiceNumber)}</strong> became overdue on <strong>{WebUtility.HtmlEncode(dueDateLabel)}</strong>.</p>
                <p><strong>Remaining Amount:</strong> {remainingAmount:N2}</p>
                <p>Please clear the outstanding balance at your earliest convenience.</p>
                <p>Regards,<br/>AutoCare IMS</p>";

            await _emailAttachmentService.SendEmailWithAttachmentAsync(
                customerEmail,
                subject,
                plainTextContent,
                htmlContent,
                new EmailAttachmentDto
                {
                    FileName = $"{invoice.InvoiceNumber}.pdf",
                    ContentType = "application/pdf",
                    Content = pdfBytes,
                });

            _notificationRepository.Create(new Notification
            {
                UserId = invoice.CustomerId,
                Title = "Overdue payment reminder sent",
                Message = $"Reminder email sent for invoice {invoice.InvoiceNumber}.",
                NotificationType = NotificationType.CreditReminder,
                DeliveryMethod = DeliveryMethod.Email,
                IsRead = true,
                IsSent = true,
                SentAt = sentAt,
                RelatedEntityType = SalesInvoiceEntityType,
                RelatedEntityId = invoice.SalesInvoiceId,
                CreatedAt = sentAt,
            });

            await _notificationRepository.SaveChangesAsync();

            return ApiResponse<OverdueCreditReminderSendResultDto>.SuccessResponse(
                new OverdueCreditReminderSendResultDto
                {
                    SalesInvoiceId = invoice.SalesInvoiceId,
                    InvoiceNumber = invoice.InvoiceNumber,
                    RecipientEmail = customerEmail,
                    SentAt = sentAt,
                },
                "Reminder email sent successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while sending overdue credit reminder for invoice {SalesInvoiceId}.",
                salesInvoiceId);

            return ApiResponse<OverdueCreditReminderSendResultDto>.ServerErrorResponse(
                "An error occurred while sending the overdue reminder email.");
        }
    }

    private static SalesInvoiceDetailDto MapToSalesInvoiceDetail(SalesInvoice invoice)
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
                LineTotal = item.LineTotal,
            }).ToList(),
            Payments = invoice.Payments
                .OrderByDescending(payment => payment.PaymentDate)
                .ThenByDescending(payment => payment.PaymentId)
                .Select(payment => new SalesInvoicePaymentResponseDto
                {
                    PaymentId = payment.PaymentId,
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentDate = payment.PaymentDate,
                    Remarks = payment.Remarks,
                    CreatedAt = payment.CreatedAt,
                }).ToList(),
        };
    }
}
