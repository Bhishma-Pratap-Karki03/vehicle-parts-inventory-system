using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;

namespace Coursework.Infrastructure.Repositories;

public class PaymentRepository(ApplicationDbContext context)
    : RepositoryBase<Payment>(context), IPaymentRepository
{
}
