using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Coursework.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesInvoicePdfAndSalesTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InvoicePdfPublicId",
                table: "SalesInvoices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SalesInvoiceId",
                table: "PartTransactions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SalesInvoiceItemId",
                table: "PartTransactions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesInvoices_InvoiceDate",
                table: "SalesInvoices",
                column: "InvoiceDate");

            migrationBuilder.CreateIndex(
                name: "IX_SalesInvoices_PaymentStatus",
                table: "SalesInvoices",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_PartTransactions_SalesInvoiceId",
                table: "PartTransactions",
                column: "SalesInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PartTransactions_SalesInvoiceItemId",
                table: "PartTransactions",
                column: "SalesInvoiceItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_PartTransactions_SalesInvoiceItems_SalesInvoiceItemId",
                table: "PartTransactions",
                column: "SalesInvoiceItemId",
                principalTable: "SalesInvoiceItems",
                principalColumn: "SalesInvoiceItemId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PartTransactions_SalesInvoices_SalesInvoiceId",
                table: "PartTransactions",
                column: "SalesInvoiceId",
                principalTable: "SalesInvoices",
                principalColumn: "SalesInvoiceId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PartTransactions_SalesInvoiceItems_SalesInvoiceItemId",
                table: "PartTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_PartTransactions_SalesInvoices_SalesInvoiceId",
                table: "PartTransactions");

            migrationBuilder.DropIndex(
                name: "IX_SalesInvoices_InvoiceDate",
                table: "SalesInvoices");

            migrationBuilder.DropIndex(
                name: "IX_SalesInvoices_PaymentStatus",
                table: "SalesInvoices");

            migrationBuilder.DropIndex(
                name: "IX_PartTransactions_SalesInvoiceId",
                table: "PartTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PartTransactions_SalesInvoiceItemId",
                table: "PartTransactions");

            migrationBuilder.DropColumn(
                name: "InvoicePdfPublicId",
                table: "SalesInvoices");

            migrationBuilder.DropColumn(
                name: "SalesInvoiceId",
                table: "PartTransactions");

            migrationBuilder.DropColumn(
                name: "SalesInvoiceItemId",
                table: "PartTransactions");
        }
    }
}
