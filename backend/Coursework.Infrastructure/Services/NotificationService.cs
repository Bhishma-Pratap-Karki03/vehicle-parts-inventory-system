using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;

    public NotificationService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<List<object>> GetAllAsync()
    {
        var notifications = await _context.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

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

        var lowStockParts = await _context.Parts
            .Where(p => p.StockQuantity < 10 && p.IsActive)
            .ToListAsync();

        var count = 0;

        foreach (var part in lowStockParts)
        {
            foreach (var admin in adminUsers)
            {
                var alreadyExists = await _context.Notifications.AnyAsync(n =>
                    n.UserId == admin.Id &&
                    n.NotificationType == NotificationType.LowStock &&
                    n.RelatedEntityType == "Part" &&
                    n.RelatedEntityId == part.PartId &&
                    n.CreatedAt.Date == DateTime.UtcNow.Date);

                if (alreadyExists)
                {
                    continue;
                }

                var notification = new Notification
                {
                    UserId = admin.Id,
                    Title = "Low Stock Alert",
                    Message = $"{part.PartName} stock is below 10. Current stock: {part.StockQuantity}",
                    NotificationType = NotificationType.LowStock,
                    DeliveryMethod = DeliveryMethod.InApp,
                    RelatedEntityType = "Part",
                    RelatedEntityId = part.PartId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                count++;
            }
        }

        await _context.SaveChangesAsync();

        return count;
    }

    public async Task<int> SendCreditRemindersAsync()
    {
        var overdueInvoices = await _context.SalesInvoices
            .Include(i => i.Customer)
            .Where(i =>
                i.PaymentStatus != PaymentStatus.Paid &&
                i.DueDate != null &&
                i.DueDate < DateTime.UtcNow.AddMonths(-1))
            .ToListAsync();

        var count = 0;

        foreach (var invoice in overdueInvoices)
        {
            if (string.IsNullOrWhiteSpace(invoice.Customer.Email))
            {
                continue;
            }

            var alreadySentToday = await _context.Notifications.AnyAsync(n =>
                n.UserId == invoice.CustomerId &&
                n.NotificationType == NotificationType.CreditReminder &&
                n.RelatedEntityType == "SalesInvoice" &&
                n.RelatedEntityId == invoice.SalesInvoiceId &&
                n.CreatedAt.Date == DateTime.UtcNow.Date);

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

            var notification = new Notification
            {
                UserId = invoice.CustomerId,
                Title = "Unpaid Credit Reminder",
                Message = $"Invoice {invoice.InvoiceNumber} is overdue.",
                NotificationType = NotificationType.CreditReminder,
                DeliveryMethod = DeliveryMethod.Email,
                IsSent = true,
                SentAt = DateTime.UtcNow,
                RelatedEntityType = "SalesInvoice",
                RelatedEntityId = invoice.SalesInvoiceId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            count++;
        }

        await _context.SaveChangesAsync();

        return count;
    }
}