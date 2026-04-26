using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Services;

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

    public async Task<int> CreateLowStockNotificationsAsync()
    {
        var lowStockParts = await _context.Parts
            .Where(p => p.IsActive && p.StockQuantity < 10)
            .ToListAsync();

        if (!lowStockParts.Any())
            return 0;

        var admins = await _userManager.GetUsersInRoleAsync("Admin");

        var createdCount = 0;

        foreach (var admin in admins)
        {
            foreach (var part in lowStockParts)
            {
                var alreadyExists = await _context.Notifications.AnyAsync(n =>
                    n.UserId == admin.Id &&
                    n.NotificationType == NotificationType.LowStock &&
                    n.RelatedEntityType == "Part" &&
                    n.RelatedEntityId == part.PartId &&
                    !n.IsRead);

                if (alreadyExists)
                    continue;

                var notification = new Notification
                {
                    UserId = admin.Id,
                    NotificationType = NotificationType.LowStock,
                    Title = "Low Stock Alert",
                    Message = $"{part.PartName} stock is low. Current stock: {part.StockQuantity}.",
                    DeliveryMethod = DeliveryMethod.InApp,
                    RelatedEntityType = "Part",
                    RelatedEntityId = part.PartId,
                    IsRead = false,
                    IsSent = true,
                    SentAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                createdCount++;
            }
        }

        await _context.SaveChangesAsync();

        return createdCount;
    }

    public async Task<int> SendOverdueCreditRemindersAsync()
    {
        var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);

        var overdueInvoices = await _context.SalesInvoices
            .Include(i => i.Customer)
            .Where(i =>
                i.PaymentStatus != PaymentStatus.Paid &&
                i.DueDate != null &&
                i.DueDate < oneMonthAgo)
            .ToListAsync();

        var sentCount = 0;

        foreach (var invoice in overdueInvoices)
        {
            if (string.IsNullOrWhiteSpace(invoice.Customer.Email))
                continue;

            var alreadySent = await _context.Notifications.AnyAsync(n =>
                n.UserId == invoice.CustomerId &&
                n.NotificationType == NotificationType.CreditReminder &&
                n.RelatedEntityType == "SalesInvoice" &&
                n.RelatedEntityId == invoice.SalesInvoiceId &&
                n.IsSent);

            if (alreadySent)
                continue;

            var subject = "Reminder: Unpaid Credit Balance";
            var body =
                $"Dear {invoice.Customer.FullName},\n\n" +
                $"This is a reminder that your invoice {invoice.InvoiceNumber} has an unpaid credit balance.\n" +
                $"Total Amount: {invoice.FinalAmount}\n" +
                $"Paid Amount: {invoice.PaidAmount}\n" +
                $"Remaining Amount: {invoice.FinalAmount - invoice.PaidAmount}\n\n" +
                $"Please clear your payment as soon as possible.\n\n" +
                $"Thank you.";

            await _emailService.SendEmailAsync(invoice.Customer.Email, subject, body);

            var notification = new Notification
            {
                UserId = invoice.CustomerId,
                NotificationType = NotificationType.CreditReminder,
                Title = "Unpaid Credit Reminder",
                Message = $"Email reminder sent for invoice {invoice.InvoiceNumber}.",
                DeliveryMethod = DeliveryMethod.Email,
                RelatedEntityType = "SalesInvoice",
                RelatedEntityId = invoice.SalesInvoiceId,
                IsRead = false,
                IsSent = true,
                SentAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            sentCount++;
        }

        await _context.SaveChangesAsync();

        return sentCount;
    }
}