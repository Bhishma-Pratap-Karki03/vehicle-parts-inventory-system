using Coursework.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Part> Parts => Set<Part>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();
    public DbSet<SalesInvoiceItem> SalesInvoiceItems => Set<SalesInvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<PartRequest> PartRequests => Set<PartRequest>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Admin" },
            new Role { RoleId = 2, RoleName = "Staff" },
            new Role { RoleId = 3, RoleName = "Customer" }
        );

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.VehicleNumber)
            .IsUnique();

        modelBuilder.Entity<PurchaseOrder>()
            .HasIndex(p => p.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<Part>()
            .HasIndex(p => p.PartNumber)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Vehicle>()
            .HasOne(v => v.Customer)
            .WithMany(u => u.Vehicles)
            .HasForeignKey(v => v.CustomerId)
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

        modelBuilder.Entity<PartRequest>()
            .HasOne(p => p.Customer)
            .WithMany(u => u.PartRequests)
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Customer)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Part>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.Parts)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrder>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.PurchaseOrders)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrderItem>()
            .HasOne(i => i.PurchaseOrder)
            .WithMany(p => p.Items)
            .HasForeignKey(i => i.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PurchaseOrderItem>()
            .HasOne(i => i.Part)
            .WithMany(p => p.PurchaseOrderItems)
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
    }
}