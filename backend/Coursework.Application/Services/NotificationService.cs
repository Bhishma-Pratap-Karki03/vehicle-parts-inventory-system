using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Coursework.Application.Services;

public class NotificationService : INotificationService
{
    private const int LowStockThreshold = 10;
    private const string PartEntityType = "Part";
    private const string SalesInvoiceEntityType = "SalesInvoice";

    private readonly INotificationRepository _notificationRepository;
    private readonly IPartRepository _partRepository;
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;

    public NotificationService(
        INotificationRepository notificationRepository,
        IPartRepository partRepository,
        ISalesInvoiceRepository salesInvoiceRepository,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService)
    {
        _notificationRepository = notificationRepository;
        _partRepository = partRepository;
        _salesInvoiceRepository = salesInvoiceRepository;
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<List<object>> GetAllAsync()
    {
        var notifications = await _notificationRepository.GetLatestAsync();

        return notifications
            .Select(n => new
            {
                n.NotificationId,
                n.UserId,
                n.Title,
                n.Message,
                NotificationType = n.NotificationType.ToString(),
                DeliveryMethod = n.DeliveryMethod.ToString(),
                n.IsRead,
                n.IsSent,
                n.SentAt,
                n.RelatedEntityType,
                n.RelatedEntityId,
                n.CreatedAt
            })
            .Cast<object>()
            .ToList();
    }

    public async Task<int> CheckLowStockAsync()
    {
        var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");

        if (!adminUsers.Any())
        {
            return 0;
        }

        var utcNow = DateTime.UtcNow;
        var lowStockParts = await _partRepository.GetLowStockPartsAsync(LowStockThreshold);
        var count = 0;

        foreach (var part in lowStockParts)
        {
            foreach (var admin in adminUsers)
            {
                var alreadyExists = await _notificationRepository.ExistsForUserEntityTodayAsync(
                    admin.Id,
                    NotificationType.LowStock,
                    PartEntityType,
                    part.PartId,
                    utcNow);

                if (alreadyExists)
                {
                    continue;
                }

                _notificationRepository.Create(new Notification
                {
                    UserId = admin.Id,
                    Title = "Low Stock Alert",
                    Message = $"{part.PartName} stock is below 10. Current stock: {part.StockQuantity}",
                    NotificationType = NotificationType.LowStock,
                    DeliveryMethod = DeliveryMethod.InApp,
                    RelatedEntityType = PartEntityType,
                    RelatedEntityId = part.PartId,
                    CreatedAt = utcNow
                });

                count++;
            }
        }

        if (count > 0)
        {
            await _notificationRepository.SaveChangesAsync();
        }

        return count;
    }

    public async Task<int> SendCreditRemindersAsync()
    {
        var utcNow = DateTime.UtcNow;
        var overdueInvoices =
            await _salesInvoiceRepository.GetUnpaidCreditsOlderThanAsync(utcNow.AddMonths(-1));
        var count = 0;

        foreach (var invoice in overdueInvoices)
        {
            if (string.IsNullOrWhiteSpace(invoice.Customer.Email))
            {
                continue;
            }

            var alreadySentToday = await _notificationRepository.ExistsForUserEntityTodayAsync(
                invoice.CustomerId,
                NotificationType.CreditReminder,
                SalesInvoiceEntityType,
                invoice.SalesInvoiceId,
                utcNow);

            if (alreadySentToday)
            {
                continue;
            }

            var subject = "Unpaid Credit Reminder";
            var body =
                $"Dear {invoice.Customer.FullName},\n\n" +
                $"Your invoice {invoice.InvoiceNumber} is unpaid for more than one month.\n" +
                $"Total Amount: {invoice.FinalAmount}\n" +
                $"Paid Amount: {invoice.PaidAmount}\n" +
                $"Remaining Amount: {invoice.FinalAmount - invoice.PaidAmount}\n\n" +
                "Please clear your due payment as soon as possible.\n\n" +
                "Thank you.";

            await _emailService.SendEmailAsync(invoice.Customer.Email, subject, body);

            _notificationRepository.Create(new Notification
            {
                UserId = invoice.CustomerId,
                Title = "Unpaid Credit Reminder",
                Message = $"Invoice {invoice.InvoiceNumber} is overdue.",
                NotificationType = NotificationType.CreditReminder,
                DeliveryMethod = DeliveryMethod.Email,
                IsSent = true,
                SentAt = utcNow,
                RelatedEntityType = SalesInvoiceEntityType,
                RelatedEntityId = invoice.SalesInvoiceId,
                CreatedAt = utcNow
            });

            count++;
        }

        if (count > 0)
        {
            await _notificationRepository.SaveChangesAsync();
        }

        return count;
    }
}
