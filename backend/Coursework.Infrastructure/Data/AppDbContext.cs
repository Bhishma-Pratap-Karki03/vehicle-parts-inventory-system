using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Part> Parts => Set<Part>();

    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems => Set<PurchaseInvoiceItem>();

    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();
    public DbSet<SalesInvoiceItem> SalesInvoiceItems => Set<SalesInvoiceItem>();

    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<ServiceRecord> ServiceRecords => Set<ServiceRecord>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<PartRequest> PartRequests => Set<PartRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        SeedRoles(modelBuilder);
        ConfigureIndexes(modelBuilder);
        ConfigureRelationships(modelBuilder);
        ConfigureMoneyPrecision(modelBuilder);
        ConfigureEnumConversions(modelBuilder);
    }

    private static void SeedRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<IdentityRole>().HasData(
            new IdentityRole
            {
                Id = "1",
                Name = "Admin",
                NormalizedName = "ADMIN",
                ConcurrencyStamp = "admin-role-stamp"
            },
            new IdentityRole
            {
                Id = "2",
                Name = "Staff",
                NormalizedName = "STAFF",
                ConcurrencyStamp = "staff-role-stamp"
            },
            new IdentityRole
            {
                Id = "3",
                Name = "Customer",
                NormalizedName = "CUSTOMER",
                ConcurrencyStamp = "customer-role-stamp"
            },
            new IdentityRole
            {
                Id = "4",
                Name = "Vendor",
                NormalizedName = "VENDOR",
                ConcurrencyStamp = "vendor-role-stamp"
            }
        );
    }

    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.VehicleNumber)
            .IsUnique();

        modelBuilder.Entity<Part>()
            .HasIndex(p => p.PartNumber)
            .IsUnique();

        modelBuilder.Entity<PurchaseInvoice>()
            .HasIndex(p => p.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<SalesInvoice>()
            .HasIndex(s => s.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<Vendor>()
            .HasIndex(v => v.Email);

        modelBuilder.Entity<Vendor>()
            .Property(v => v.Role)
            .HasMaxLength(50);
    }

    private static void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vehicle>()
            .HasOne(v => v.Customer)
            .WithMany(u => u.Vehicles)
            .HasForeignKey(v => v.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vendor>()
            .HasMany(v => v.Parts)
            .WithOne(p => p.Vendor)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Vendor>()
            .HasMany(v => v.PurchaseInvoices)
            .WithOne(p => p.Vendor)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseInvoice>()
            .HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseInvoiceItem>()
            .HasOne(i => i.PurchaseInvoice)
            .WithMany(p => p.Items)
            .HasForeignKey(i => i.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PurchaseInvoiceItem>()
            .HasOne(i => i.Part)
            .WithMany(p => p.PurchaseInvoiceItems)
            .HasForeignKey(i => i.PartId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesInvoice>()
            .HasOne(s => s.Customer)
            .WithMany()
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesInvoice>()
            .HasOne(s => s.Staff)
            .WithMany()
            .HasForeignKey(s => s.StaffId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesInvoice>()
            .HasOne(s => s.Vehicle)
            .WithMany()
            .HasForeignKey(s => s.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesInvoiceItem>()
            .HasOne(i => i.SalesInvoice)
            .WithMany(s => s.Items)
            .HasForeignKey(i => i.SalesInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SalesInvoiceItem>()
            .HasOne(i => i.Part)
            .WithMany(p => p.SalesInvoiceItems)
            .HasForeignKey(i => i.PartId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.SalesInvoice)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SalesInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Customer)
            .WithMany(u => u.Appointments)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Vehicle)
            .WithMany()
            .HasForeignKey(a => a.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ServiceRecord>()
            .HasOne(s => s.Appointment)
            .WithOne()
            .HasForeignKey<ServiceRecord>(s => s.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ServiceRecord>()
            .HasOne(s => s.Customer)
            .WithMany()
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ServiceRecord>()
            .HasOne(s => s.Staff)
            .WithMany()
            .HasForeignKey(s => s.StaffId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ServiceRecord>()
            .HasOne(s => s.Vehicle)
            .WithMany()
            .HasForeignKey(s => s.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Customer)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Appointment)
            .WithMany(a => a.Reviews)
            .HasForeignKey(r => r.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PartRequest>()
            .HasOne(p => p.Customer)
            .WithMany(u => u.PartRequests)
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureMoneyPrecision(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Part>()
            .Property(p => p.CostPricePerUnit)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Part>()
            .Property(p => p.SellingPricePerUnit)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PurchaseInvoice>()
            .Property(p => p.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PurchaseInvoiceItem>()
            .Property(p => p.CostPricePerUnit)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PurchaseInvoiceItem>()
            .Property(p => p.LineTotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesInvoice>()
            .Property(s => s.SubTotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesInvoice>()
            .Property(s => s.DiscountAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesInvoice>()
            .Property(s => s.FinalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesInvoice>()
            .Property(s => s.PaidAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesInvoiceItem>()
            .Property(s => s.PricePerUnit)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesInvoiceItem>()
            .Property(s => s.LineTotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ServiceRecord>()
            .Property(s => s.LaborCost)
            .HasPrecision(18, 2);
    }

    private static void ConfigureEnumConversions(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SalesInvoice>()
            .Property(s => s.PaymentStatus)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<Appointment>()
            .Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<PartRequest>()
            .Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<Notification>()
            .Property(n => n.NotificationType)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<Notification>()
            .Property(n => n.DeliveryMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<ServiceRecord>()
            .Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<PurchaseInvoice>()
            .Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(50);
    }
}
