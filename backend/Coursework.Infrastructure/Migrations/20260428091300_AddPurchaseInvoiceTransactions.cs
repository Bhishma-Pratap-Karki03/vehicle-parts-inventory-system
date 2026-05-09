using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Coursework.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseInvoiceTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "Address", "ConcurrencyStamp", "CreatedAt", "Email", "EmailConfirmed", "FullName", "IsActive", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UpdatedAt", "UserName" },
                values: new object[] { "dev-admin-user", 0, null, "dev-admin-concurrency-stamp", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@autocareims.com", true, "Development Admin", true, false, null, "ADMIN@AUTOCAREIMS.COM", "ADMIN@AUTOCAREIMS.COM", null, null, false, "dev-admin-security-stamp", false, null, "admin@autocareims.com" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "1", "dev-admin-user" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "1", "dev-admin-user" });

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "dev-admin-user");
        }
    }
}
