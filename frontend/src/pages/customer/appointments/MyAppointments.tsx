import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../shared/auth/useAuth";
import { apiRequest, getApiErrorMessage } from "../../../shared/utils/api";
import "./MyAppointments.css";

type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Rejected" | string;

type Appointment = {
    appointmentId: number;
    customerId: string;
    vehicleId: number;
    vehicleNumber: string;
    vehicleName: string;
    appointmentDate: string;
    alternativeAppointmentDate: string | null;
    serviceType: string;
    urgency: string;
    issueDescription: string;
    status: AppointmentStatus;
    createdAt?: string;
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
function MyAppointments() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [dateFilter, setDateFilter] = useState("All Dates");

    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);

    const loadAppointments = useCallback(
        async (page: number) => {
            if (!user?.userId) {
                return;
            }

            try {
                setIsLoading(true);

                const result = await apiRequest<PagedResult<Appointment>>(
                    `/api/appointments/customer/${user.userId}?pageNumber=${page}&pageSize=${pageSize}`
                );

                if (!result.success || !result.data) {
                    throw new Error(getApiErrorMessage(result));
                }

                const pagedData = result.data;

                setAppointments(pagedData.items ?? []);
                setTotalRecords(pagedData.totalRecords);
                setTotalPages(pagedData.totalPages);
                setHasPreviousPage(pagedData.hasPreviousPage);
                setHasNextPage(pagedData.hasNextPage);
            } catch (error) {
                console.error(error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Could not load appointments.",
                    { toastId: "load-appointments-error" }
                );
            } finally {
                setIsLoading(false);
            }
        },
        [user?.userId, pageSize]
    );

    useEffect(() => {
        if (!user?.userId) {
            return;
        }

        void loadAppointments(pageNumber);
    }, [pageNumber, user?.userId, loadAppointments]);

    const handleCancelAppointment = async () => {
        if (!appointmentToCancel) return;

        try {
            setIsCancelling(true);

            const result = await apiRequest<Appointment>(
                `/api/appointments/${appointmentToCancel.appointmentId}/cancel`,
                {
                    method: "PATCH",
                }
            );

            if (!result.success || !result.data) {
                throw new Error(getApiErrorMessage(result));
            }

            toast.success(result.message || "Appointment cancelled successfully.");

            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.appointmentId === appointmentToCancel.appointmentId
                        ? (result.data ?? appointment)
                        : appointment
                )
            );

            setAppointmentToCancel(null);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while cancelling appointment.",
                { toastId: "cancel-appointment-error" }
            );
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredAppointments = useMemo(() => {
        const now = new Date();

        return appointments.filter((appointment) => {
            const search = searchText.toLowerCase().trim();

            const matchesSearch =
                !search ||
                appointment.vehicleNumber.toLowerCase().includes(search) ||
                appointment.vehicleName.toLowerCase().includes(search) ||
                appointment.issueDescription.toLowerCase().includes(search) ||
                appointment.serviceType.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "All Status" || appointment.status === statusFilter;

            const appointmentDate = new Date(appointment.appointmentDate);

            let matchesDate = true;

            if (dateFilter === "Upcoming") {
                matchesDate = appointmentDate >= now;
            }

            if (dateFilter === "Past") {
                matchesDate = appointmentDate < now;
            }

            if (dateFilter === "This Month") {
                matchesDate =
                    appointmentDate.getMonth() === now.getMonth() &&
                    appointmentDate.getFullYear() === now.getFullYear();
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [appointments, searchText, statusFilter, dateFilter]);

    const summary = useMemo(() => {
        return {
            total: appointments.length,
            pending: appointments.filter((a) => a.status === "Pending").length,
            confirmed: appointments.filter((a) => a.status === "Confirmed").length,
            completed: appointments.filter((a) => a.status === "Completed").length,
            cancelled: appointments.filter((a) => a.status === "Cancelled").length,
        };
    }, [appointments]);

    const resetFilters = () => {
        setSearchText("");
        setStatusFilter("All Status");
        setDateFilter("All Dates");
        setPageNumber(1);
    };

    return (
        <div className="my-appointments-page">
            <main className="my-appointments-container">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
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
                                My Appointments
                            </span>
                        </nav>

                        <h1 className="font-headline-xl text-4xl font-bold text-[#00355f]">
                            My Appointments
                        </h1>

                        <p className="text-base text-[#505f76] mt-2">
                            View and track all your service appointment requests and their current status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/appointments/book")}
                        className="bg-[#0f4c81] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Book New Appointment
                    </button>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                    <SummaryCard title="Total" value={summary.total} icon="list_alt" />
                    <SummaryCard title="Pending" value={summary.pending} icon="pending_actions" variant="pending" />
                    <SummaryCard title="Confirmed" value={summary.confirmed} icon="check_circle" variant="confirmed" />
                    <SummaryCard title="Completed" value={summary.completed} icon="task_alt" variant="completed" />
                    <SummaryCard title="Cancelled" value={summary.cancelled} icon="cancel" variant="cancelled" />
                </section>

                <section className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] mb-6 border border-slate-100 flex flex-col lg:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            search
                        </span>

                        <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20 outline-none text-sm"
                            placeholder="Search by vehicle number, service type, or issue..."
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                        {/* STATUS DROPDOWN */}
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Confirmed</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                                <option>Rejected</option>
                            </select>

                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                expand_more
                            </span>
                        </div>

                        {/* DATE DROPDOWN */}
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option>All Dates</option>
                                <option>Upcoming</option>
                                <option>Past</option>
                                <option>This Month</option>
                            </select>

                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                expand_more
                            </span>
                        </div>

                        {/* RESET BUTTON (keep same) */}
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="px-4 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                restart_alt
                            </span>
                            Reset
                        </button>
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                    {isLoading ? (
                        <EmptyState
                            icon="progress_activity"
                            title="Loading appointments..."
                            message="Please wait while we fetch your appointment requests."
                        />
                    ) : filteredAppointments.length === 0 ? (
                        <EmptyState
                            icon="event_busy"
                            title="No appointments found"
                            message="No appointment records match your current filter."
                        />
                    ) : (
                                <>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <TableHead>Appointment Date</TableHead>
                                                    <TableHead>Vehicle</TableHead>
                                                    <TableHead>Service / Issue</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Urgency</TableHead>
                                                    <TableHead alignRight>Actions</TableHead>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {filteredAppointments.map((appointment) => (
                                                    <AppointmentRow
                                                        key={appointment.appointmentId}
                                                        appointment={appointment}
                                                        onView={() =>
                                                            navigate(`/appointments/${appointment.appointmentId}`)
                                                        }
                                                        onCancel={() => setAppointmentToCancel(appointment)}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="md:hidden divide-y divide-slate-100">
                                        {filteredAppointments.map((appointment) => (
                                            <AppointmentMobileCard
                                                key={appointment.appointmentId}
                                                appointment={appointment}
                                                onView={() =>
                                                    navigate(`/appointments/${appointment.appointmentId}`)
                                                }
                                                onCancel={() => setAppointmentToCancel(appointment)}
                                            />
                                        ))}
                                    </div>

                                    <div className="p-6 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Showing {filteredAppointments.length} of {totalRecords} appointments
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

                <button
                    type="button"
                    onClick={() => navigate("/appointments/book")}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#00355f] shadow-2xl rounded-full flex items-center justify-center text-white active:scale-95 transition-all z-50"
                >
                    <span className="material-symbols-outlined text-[32px]">
                        calendar_add_on
                    </span>
                </button>
            </main>

            {appointmentToCancel && (
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
                                    Cancel Appointment?
                                </h3>
                                <p className="text-sm text-[#505f76]">
                                    This will mark your booking as cancelled.
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-[#42474f] bg-[#f2f4f6] rounded-xl p-4 mb-6">
                            Are you sure you want to cancel appointment for{" "}
                            <strong>{appointmentToCancel.vehicleNumber}</strong> on{" "}
                            <strong>{formatDate(appointmentToCancel.appointmentDate)}</strong>?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setAppointmentToCancel(null)}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-lg border border-slate-300 text-[#505f76] font-bold hover:bg-slate-50 disabled:opacity-60"
                            >
                                Keep
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelAppointment}
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
    variant?: "default" | "pending" | "confirmed" | "completed" | "cancelled";
}) {
    const variantClass = {
        default: "text-[#00355f]",
        pending: "text-orange-700 border-b-4 border-orange-500",
        confirmed: "text-blue-600 border-b-4 border-blue-500",
        completed: "text-emerald-600 border-b-4 border-emerald-500",
        cancelled: "text-red-600 border-b-4 border-red-500",
    }[variant];

    return (
        <div className={`bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 bento-card ${variantClass}`}>
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

function TableHead({
    children,
    alignRight = false,
}: {
    children: React.ReactNode;
    alignRight?: boolean;
}) {
    return (
        <th
            className={`px-6 py-4 text-xs font-semibold text-[#505f76] uppercase tracking-wider ${alignRight ? "text-right" : ""
                }`}
        >
            {children}
        </th>
    );
}

function AppointmentRow({
    appointment,
    onView,
    onCancel,
}: {
    appointment: Appointment;
    onView: () => void;
    onCancel: () => void;
}) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-4">
                <div className="text-sm font-semibold text-[#00355f]">
                    {formatDate(appointment.appointmentDate)}
                </div>
                <div className="text-xs text-[#505f76]">
                    {formatTime(appointment.appointmentDate)}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="text-sm text-[#00355f] font-medium">
                    {appointment.vehicleNumber}
                </div>
                <div className="text-xs text-[#505f76]">
                    {appointment.vehicleName}
                </div>
            </td>

            <td className="px-6 py-4 max-w-[320px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                        build
                    </span>
                    <span className="text-sm text-[#191c1e] font-semibold">
                        {appointment.serviceType}
                    </span>
                </div>
                <p className="text-xs text-[#505f76] line-clamp-1">
                    {appointment.issueDescription}
                </p>
            </td>

            <td className="px-6 py-4">
                <StatusBadge status={appointment.status} />
            </td>

            <td className="px-6 py-4">
                <UrgencyBadge urgency={appointment.urgency} />
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

                    {appointment.status === "Completed" ? (
                        <button
                            type="button"
                            onClick={onView}
                            className="flex items-center gap-2 px-3 py-1.5 text-blue-700 font-semibold border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">
                                rate_review
                            </span>
                            Review
                        </button>
                    ) : appointment.status === "Pending" ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                        >
                            <span className="material-symbols-outlined">cancel</span>
                        </button>
                    ) : null}
                </div>
            </td>
        </tr>
    );
}

function AppointmentMobileCard({
    appointment,
    onView,
    onCancel,
}: {
    appointment: Appointment;
    onView: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
                <div>
                    <div className="font-semibold text-[#00355f]">
                        {appointment.vehicleName}
                    </div>
                    <div className="text-xs text-[#505f76]">
                        {appointment.vehicleNumber}
                    </div>
                </div>

                <StatusBadge status={appointment.status} />
            </div>

            <div className="text-sm text-[#191c1e]">
                {appointment.serviceType} • {formatDate(appointment.appointmentDate)} •{" "}
                {formatTime(appointment.appointmentDate)}
            </div>

            <p className="text-xs text-[#505f76]">{appointment.issueDescription}</p>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onView}
                    className="flex-1 py-2 text-[#00355f] bg-blue-50 rounded-lg text-sm font-semibold"
                >
                    View
                </button>

                {appointment.status === "Completed" ? (
                    <button
                        type="button"
                        onClick={onView}
                        className="flex-1 py-2 text-blue-700 bg-blue-50 rounded-lg text-sm font-semibold"
                    >
                        Review
                    </button>
                ) : appointment.status === "Pending" ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-semibold"
                    >
                        Cancel
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const className =
        status === "Pending"
            ? "bg-orange-100 text-orange-700"
            : status === "Confirmed"
                ? "bg-blue-100 text-blue-700"
                : status === "Completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "Rejected"
                        ? "bg-rose-100 text-rose-700"
                        : status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600";

    return (
        <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${className}`}
        >
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

export default MyAppointments;
