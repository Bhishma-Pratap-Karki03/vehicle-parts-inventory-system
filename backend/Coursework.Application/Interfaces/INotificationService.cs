using Coursework.Application.Common;
using Coursework.Application.DTOs.Notifications;

namespace Coursework.Application.Interfaces;

public interface INotificationService
{
    Task<ApiResponse<List<AdminNotificationDto>>> GetAdminNotificationsAsync();

    Task<ApiResponse<List<OverdueCreditReminderDto>>> GetOverdueCreditRemindersAsync();

    Task<ApiResponse<OverdueCreditReminderSendResultDto>> SendOverdueCreditReminderAsync(int salesInvoiceId);
}
