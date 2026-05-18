using Coursework.Application.DTOs.SalesInvoices;
using Coursework.Application.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Coursework.Infrastructure.Services;

public class SalesInvoicePdfService : ISalesInvoicePdfService
{
    public SalesInvoicePdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateSalesInvoicePdf(SalesInvoiceDetailDto invoice)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(text => text.FontSize(10));

                page.Header().Element(header => ComposeHeader(header, invoice));

                page.Content().Element(content => ComposeContent(content, invoice));

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Page ");
                    text.CurrentPageNumber();
                    text.Span(" of ");
                    text.TotalPages();
                });
            });
        }).GeneratePdf();
    }

    private static void ComposeHeader(IContainer container, SalesInvoiceDetailDto invoice)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(left =>
                {
                    left.Item().Text("AutoCare IMS")
                        .FontSize(22)
                        .SemiBold();

                    left.Item().Text("Sales Invoice")
                        .FontSize(14);
                });

                row.RelativeItem().AlignRight().Column(right =>
                {
                    right.Item().Text(invoice.InvoiceNumber)
                        .FontSize(16)
                        .SemiBold();

                    right.Item().Text($"Date: {invoice.InvoiceDate:yyyy-MM-dd}");
                    right.Item().Text($"Status: {invoice.PaymentStatus}");
                });
            });

            column.Item().PaddingTop(15).LineHorizontal(1);
        });
    }

    private static void ComposeContent(IContainer container, SalesInvoiceDetailDto invoice)
    {
        container.PaddingTop(20).Column(column =>
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(customer =>
                {
                    customer.Item().Text("Customer")
                        .SemiBold()
                        .FontSize(12);

                    customer.Item().Text(invoice.CustomerName);
                    customer.Item().Text(invoice.CustomerEmail);

                    if (!string.IsNullOrWhiteSpace(invoice.CustomerPhoneNumber))
                    {
                        customer.Item().Text(invoice.CustomerPhoneNumber);
                    }
                });

                row.RelativeItem().Column(vehicle =>
                {
                    vehicle.Item().Text("Vehicle")
                        .SemiBold()
                        .FontSize(12);

                    vehicle.Item().Text($"Vehicle No: {invoice.VehicleNumber}");
                    vehicle.Item().Text($"Brand: {invoice.VehicleBrand}");
                    vehicle.Item().Text($"Model: {invoice.VehicleModel}");
                });
            });

            column.Item().PaddingTop(15).Row(row =>
            {
                row.RelativeItem().Column(staff =>
                {
                    staff.Item().Text("Created By")
                        .SemiBold()
                        .FontSize(12);

                    staff.Item().Text(invoice.StaffName);
                    staff.Item().Text($"Created At: {invoice.CreatedAt:yyyy-MM-dd HH:mm}");
                });

                row.RelativeItem().Column(payment =>
                {
                    payment.Item().Text("Payment")
                        .SemiBold()
                        .FontSize(12);

                    payment.Item().Text($"Payment Status: {invoice.PaymentStatus}");
                    payment.Item().Text($"Paid Amount: {invoice.PaidAmount:N2}");
                    payment.Item().Text($"Remaining Amount: {invoice.RemainingAmount:N2}");

                    if (invoice.DueDate.HasValue)
                    {
                        payment.Item().Text($"Due Date: {invoice.DueDate.Value:yyyy-MM-dd}");
                    }
                });
            });

            column.Item()
                .PaddingVertical(20)
                .Element(table => ComposeItemsTable(table, invoice));

            column.Item().AlignRight().Column(totals =>
            {
                totals.Item().Text($"Subtotal: {invoice.SubTotal:N2}");
                totals.Item().Text($"Discount: {invoice.DiscountAmount:N2}");

                totals.Item().Text($"Final Amount: {invoice.FinalAmount:N2}")
                    .FontSize(14)
                    .SemiBold();

                totals.Item().Text($"Paid Amount: {invoice.PaidAmount:N2}");
                totals.Item().Text($"Remaining Amount: {invoice.RemainingAmount:N2}");
            });

            column.Item()
                .PaddingTop(30)
                .Text("This invoice was generated by AutoCare IMS.")
                .FontSize(9)
                .FontColor(Colors.Grey.Darken1);
        });
    }

    private static void ComposeItemsTable(IContainer container, SalesInvoiceDetailDto invoice)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(35);
                columns.RelativeColumn(2);
                columns.RelativeColumn();
                columns.ConstantColumn(60);
                columns.ConstantColumn(90);
                columns.ConstantColumn(90);
            });

            table.Header(header =>
            {
                header.Cell().Element(HeaderCell).Text("#");
                header.Cell().Element(HeaderCell).Text("Part Name");
                header.Cell().Element(HeaderCell).Text("Part No.");
                header.Cell().Element(HeaderCell).AlignRight().Text("Qty");
                header.Cell().Element(HeaderCell).AlignRight().Text("Price");
                header.Cell().Element(HeaderCell).AlignRight().Text("Line Total");
            });

            for (var i = 0; i < invoice.Items.Count; i++)
            {
                var item = invoice.Items[i];

                table.Cell().Element(BodyCell).Text((i + 1).ToString());
                table.Cell().Element(BodyCell).Text(item.PartName);
                table.Cell().Element(BodyCell).Text(item.PartNumber);
                table.Cell().Element(BodyCell).AlignRight().Text(item.Quantity.ToString());
                table.Cell().Element(BodyCell).AlignRight().Text(item.PricePerUnit.ToString("N2"));
                table.Cell().Element(BodyCell).AlignRight().Text(item.LineTotal.ToString("N2"));
            }
        });
    }

    private static IContainer HeaderCell(IContainer container)
    {
        return container
            .Background(Colors.Grey.Lighten2)
            .Border(1)
            .BorderColor(Colors.Grey.Lighten1)
            .Padding(5);
    }

    private static IContainer BodyCell(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(5);
    }
}