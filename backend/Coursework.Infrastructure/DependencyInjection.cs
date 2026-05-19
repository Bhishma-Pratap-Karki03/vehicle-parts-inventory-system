using Coursework.Application.Interfaces;
using Coursework.Application.Services;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Coursework.Infrastructure.Repositories;
using Coursework.Infrastructure.Services;
using Coursework.Services;
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
        services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IServiceRecordRepository, ServiceRecordRepository>();

        services.AddScoped<IPartService, PartService>();
        services.AddScoped<IPurchaseInvoiceService, PurchaseInvoiceService>();
        services.AddScoped<IPartTransactionService, PartTransactionService>();
        services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IInvoicePdfService, InvoicePdfService>();
        services.AddScoped<ISalesInvoicePdfService, SalesInvoicePdfService>();
        services.AddScoped<IEmailAttachmentService, SendGridEmailService>();




        // Repositories
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IServiceRecordRepository, ServiceRecordRepository>();
        services.AddScoped<IPartRequestRepository, PartRequestRepository>();
        services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<ISalesInvoiceItemRepository, SalesInvoiceItemRepository>();
        services.AddScoped<IPurchaseInvoiceItemRepository, PurchaseInvoiceItemRepository>();

        // Application Services
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IPartRequestService, PartRequestService>();
        services.AddScoped<IFinancialReportService, FinancialReportService>();

        services.AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IVendorService, VendorService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IPartRepository, PartRepository>();
        services.AddScoped<IVendorRepository, VendorRepository>();
        services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        return services;
    }
}
