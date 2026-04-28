using Coursework.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Coursework.Infrastructure.BackgroundServices;

public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationBackgroundService> _logger;

    public NotificationBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<NotificationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();

                var notificationService =
                    scope.ServiceProvider.GetRequiredService<INotificationService>();

                var lowStockCount = await notificationService.CheckLowStockAsync();
                var creditReminderCount = await notificationService.SendCreditRemindersAsync();

                _logger.LogInformation(
                    "Automatic notification completed. Low stock: {LowStockCount}, Credit reminders: {CreditReminderCount}",
                    lowStockCount,
                    creditReminderCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while running automatic notification service.");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}