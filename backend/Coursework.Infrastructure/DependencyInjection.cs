using Coursework.Application.Interfaces;
using Coursework.Application.Services;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.BackgroundServices;
using Coursework.Infrastructure.Data;
using Coursework.Infrastructure.Services;
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

        services.AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IVendorService, VendorService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IEmailService, EmailService>();

        services.AddHostedService<NotificationBackgroundService>();

        return services;
    }
}