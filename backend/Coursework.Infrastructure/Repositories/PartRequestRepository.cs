using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class PartRequestRepository : RepositoryBase<PartRequest>, IPartRequestRepository
{
    public PartRequestRepository(ApplicationDbContext context) : base(context)
    {
    }
}