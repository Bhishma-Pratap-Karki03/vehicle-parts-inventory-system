using Coursework.Domain.Entities;
using Coursework.Domain.Enums;

namespace Coursework.Application.Interfaces;

public interface INotificationRepository : IRepositoryBase<Notification>
{
    Task<List<Notification>> GetLatestAsync(bool trackChanges = false);

    Task<bool> ExistsForUserEntityTodayAsync(
        string userId,
        NotificationType notificationType,
        string relatedEntityType,
        int relatedEntityId,
        DateTime utcNow);
}
