using Coursework.Application.DTOs.Reports;
using Coursework.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Application.Services;

public class FinancialReportService : IFinancialReportService
{
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly ISalesInvoiceItemRepository _salesInvoiceItemRepository;
    private readonly IPurchaseInvoiceItemRepository _purchaseInvoiceItemRepository;

    public FinancialReportService(
        ISalesInvoiceRepository salesInvoiceRepository,
        ISalesInvoiceItemRepository salesInvoiceItemRepository,
        IPurchaseInvoiceItemRepository purchaseInvoiceItemRepository)
    {
        _salesInvoiceRepository = salesInvoiceRepository;
        _salesInvoiceItemRepository = salesInvoiceItemRepository;
        _purchaseInvoiceItemRepository = purchaseInvoiceItemRepository;
    }

    public async Task<FinancialReportResponseDto> GetDailyReport(DateTime date)
    {
        var start = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var end = start.AddDays(1);

        return await BuildSinglePeriodReport(start, end, date.ToString("MMM dd, yyyy"));
    }

    public async Task<FinancialReportResponseDto> GetMonthlyReport(int year, int month)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        var sales = await _salesInvoiceRepository
            .FindByCondition(s => s.InvoiceDate >= start && s.InvoiceDate < end)
            .AsNoTracking()
            .ToListAsync();

        var purchaseItems = await _purchaseInvoiceItemRepository
            .FindByCondition(p =>
                p.PurchaseInvoice != null &&
                p.PurchaseInvoice.PurchaseDate >= start &&
                p.PurchaseInvoice.PurchaseDate < end)
            .Include(p => p.PurchaseInvoice)
            .AsNoTracking()
            .ToListAsync();

        var rows = sales
            .GroupBy(s => s.InvoiceDate.Date)
            .Select(g =>
            {
                var dayStart = DateTime.SpecifyKind(g.Key, DateTimeKind.Utc);
                var dayEnd = dayStart.AddDays(1);

                var dayPurchaseItems = purchaseItems
                    .Where(p =>
                        p.PurchaseInvoice != null &&
                        p.PurchaseInvoice.PurchaseDate >= dayStart &&
                        p.PurchaseInvoice.PurchaseDate < dayEnd);

                var salesRevenue = g.Sum(x => x.FinalAmount);
                var discount = g.Sum(x => x.DiscountAmount);
                var paid = g.Sum(x => x.PaidAmount);
                var credit = g.Sum(x => x.FinalAmount - x.PaidAmount);
                var purchaseCost = dayPurchaseItems.Sum(x => x.LineTotal);

                return new FinancialReportRowDto
                {
                    Period = dayStart.ToString("dd MMM"),
                    SalesRevenue = salesRevenue,
                    PurchaseCost = purchaseCost,
                    DiscountGiven = discount,
                    PaidAmount = paid,
                    CreditAmount = credit,
                    GrossProfit = salesRevenue - purchaseCost,
                    InvoiceCount = g.Count()
                };
            })
            .OrderBy(x => DateTime.ParseExact(x.Period, "dd MMM", null))
            .ToList();

        return new FinancialReportResponseDto
        {
            Rows = rows,
            TopSellingParts = await GetTopSellingParts(start, end)
        };
    }

    public async Task<FinancialReportResponseDto> GetYearlyReport(int year)
    {
        var start = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddYears(1);

        var sales = await _salesInvoiceRepository
            .FindByCondition(s => s.InvoiceDate >= start && s.InvoiceDate < end)
            .AsNoTracking()
            .ToListAsync();

        var purchaseItems = await _purchaseInvoiceItemRepository
            .FindByCondition(p =>
                p.PurchaseInvoice != null &&
                p.PurchaseInvoice.PurchaseDate >= start &&
                p.PurchaseInvoice.PurchaseDate < end)
            .Include(p => p.PurchaseInvoice)
            .AsNoTracking()
            .ToListAsync();

        var rows = sales
            .GroupBy(s => s.InvoiceDate.Month)
            .Select(g =>
            {
                var monthNumber = g.Key;

                var monthPurchaseItems = purchaseItems
                    .Where(p =>
                        p.PurchaseInvoice != null &&
                        p.PurchaseInvoice.PurchaseDate.Month == monthNumber);

                var salesRevenue = g.Sum(x => x.FinalAmount);
                var discount = g.Sum(x => x.DiscountAmount);
                var paid = g.Sum(x => x.PaidAmount);
                var credit = g.Sum(x => x.FinalAmount - x.PaidAmount);
                var purchaseCost = monthPurchaseItems.Sum(x => x.LineTotal);

                return new FinancialReportRowDto
                {
                    Period = new DateTime(year, monthNumber, 1).ToString("MMM"),
                    SalesRevenue = salesRevenue,
                    PurchaseCost = purchaseCost,
                    DiscountGiven = discount,
                    PaidAmount = paid,
                    CreditAmount = credit,
                    GrossProfit = salesRevenue - purchaseCost,
                    InvoiceCount = g.Count()
                };
            })
            .OrderBy(x => DateTime.ParseExact(x.Period, "MMM", null))
            .ToList();

        return new FinancialReportResponseDto
        {
            Rows = rows,
            TopSellingParts = await GetTopSellingParts(start, end)
        };
    }

    private async Task<FinancialReportResponseDto> BuildSinglePeriodReport(
        DateTime start,
        DateTime end,
        string period)
    {
        var sales = await _salesInvoiceRepository
            .FindByCondition(s => s.InvoiceDate >= start && s.InvoiceDate < end)
            .AsNoTracking()
            .ToListAsync();

        var purchaseItems = await _purchaseInvoiceItemRepository
            .FindByCondition(p =>
                p.PurchaseInvoice != null &&
                p.PurchaseInvoice.PurchaseDate >= start &&
                p.PurchaseInvoice.PurchaseDate < end)
            .Include(p => p.PurchaseInvoice)
            .AsNoTracking()
            .ToListAsync();

        var salesRevenue = sales.Sum(s => s.FinalAmount);
        var discount = sales.Sum(s => s.DiscountAmount);
        var paid = sales.Sum(s => s.PaidAmount);
        var credit = sales.Sum(s => s.FinalAmount - s.PaidAmount);
        var purchaseCost = purchaseItems.Sum(p => p.LineTotal);

        return new FinancialReportResponseDto
        {
            Rows = new List<FinancialReportRowDto>
            {
                new FinancialReportRowDto
                {
                    Period = period,
                    SalesRevenue = salesRevenue,
                    PurchaseCost = purchaseCost,
                    DiscountGiven = discount,
                    PaidAmount = paid,
                    CreditAmount = credit,
                    GrossProfit = salesRevenue - purchaseCost,
                    InvoiceCount = sales.Count
                }
            },
            TopSellingParts = await GetTopSellingParts(start, end)
        };
    }

    private async Task<List<TopSellingPartDto>> GetTopSellingParts(DateTime start, DateTime end)
    {
        return await _salesInvoiceItemRepository
            .FindByCondition(i =>
                i.SalesInvoice.InvoiceDate >= start &&
                i.SalesInvoice.InvoiceDate < end)
            .AsNoTracking()
            .GroupBy(i => new
            {
                i.Part.PartName,
                i.Part.PartNumber,
                i.Part.StockQuantity
            })
            .Select(g => new TopSellingPartDto
            {
                PartName = g.Key.PartName,
                PartNumber = g.Key.PartNumber,
                QuantitySold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.LineTotal),
                CurrentStock = g.Key.StockQuantity
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(5)
            .ToListAsync();
    }
}