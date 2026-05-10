import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TEMP_CUSTOMER_ID = import.meta.env.VITE_TEMP_CUSTOMER_ID;

type PartRequest = {
    partRequestId: number;
    customerId: string;
    vehicleId: number | null;
    vehicleNumber: string;
    vehicleName: string;
    partName: string;
    partNumber: string | null;
    category: string;
    urgency: string;
    description: string;
    status: string;
    adminResponse: string | null;
    requestedAt: string;
    updatedAt: string | null;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    statusCode: number;
};

type PagedResult<T> = {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as ApiResponse<T>;
}

function MyPartRequests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState<PartRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [dateFilter, setDateFilter] = useState("All Time");
    const [requestToCancel, setRequestToCancel] = useState<PartRequest | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);

    useEffect(() => {
        loadPartRequests(pageNumber);
    }, [pageNumber]);

    const loadPartRequests = async (page: number) => {
        try {
            setIsLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/part-requests/customer/${TEMP_CUSTOMER_ID}?pageNumber=${page}&pageSize=${pageSize}`
            );

            const result = await readApiResponse<PagedResult<PartRequest>>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to load part requests.");
            }

            const pagedData = result.data;

            setRequests(pagedData.items ?? []);
            setTotalRecords(pagedData.totalRecords);
            setTotalPages(pagedData.totalPages);
            setHasPreviousPage(pagedData.hasPreviousPage);
            setHasNextPage(pagedData.hasNextPage);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not load part requests."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!requestToCancel) return;

        try {
            setIsCancelling(true);

            const response = await fetch(
                `${API_BASE_URL}/api/part-requests/${requestToCancel.partRequestId}/cancel`,
                {
                    method: "PUT",
                }
            );

            const result = await readApiResponse<PartRequest>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to cancel request.");
            }

            toast.success(result.message || "Part request cancelled successfully.");

            setRequests((prev) =>
                prev.map((request) =>
                    request.partRequestId === requestToCancel.partRequestId
                        ? result.data
                        : request
                )
            );

            setRequestToCancel(null);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while cancelling request."
            );
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredRequests = useMemo(() => {
        const now = new Date();

        return requests.filter((request) => {
            const search = searchText.toLowerCase().trim();

            const matchesSearch =
                !search ||
                request.partName.toLowerCase().includes(search) ||
                (request.partNumber ?? "").toLowerCase().includes(search) ||
                request.category.toLowerCase().includes(search) ||
                request.vehicleNumber.toLowerCase().includes(search) ||
                request.vehicleName.toLowerCase().includes(search) ||
                request.description.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "All Status" || request.status === statusFilter;

            const matchesCategory =
                categoryFilter === "All Categories" ||
                request.category === categoryFilter;

            const requestedDate = new Date(request.requestedAt);

            let matchesDate = true;

            if (dateFilter === "Recent") {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                matchesDate = requestedDate >= sevenDaysAgo;
            }

            if (dateFilter === "This Month") {
                matchesDate =
                    requestedDate.getMonth() === now.getMonth() &&
                    requestedDate.getFullYear() === now.getFullYear();
            }

            return matchesSearch && matchesStatus && matchesCategory && matchesDate;
        });
    }, [requests, searchText, statusFilter, categoryFilter, dateFilter]);

    const summary = useMemo(() => {
        return {
            total: requests.length,
            pending: requests.filter((r) => r.status === "Pending").length,
            available: requests.filter((r) => r.status === "Available").length,
            unavailable: requests.filter((r) => r.status === "Unavailable").length,
            cancelled: requests.filter((r) => r.status === "Cancelled").length,
        };
    }, [requests]);

    const categories = useMemo(() => {
        return Array.from(new Set(requests.map((r) => r.category))).filter(Boolean);
    }, [requests]);

    const resetFilters = () => {
        setSearchText("");
        setStatusFilter("All Status");
        setCategoryFilter("All Categories");
        setDateFilter("All Time");
        setPageNumber(1);
    };

    return (
        <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
            <main className="p-8 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                            <span
                                onClick={() => navigate("/")}
                                className="hover:text-[#00355f] cursor-pointer"
                            >
                                Dashboard
                            </span>
                            <span>›</span>
                            <span className="text-[#00355f] font-bold">
                                My Part Requests
                            </span>
                        </nav>

                        <h1 className="text-4xl font-bold text-[#00355f] mb-2">
                            My Part Requests
                        </h1>

                        <p className="text-base text-[#505f76] max-w-2xl">
                            Track your unavailable part requests, vehicle compatibility,
                            urgency level, and current request status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/parts/request")}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0f4c81] text-white rounded-lg font-bold shadow-lg hover:bg-[#00355f] hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Request New Part
                    </button>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                    <SummaryCard title="Total" value={summary.total} icon="list_alt" />
                    <SummaryCard title="Pending" value={summary.pending} icon="pending_actions" variant="pending" />
                    <SummaryCard title="Available" value={summary.available} icon="check_circle" variant="available" />
                    <SummaryCard title="Unavailable" value={summary.unavailable} icon="inventory_2" variant="unavailable" />
                    <SummaryCard title="Cancelled" value={summary.cancelled} icon="cancel" variant="cancelled" />
                </section>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-center gap-4">
                        <div className="flex-1 w-full relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                search
                            </span>

                            <input
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] outline-none"
                                placeholder="Search by part name, number, vehicle, category, or description..."
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <FilterSelect
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    "All Status",
                                    "Pending",
                                    "Reviewed",
                                    "Available",
                                    "Unavailable",
                                    "Cancelled",
                                ]}
                            />

                            <FilterSelect
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={["All Categories", ...categories]}
                            />

                            <FilterSelect
                                value={dateFilter}
                                onChange={setDateFilter}
                                options={["All Time", "Recent", "This Month"]}
                            />

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2.5 text-[#505f76] font-semibold hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    restart_alt
                                </span>
                                Reset
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <EmptyState
                            icon="progress_activity"
                            title="Loading part requests..."
                            message="Please wait while we fetch your submitted requests."
                        />
                    ) : filteredRequests.length === 0 ? (
                        <EmptyState
                            icon="inventory_2"
                            title="No part requests found"
                            message="No part request records match your current filter."
                        />
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <TableHead>Requested Date</TableHead>
                                            <TableHead>Part Details</TableHead>
                                            <TableHead>Vehicle Info</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Urgency</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead alignRight>Actions</TableHead>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredRequests.map((request) => (
                                            <PartRequestRow
                                                key={request.partRequestId}
                                                request={request}
                                                onView={() =>
                                                    navigate(`/parts/requests/${request.partRequestId}`)
                                                }
                                                onCancel={() => setRequestToCancel(request)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredRequests.map((request) => (
                                    <PartRequestMobileCard
                                        key={request.partRequestId}
                                        request={request}
                                        onView={() =>
                                            navigate(`/parts/requests/${request.partRequestId}`)
                                        }
                                        onCancel={() => setRequestToCancel(request)}
                                    />
                                ))}
                            </div>

                                    <div className="p-6 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Showing {filteredRequests.length} of {totalRecords} requests
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                                                disabled={!hasPreviousPage}
                                                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined">chevron_left</span>
                                            </button>

                                            <span className="px-4 py-2 rounded-lg bg-[#00355f] text-white text-sm font-bold">
                                                Page {pageNumber} of {totalPages || 1}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => setPageNumber((prev) => prev + 1)}
                                                disabled={!hasNextPage}
                                                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                        </>
                    )}
                </section>
            </main>
            {requestToCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#ba1a1a]">
                                    warning
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-[#191c1e]">
                                    Cancel Part Request?
                                </h3>
                                <p className="text-sm text-[#505f76]">
                                    This will mark your part request as cancelled.
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-[#42474f] bg-[#f2f4f6] rounded-xl p-4 mb-6">
                            Are you sure you want to cancel request for{" "}
                            <strong>{requestToCancel.partName}</strong>?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setRequestToCancel(null)}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-lg border border-slate-300 text-[#505f76] font-bold hover:bg-slate-50 disabled:opacity-60"
                            >
                                Keep
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelRequest}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-lg bg-[#ba1a1a] text-white font-bold hover:bg-red-700 disabled:opacity-60"
                            >
                                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    variant = "default",
}: {
    title: string;
    value: number;
    icon: string;
        variant?: "default" | "pending" | "available" | "unavailable" | "cancelled";
}) {
    const variantClass = {
        default: "text-[#00355f]",
        pending: "text-orange-700 border-b-4 border-orange-500",
        available: "text-emerald-600 border-b-4 border-emerald-500",
        unavailable: "text-[#783200] border-b-4 border-[#783200]",
        cancelled: "text-red-600 border-b-4 border-red-500",
    }[variant];

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 ${variantClass}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#505f76]">
                    {title}
                </span>
                <span className="material-symbols-outlined">{icon}</span>
            </div>

            <div className="text-3xl font-bold">{value.toString().padStart(2, "0")}</div>
        </div>
    );
}

function FilterSelect({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
}) {
    return (
        <div className="relative">
            <select
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-[#505f76] focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>

            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                expand_more
            </span>
        </div>
    );
}

function TableHead({
    children,
    alignRight = false,
}: {
    children: React.ReactNode;
    alignRight?: boolean;
}) {
    return (
        <th
            className={`px-6 py-4 text-xs font-semibold text-[#505f76] uppercase tracking-wider ${alignRight ? "text-right" : ""}`}
        >
            {children}
        </th>
    );
}

function PartRequestRow({
    request,
    onView,
    onCancel,
}: {
    request: PartRequest;
    onView: () => void;
        onCancel: () => void;
}) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="text-sm font-semibold text-[#00355f]">
                    {formatDate(request.requestedAt)}
                </div>
                <div className="text-xs text-[#505f76]">
                    {formatTime(request.requestedAt)}
                </div>
            </td>

            <td className="px-6 py-4 max-w-[260px]">
                <div className="text-sm font-bold text-slate-900">
                    {request.partName}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                    {request.partNumber || "No part number"}
                </div>
                <p className="text-xs text-[#505f76] line-clamp-1 mt-1">
                    {request.description}
                </p>
            </td>

            <td className="px-6 py-4">
                <div className="text-sm text-slate-700 font-semibold">
                    {request.vehicleNumber || "N/A"}
                </div>
                <div className="text-xs text-[#505f76]">
                    {request.vehicleName || "General request"}
                </div>
            </td>

            <td className="px-6 py-4">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-bold uppercase tracking-wider">
                    {request.category}
                </span>
            </td>

            <td className="px-6 py-4">
                <UrgencyBadge urgency={request.urgency} />
            </td>

            <td className="px-6 py-4">
                <StatusBadge status={request.status} />
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onView}
                        className="p-2 text-[#00355f] hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <span className="material-symbols-outlined">visibility</span>
                    </button>

                    {request.status === "Pending" && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Request"
                        >
                            <span className="material-symbols-outlined">cancel</span>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

function PartRequestMobileCard({
    request,
    onView,
    onCancel,
}: {
    request: PartRequest;
    onView: () => void;
        onCancel: () => void;
}) {
    return (
        <div className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
                <div>
                    <div className="font-semibold text-[#00355f]">
                        {request.partName}
                    </div>
                    <div className="text-xs text-[#505f76]">
                        {request.partNumber || "No part number"}
                    </div>
                </div>

                <StatusBadge status={request.status} />
            </div>

            <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-bold uppercase">
                    {request.category}
                </span>
                <UrgencyBadge urgency={request.urgency} />
            </div>

            <p className="text-xs text-[#505f76]">
                {request.vehicleName || "General part request"}
            </p>

            <p className="text-sm text-[#191c1e]">{request.description}</p>

            <div className="text-xs text-[#727780]">
                Requested on {formatDate(request.requestedAt)}
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    type="button"
                    onClick={onView}
                    className="flex-1 py-2 text-[#00355f] bg-blue-50 rounded-lg text-sm font-semibold"
                >
                    View Details
                </button>

                {request.status === "Pending" && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-semibold"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const className =
        status === "Pending"
            ? "bg-orange-100 text-orange-700"
            : status === "Reviewed"
                ? "bg-blue-100 text-blue-700"
                : status === "Available"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "Unavailable"
                        ? "bg-[#ffdbca] text-[#783200]"
                        : status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600";

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {status}
        </span>
    );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
    const className =
        urgency === "Emergency"
            ? "bg-red-100 text-red-700"
            : urgency === "Urgent"
                ? "bg-orange-100 text-orange-700"
                : "bg-slate-100 text-slate-600";

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${className}`}>
            {urgency}
        </span>
    );
}

function EmptyState({
    icon,
    title,
    message,
}: {
    icon: string;
    title: string;
    message: string;
}) {
    return (
        <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
                {icon}
            </span>
            <h3 className="text-xl font-bold text-[#00355f]">{title}</h3>
            <p className="text-sm text-[#505f76] mt-2">{message}</p>
        </div>
    );
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default MyPartRequests;