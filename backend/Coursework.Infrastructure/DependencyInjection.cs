using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Application.Services;
using Coursework.Infrastructure.Services;
using Coursework.Infrastructure.Data;
using Coursework.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Coursework.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;

                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>();
            // .AddDefaultTokenProviders();

        services.AddScoped<IPartRepository, PartRepository>();
        services.AddScoped<IVendorRepository, VendorRepository>();
        services.AddScoped<IPurchaseInvoiceRepository, PurchaseInvoiceRepository>();
        services.AddScoped<IPartTransactionRepository, PartTransactionRepository>();
        
        services.AddScoped<IPartService, PartService>();
        services.AddScoped<IPurchaseInvoiceService, PurchaseInvoiceService>();
        services.AddScoped<IPartTransactionService, PartTransactionService>();
        
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IInvoicePdfService, InvoicePdfService>();
        services.AddScoped<IEmailService, SendGridEmailService>();
        

        return services;
    }
}