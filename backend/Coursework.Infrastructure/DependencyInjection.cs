using Coursework.Application.Interfaces;
using Coursework.Application.Services;
using Coursework.Infrastructure.Data;
using Coursework.Infrastructure.Repositories;
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

        // Repositories
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IServiceRecordRepository, ServiceRecordRepository>();
        services.AddScoped<IPartRequestRepository, PartRequestRepository>();
        services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
        services.AddScoped<ISalesInvoiceItemRepository, SalesInvoiceItemRepository>();
        services.AddScoped<IPurchaseInvoiceItemRepository, PurchaseInvoiceItemRepository>();

        // Application Services
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IPartRequestService, PartRequestService>();
        services.AddScoped<IFinancialReportService, FinancialReportService>();

        return services;
    }
}