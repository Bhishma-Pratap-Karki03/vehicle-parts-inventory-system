using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class PartRepository(ApplicationDbContext context)
    : RepositoryBase<Part>(context), IPartRepository
{
}