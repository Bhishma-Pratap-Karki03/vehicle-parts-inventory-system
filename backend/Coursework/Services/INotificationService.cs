namespace Coursework.Services;

public interface INotificationService
{
    Task<int> CreateLowStockNotificationsAsync();
    Task<int> SendOverdueCreditRemindersAsync();
}