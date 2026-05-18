namespace Coursework.Application.Interfaces;

public interface INotificationService
{
    Task<List<object>> GetAllAsync();

    Task<int> CheckLowStockAsync();

    Task<int> SendCreditRemindersAsync();
}