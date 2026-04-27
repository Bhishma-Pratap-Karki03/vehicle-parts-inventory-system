using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class ServiceRecordRepository : RepositoryBase<ServiceRecord>, IServiceRecordRepository
{
    public ServiceRecordRepository(ApplicationDbContext context) : base(context)
    {
    }
}