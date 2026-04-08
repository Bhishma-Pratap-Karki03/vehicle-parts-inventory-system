using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    
}