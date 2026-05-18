import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


type ReportType = "Daily" | "Monthly" | "Yearly";

type FinancialRow = {
    period: string;
    salesRevenue: number;
    purchaseCost: number;
    discountGiven: number;
    paidAmount: number;
    creditAmount: number;
    grossProfit: number;
    invoiceCount: number;
};

type TopSellingPart = {
    partName: string;
    partNumber: string;
    quantitySold: number;
    revenue: number;
    currentStock: number;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    statusCode: number;
};

type FinancialReportResponse = {
    rows: FinancialRow[];
    topSellingParts: TopSellingPart[];
};

function FinancialReports() {
    const [reportType, setReportType] = useState<ReportType>("Daily");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const [reportRows, setReportRows] = useState<FinancialRow[]>([]);
    const [topSellingParts, setTopSellingParts] = useState<TopSellingPart[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const summary = useMemo(() => buildSummary(reportRows), [reportRows]);

    const comparisonChartData = [
        { label: "Sales Revenue", value: summary.totalRevenue },
        { label: "Purchase Cost", value: summary.totalPurchaseCost },
        { label: "Gross Profit", value: summary.grossProfit },
        { label: "Paid Amount", value: summary.totalPaid },
        { label: "Pending Credit", value: summary.totalCredit },
        { label: "Discount Given", value: summary.totalDiscount },
    ];

    const maxComparisonValue = Math.max(
        ...comparisonChartData.map((item) => Math.abs(item.value)),
        1
    );

    const bestRevenuePeriod = reportRows.length > 0
        ? reportRows.reduce((best, row) =>
            row.salesRevenue > best.salesRevenue ? row : best
        )
        : null;

    const highestProfitPeriod = reportRows.length > 0
        ? reportRows.reduce((best, row) =>
            row.grossProfit > best.grossProfit ? row : best
        )
        : null;

    const highestCreditPeriod = reportRows.length > 0
        ? reportRows.reduce((best, row) =>
            row.creditAmount > best.creditAmount ? row : best
        )
        : null;

    const getSelectedPeriodLabel = () => {
        if (reportType === "Daily") {
            return selectedDate || "N/A";
        }

        if (reportType === "Monthly") {
            return selectedMonth || "N/A";
        }

        return selectedYear || "N/A";
    };

    const fetchFinancialReport = async (): Promise<FinancialReportResponse | null> => {
        let url = "";

        if (reportType === "Daily") {
            if (!selectedDate) {
                toast.error("Please select a date.");
                return null;
            }

            url = `${API_BASE_URL}/api/admin/reports/financial/daily?date=${selectedDate}`;
        }

        if (reportType === "Monthly") {
            if (!selectedMonth) {
                toast.error("Please select a month.");
                return null;
            }

            const [year, month] = selectedMonth.split("-");
            url = `${API_BASE_URL}/api/admin/reports/financial/monthly?year=${year}&month=${Number(month)}`;
        }

        if (reportType === "Yearly") {
            if (!selectedYear) {
                toast.error("Please select a year.");
                return null;
            }

            url = `${API_BASE_URL}/api/admin/reports/financial/yearly?year=${selectedYear}`;
        }

        try {
            setIsGenerating(true);

            const response = await fetch(url);
            const result: ApiResponse<FinancialReportResponse> = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to generate financial report.");
            }

            const data = result.data ?? { rows: [], topSellingParts: [] };

            setReportRows(data.rows ?? []);
            setTopSellingParts(data.topSellingParts ?? []);

            toast.success(result.message || `${reportType} financial report generated successfully.`);
            return data;
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while generating report."
            );
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateReport = async () => {
        await fetchFinancialReport();
    };

    const handleDownloadPdf = async () => {
        let rowsForPdf = reportRows;
        let topPartsForPdf = topSellingParts;

        if (rowsForPdf.length === 0) {
            const generatedReport = await fetchFinancialReport();

            if (!generatedReport) {
                return;
            }

            rowsForPdf = generatedReport.rows ?? [];
            topPartsForPdf = generatedReport.topSellingParts ?? [];
        }

        if (rowsForPdf.length === 0) {
            toast.error("No report data found to export.");
            return;
        }

        try {
            generateFinancialReportPdf(
                rowsForPdf,
                topPartsForPdf,
                reportType,
                getSelectedPeriodLabel()
            );

            toast.success("PDF downloaded successfully.");
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Failed to download PDF.");
        }
    };

    const resetFilters = () => {
        setReportType("Daily");
        setSelectedDate("");
        setSelectedMonth("");
        setSelectedYear(new Date().getFullYear().toString());
        setReportRows([]);
        setTopSellingParts([]);
    };

    return (
        <div className="bg-[#f7f9fb] text-[#191c1e]">
            <main className="p-8 max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                            <span>Dashboard</span>
                            <span>›</span>
                            <span>Reports</span>
                            <span>›</span>
                            <span className="text-[#00355f] font-bold">Financial Reports</span>
                        </nav>

                        <h1 className="text-4xl font-bold text-[#00355f] mb-2">
                            Financial Reports
                        </h1>

                        <p className="text-base text-[#505f76] max-w-2xl">
                            Generate daily, monthly, and yearly financial reports for revenue,
                            purchase cost, profit, discounts, payments, and pending credit.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className="px-5 py-2.5 rounded-lg border border-slate-300 text-[#505f76] font-bold bg-white hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-lg">description</span>
                            {isGenerating ? "Generating..." : "Generate Report"}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="px-5 py-2.5 rounded-lg bg-[#0f4c81] text-white font-bold hover:bg-[#00355f] transition-all shadow-lg flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Download PDF
                        </button>
                    </div>
                </header>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6 mb-8">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-semibold text-[#00355f] mb-2">
                                Report Filter
                            </h2>
                            <p className="text-sm text-[#505f76]">
                                Select report type and period before generating the report.
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                            <div className="flex p-1 bg-[#eceef0] rounded-xl h-12">
                                {(["Daily", "Monthly", "Yearly"] as ReportType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setReportType(type)}
                                        className={
                                            reportType === type
                                                ? "px-6 rounded-lg bg-white text-[#00355f] font-bold shadow-sm"
                                                : "px-6 rounded-lg text-[#505f76] font-bold hover:bg-white/60"
                                        }
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {reportType === "Daily" && (
                                <FilterField label="Select Date">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20"
                                    />
                                </FilterField>
                            )}

                            {reportType === "Monthly" && (
                                <FilterField label="Select Month">
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20"
                                    />
                                </FilterField>
                            )}

                            {reportType === "Yearly" && (
                                <FilterField label="Select Year">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="h-12 rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20"
                                    >
                                        {Array.from({ length: 10 }, (_, index) => {
                                            const year = new Date().getFullYear() - index;
                                            return (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </FilterField>
                            )}

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="h-12 px-5 rounded-lg border border-slate-300 text-[#505f76] font-bold bg-white hover:bg-slate-50"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                    <SummaryCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon="payments" variant="primary" note="Based on selected report" />
                    <SummaryCard title="Purchase Cost" value={formatCurrency(summary.totalPurchaseCost)} icon="shopping_cart" variant="neutral" note="Cost from purchase invoices" />
                    <SummaryCard title="Gross Profit" value={formatCurrency(summary.grossProfit)} icon="account_balance_wallet" variant={summary.grossProfit >= 0 ? "success" : "danger"} note={summary.grossProfit >= 0 ? "Profitable period" : "Loss detected"} />
                    <SummaryCard title="Sales Invoices" value={summary.totalInvoices.toString()} icon="receipt_long" variant="neutral" note="Completed sales only" />
                    <SummaryCard title="Pending Credit" value={formatCurrency(summary.totalCredit)} icon="priority_high" variant="danger" note="Requires follow-up" />
                </section>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-[#00355f]">
                                Financial Comparison
                            </h3>
                            <p className="text-sm text-[#505f76]">
                                Compare revenue, cost, profit, payment, credit, and discount for selected {reportType.toLowerCase()} report.
                            </p>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0f4c81] text-xs font-bold w-fit">
                            {reportType}
                        </span>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-5">
                        {comparisonChartData.map((item) => {
                            const height = Math.max(
                                8,
                                (Math.abs(item.value) / maxComparisonValue) * 100
                            );

                            const barColor =
                                item.label === "Sales Revenue"
                                    ? "bg-[#0f4c81]"
                                    : item.label === "Purchase Cost"
                                        ? "bg-orange-500"
                                        : item.label === "Gross Profit" && item.value >= 0
                                            ? "bg-emerald-500"
                                            : item.label === "Gross Profit" && item.value < 0
                                                ? "bg-red-500"
                                                : item.label === "Paid Amount"
                                                    ? "bg-emerald-500"
                                                    : item.label === "Pending Credit"
                                                        ? "bg-red-500"
                                                        : "bg-yellow-500";

                            return (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-3">
                                    <p className="text-sm font-bold text-[#191c1e] text-center">
                                        {formatCurrency(item.value)}
                                    </p>

                                    <div className="w-full h-52 bg-slate-50 rounded-t-xl flex items-end overflow-hidden">
                                        <div
                                            className={`w-full ${barColor} rounded-t-xl transition-all`}
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>

                                    <span className="text-xs text-[#505f76] font-bold text-center">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <ComparisonInsight
                            title="Best Revenue Period"
                            value={bestRevenuePeriod?.period ?? "N/A"}
                            note={bestRevenuePeriod ? `${formatCurrency(bestRevenuePeriod.salesRevenue)} revenue generated` : "Generate report to view insight"}
                        />

                        <ComparisonInsight
                            title="Highest Profit Period"
                            value={highestProfitPeriod?.period ?? "N/A"}
                            note={highestProfitPeriod ? `${formatCurrency(highestProfitPeriod.grossProfit)} gross profit` : "Generate report to view insight"}
                        />

                        <ComparisonInsight
                            title="Highest Credit Period"
                            value={highestCreditPeriod?.period ?? "N/A"}
                            note={highestCreditPeriod ? `${formatCurrency(highestCreditPeriod.creditAmount)} pending credit` : "Generate report to view insight"}
                        />
                    </div>
                </section>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="text-xl font-semibold text-[#00355f]">
                                Detailed Financial Report
                            </h3>
                            <p className="text-sm text-[#505f76]">
                                Daily report shows one row. Monthly report shows each day. Yearly report shows each month.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="px-4 py-2 rounded-lg bg-blue-50 text-[#0f4c81] font-bold hover:bg-blue-100 flex items-center gap-2 w-fit"
                        >
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Download PDF
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <TableHead>Date / Period</TableHead>
                                    <TableHead>Sales Revenue</TableHead>
                                    <TableHead>Purchase Cost</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Paid Amount</TableHead>
                                    <TableHead>Credit</TableHead>
                                    <TableHead>Profit</TableHead>
                                    <TableHead>Invoices</TableHead>
                                    <TableHead>Status</TableHead>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {reportRows.map((row) => (
                                    <tr key={row.period} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-semibold text-[#00355f]">{row.period}</td>
                                        <td className="px-6 py-4">{formatCurrency(row.salesRevenue)}</td>
                                        <td className="px-6 py-4 text-[#505f76]">{formatCurrency(row.purchaseCost)}</td>
                                        <td className="px-6 py-4 text-red-600">-{formatCurrency(row.discountGiven)}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-semibold">{formatCurrency(row.paidAmount)}</td>
                                        <td className="px-6 py-4 text-orange-700 font-semibold">{formatCurrency(row.creditAmount)}</td>
                                        <td className={row.grossProfit >= 0 ? "px-6 py-4 text-emerald-600 font-bold" : "px-6 py-4 text-red-600 font-bold"}>
                                            {formatCurrency(row.grossProfit)}
                                        </td>
                                        <td className="px-6 py-4">{row.invoiceCount}</td>
                                        <td className="px-6 py-4">
                                            <ReportStatusBadge row={row} />
                                        </td>
                                    </tr>
                                ))}

                                {reportRows.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-[#505f76]">
                                            Select a period and generate report to view financial details.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <h3 className="text-xl font-semibold text-[#00355f] mb-6">
                            Top Selling Parts
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left table-fixed">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="w-[30%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">Part Name</th>
                                        <th className="w-[22%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">Part Number</th>
                                        <th className="w-[14%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">Qty Sold</th>
                                        <th className="w-[18%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">Revenue</th>
                                        <th className="w-[16%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">Stock</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {topSellingParts.map((part) => (
                                        <tr key={part.partNumber}>
                                            <td className="px-4 py-5 font-bold text-[#191c1e] whitespace-nowrap">{part.partName}</td>
                                            <td className="px-4 py-5 text-slate-500 font-mono text-sm whitespace-nowrap">{part.partNumber}</td>
                                            <td className="px-4 py-5 whitespace-nowrap">{part.quantitySold}</td>
                                            <td className="px-4 py-5 text-[#0f4c81] font-bold whitespace-nowrap">{formatCurrency(part.revenue)}</td>
                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <span className={part.currentStock < 10
                                                    ? "inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"
                                                    : "inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"
                                                }>
                                                    {part.currentStock} units
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {topSellingParts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-[#505f76]">
                                                No top selling parts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="xl:col-span-4 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <h3 className="text-xl font-semibold text-[#00355f] mb-4">
                            PDF Report Summary
                        </h3>

                        <div className="space-y-4 text-sm">
                            <SummaryLine label="Report Type" value={reportType} />
                            <SummaryLine label="Selected Period" value={getSelectedPeriodLabel()} />
                            <SummaryLine label="Generated Date" value={new Date().toLocaleDateString()} />
                            <SummaryLine label="Total Records" value={reportRows.length.toString()} />
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="mt-6 w-full h-12 rounded-lg bg-[#0f4c81] text-white font-bold hover:bg-[#00355f] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">picture_as_pdf</span>
                            Download PDF
                        </button>

                        <p className="text-xs text-[#505f76] mt-3">
                            PDF includes summary, comparison chart, detailed report, and top selling parts.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#727780] uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    note,
    variant,
}: {
    title: string;
    value: string;
    icon: string;
    note: string;
    variant: "primary" | "success" | "danger" | "neutral";
}) {
    const variantClass = {
        primary: "border-l-4 border-[#0f4c81]",
        success: "border-l-4 border-emerald-500",
        danger: "border-l-4 border-red-500",
        neutral: "border-l-4 border-slate-300",
    }[variant];

    const iconClass = {
        primary: "bg-blue-50 text-[#0f4c81]",
        success: "bg-emerald-50 text-emerald-600",
        danger: "bg-red-50 text-red-600",
        neutral: "bg-slate-50 text-slate-600",
    }[variant];

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] ${variantClass}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${iconClass}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>

            <p className="text-xs text-[#727780] uppercase tracking-wider font-bold mb-1">
                {title}
            </p>
            <h3 className="text-xl font-bold text-[#191c1e]">{value}</h3>
            <p className="text-xs text-[#505f76] mt-2">{note}</p>
        </div>
    );
}

function ComparisonInsight({
    title,
    value,
    note,
}: {
    title: string;
    value: string;
    note: string;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-[#727780] uppercase tracking-wider font-bold">
                {title}
            </p>
            <h4 className="text-2xl font-bold text-[#00355f] mt-1">
                {value}
            </h4>
            <p className="text-xs text-[#505f76] mt-1">
                {note}
            </p>
        </div>
    );
}

function TableHead({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-6 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
            {children}
        </th>
    );
}

function ReportStatusBadge({ row }: { row: FinancialRow }) {
    if (row.grossProfit < 0) {
        return (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                LOSS
            </span>
        );
    }

    if (row.creditAmount > 0) {
        return (
            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold">
                PENDING PAYMENT
            </span>
        );
    }

    return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
            PROFITABLE
        </span>
    );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[#505f76]">{label}</span>
            <span className="font-bold text-[#191c1e]">{value}</span>
        </div>
    );
}

function buildSummary(rows: FinancialRow[]) {
    return {
        totalRevenue: rows.reduce((sum, row) => sum + row.salesRevenue, 0),
        totalPurchaseCost: rows.reduce((sum, row) => sum + row.purchaseCost, 0),
        totalDiscount: rows.reduce((sum, row) => sum + row.discountGiven, 0),
        totalPaid: rows.reduce((sum, row) => sum + row.paidAmount, 0),
        totalCredit: rows.reduce((sum, row) => sum + row.creditAmount, 0),
        grossProfit: rows.reduce((sum, row) => sum + row.grossProfit, 0),
        totalInvoices: rows.reduce((sum, row) => sum + row.invoiceCount, 0),
    };
}

function generateFinancialReportPdf(
    rows: FinancialRow[],
    topSellingParts: TopSellingPart[],
    reportType: ReportType,
    selectedPeriod: string
) {
    const summary = buildSummary(rows);

    const comparisonChartData = [
        { label: "Sales Revenue", value: summary.totalRevenue },
        { label: "Purchase Cost", value: summary.totalPurchaseCost },
        { label: "Gross Profit", value: summary.grossProfit },
        { label: "Paid Amount", value: summary.totalPaid },
        { label: "Pending Credit", value: summary.totalCredit },
        { label: "Discount Given", value: summary.totalDiscount },
    ];

    const maxComparisonValue = Math.max(
        ...comparisonChartData.map((item) => Math.abs(item.value)),
        1
    );

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let y = 18;

    const addFooter = () => {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text("AutoCare IMS | Admin Financial Report", 14, pageHeight - 10);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 58, pageHeight - 10);
    };

    const checkPage = (neededHeight = 20) => {
        if (y + neededHeight > pageHeight - 20) {
            addFooter();
            pdf.addPage();
            y = 18;
        }
    };

    pdf.setFillColor(15, 76, 129);
    pdf.rect(0, 0, pageWidth, 34, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("AutoCare IMS", 14, 15);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Financial Report", 14, 24);

    pdf.setFontSize(10);
    pdf.text(`Report Type: ${reportType}`, pageWidth - 60, 15);
    pdf.text(`Selected Period: ${selectedPeriod}`, pageWidth - 60, 23);

    y = 46;

    pdf.setTextColor(15, 76, 129);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary", 14, y);

    y += 8;

    const cardWidth = 58;
    const cardHeight = 24;
    const gap = 6;

    const summaryCards = [
        ["Total Revenue", formatCurrency(summary.totalRevenue)],
        ["Purchase Cost", formatCurrency(summary.totalPurchaseCost)],
        ["Gross Profit", formatCurrency(summary.grossProfit)],
        ["Paid Amount", formatCurrency(summary.totalPaid)],
        ["Pending Credit", formatCurrency(summary.totalCredit)],
        ["Discount Given", formatCurrency(summary.totalDiscount)],
    ];

    summaryCards.forEach((card, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);

        const x = 14 + col * (cardWidth + gap);
        const cardY = y + row * (cardHeight + gap);

        pdf.setFillColor(247, 249, 251);
        pdf.setDrawColor(220, 225, 230);
        pdf.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "FD");

        pdf.setTextColor(80, 95, 118);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(card[0], x + 4, cardY + 8);

        pdf.setTextColor(15, 76, 129);
        pdf.setFontSize(11);
        pdf.text(card[1], x + 4, cardY + 17);
    });

    y += 70;

    checkPage(75);

    pdf.setTextColor(15, 76, 129);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text("Financial Comparison", 14, y);

    y += 10;

    const chartX = 18;
    const chartY = y;
    const chartHeight = 45;
    const barWidth = 22;
    const barGap = 10;

    comparisonChartData.forEach((item, index) => {
        const barHeight = (Math.abs(item.value) / maxComparisonValue) * chartHeight;
        const x = chartX + index * (barWidth + barGap);
        const barY = chartY + chartHeight - barHeight;

        if (item.label === "Sales Revenue") {
            pdf.setFillColor(15, 76, 129);
        } else if (item.label === "Purchase Cost") {
            pdf.setFillColor(249, 115, 22);
        } else if (item.label === "Gross Profit" && item.value >= 0) {
            pdf.setFillColor(22, 163, 74);
        } else if (item.label === "Gross Profit" && item.value < 0) {
            pdf.setFillColor(220, 38, 38);
        } else if (item.label === "Paid Amount") {
            pdf.setFillColor(16, 185, 129);
        } else if (item.label === "Pending Credit") {
            pdf.setFillColor(239, 68, 68);
        } else {
            pdf.setFillColor(234, 179, 8);
        }

        pdf.roundedRect(x, barY, barWidth, barHeight, 2, 2, "F");

        pdf.setTextColor(25, 28, 30);
        pdf.setFontSize(7);

        const valueText = formatCurrency(item.value);
        const valueTextWidth = pdf.getTextWidth(valueText);
        pdf.text(valueText, x + barWidth / 2 - valueTextWidth / 2, barY - 3);

        pdf.setTextColor(80, 95, 118);

        const labelText = item.label;
        const labelTextWidth = pdf.getTextWidth(labelText);
        pdf.text(labelText, x + barWidth / 2 - labelTextWidth / 2, chartY + chartHeight + 6);
    });

    y += 70;

    checkPage(50);

    pdf.setTextColor(15, 76, 129);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Financial Report", 14, y);

    y += 8;

    pdf.setFillColor(15, 76, 129);
    pdf.rect(14, y, 182, 9, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("Period", 16, y + 6);
    pdf.text("Revenue", 50, y + 6);
    pdf.text("Cost", 82, y + 6);
    pdf.text("Discount", 108, y + 6);
    pdf.text("Paid", 138, y + 6);
    pdf.text("Profit", 166, y + 6);

    y += 9;

    rows.forEach((row, index) => {
        checkPage(12);

        const fill = index % 2 === 0 ? 255 : 247;
        pdf.setFillColor(fill, fill === 255 ? 255 : 249, fill === 255 ? 255 : 251);
        pdf.rect(14, y, 182, 10, "F");

        pdf.setTextColor(25, 28, 30);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");

        pdf.text(row.period, 16, y + 6);
        pdf.text(formatCurrency(row.salesRevenue), 50, y + 6);
        pdf.text(formatCurrency(row.purchaseCost), 82, y + 6);
        pdf.text(formatCurrency(row.discountGiven), 108, y + 6);
        pdf.text(formatCurrency(row.paidAmount), 138, y + 6);

        if (row.grossProfit >= 0) {
            pdf.setTextColor(22, 163, 74);
        } else {
            pdf.setTextColor(220, 38, 38);
        }

        pdf.text(formatCurrency(row.grossProfit), 166, y + 6);

        y += 10;
    });

    y += 12;

    checkPage(50);

    pdf.setTextColor(15, 76, 129);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text("Top Selling Parts", 14, y);

    y += 8;

    pdf.setFillColor(15, 76, 129);
    pdf.rect(14, y, 182, 9, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("Part Name", 16, y + 6);
    pdf.text("Part Number", 75, y + 6);
    pdf.text("Qty", 120, y + 6);
    pdf.text("Revenue", 140, y + 6);
    pdf.text("Stock", 172, y + 6);

    y += 9;

    topSellingParts.forEach((part, index) => {
        checkPage(12);

        const fill = index % 2 === 0 ? 255 : 247;
        pdf.setFillColor(fill, fill === 255 ? 255 : 249, fill === 255 ? 255 : 251);
        pdf.rect(14, y, 182, 10, "F");

        pdf.setTextColor(25, 28, 30);
        pdf.setFontSize(8);

        pdf.text(part.partName.substring(0, 28), 16, y + 6);
        pdf.text(part.partNumber, 75, y + 6);
        pdf.text(part.quantitySold.toString(), 120, y + 6);
        pdf.text(formatCurrency(part.revenue), 140, y + 6);

        if (part.currentStock < 10) {
            pdf.setTextColor(220, 38, 38);
        } else {
            pdf.setTextColor(22, 163, 74);
        }

        pdf.text(`${part.currentStock} units`, 172, y + 6);

        y += 10;
    });

    addFooter();

    pdf.save(`financial-report-${selectedPeriod}.pdf`);
}

function formatCurrency(value: number) {
    return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default FinancialReports;