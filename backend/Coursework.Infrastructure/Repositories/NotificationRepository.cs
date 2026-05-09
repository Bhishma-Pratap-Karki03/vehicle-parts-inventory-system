using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class NotificationRepository(ApplicationDbContext context)
    : RepositoryBase<Notification>(context), INotificationRepository
{
    public async Task<List<Notification>> GetLatestAsync(bool trackChanges = false)
    {
        return await FindAll(trackChanges)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> ExistsForUserEntityTodayAsync(
        string userId,
        NotificationType notificationType,
        string relatedEntityType,
        int relatedEntityId,
        DateTime utcNow)
    {
        var startOfDay = utcNow.Date;
        var endOfDay = startOfDay.AddDays(1);

        return await FindByCondition(n =>
                n.UserId == userId &&
                n.NotificationType == notificationType &&
                n.RelatedEntityType == relatedEntityType &&
                n.RelatedEntityId == relatedEntityId &&
                n.CreatedAt >= startOfDay &&
                n.CreatedAt < endOfDay)
            .AnyAsync();
    }
}
