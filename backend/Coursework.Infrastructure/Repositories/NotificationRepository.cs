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

    public async Task<Dictionary<int, DateTime?>> GetLatestSentAtByEntityIdsAsync(
        NotificationType notificationType,
        string relatedEntityType,
        IEnumerable<int> relatedEntityIds,
        bool trackChanges = false)
    {
        var entityIdList = relatedEntityIds
            .Distinct()
            .ToList();

        if (entityIdList.Count == 0)
        {
            return new Dictionary<int, DateTime?>();
        }

        return await FindByCondition(
                n => n.NotificationType == notificationType &&
                     n.RelatedEntityType == relatedEntityType &&
                     n.RelatedEntityId.HasValue &&
                     entityIdList.Contains(n.RelatedEntityId.Value),
                trackChanges)
            .GroupBy(n => n.RelatedEntityId!.Value)
            .Select(group => new
            {
                RelatedEntityId = group.Key,
                LatestSentAt = group.Max(item => item.SentAt ?? item.CreatedAt),
            })
            .ToDictionaryAsync(
                item => item.RelatedEntityId,
                item => (DateTime?)item.LatestSentAt);
    }
}
