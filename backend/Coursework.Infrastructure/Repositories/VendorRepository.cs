using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class VendorRepository(ApplicationDbContext context)
    : RepositoryBase<Vendor>(context), IVendorRepository
{
}
