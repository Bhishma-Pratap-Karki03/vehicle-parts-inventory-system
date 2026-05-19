import "./RequestPart.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest, getApiErrorMessage } from "../../../shared/utils/api";

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

function PartRequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState<PartRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPartRequest();
    }, [id]);

    const loadPartRequest = async () => {
        if (!id) {
            toast.error("Part request id is missing.");
            navigate("/parts/my");
            return;
        }

        try {
            setIsLoading(true);

            const result = await apiRequest<PartRequest>(`/api/part-requests/${id}`);

            if (!result.success || !result.data) {
                throw new Error(getApiErrorMessage(result));
            }

            setRequest(result.data);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not load part request details."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="request-part-page">
                <main className="request-part-container">
                    <EmptyState
                        icon="progress_activity"
                        title="Loading part request..."
                        message="Please wait while we fetch your request details."
                    />
                </main>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="request-part-page">
                <main className="request-part-container">
                    <EmptyState
                        icon="inventory_2"
                        title="Part request not found"
                        message="The part request you are trying to view could not be found."
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="request-part-page">
            <main className="request-part-container">
                <div className="mb-10">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                        <span
                            onClick={() => navigate("/")}
                            className="hover:text-[#00355f] cursor-pointer"
                        >
                            Dashboard
                        </span>
                        <span>›</span>
                        <span
                            onClick={() => navigate("/parts/my")}
                            className="hover:text-[#00355f] cursor-pointer"
                        >
                            My Part Requests
                        </span>
                        <span>›</span>
                        <span className="text-[#00355f] font-bold">Details</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-[#00355f] mb-2">
                                Part Request Details
                            </h1>

                            <p className="text-base text-[#505f76] max-w-2xl">
                                View your requested part information, request status, and
                                service team response.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/parts/my")}
                            className="flex items-center gap-2 px-4 py-2 text-[#505f76] hover:text-[#00355f] font-medium transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to My Part Requests
                        </button>
                    </div>
                </div>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 border border-slate-100">
                    <OverviewBlock
                        label="Request ID"
                        value={`#PRT-${request.partRequestId.toString().padStart(4, "0")}`}
                    />

                    <div>
                        <p className="text-[11px] text-[#505f76] uppercase tracking-wider mb-2">
                            Status
                        </p>
                        <StatusBadge status={request.status} />
                    </div>

                    <OverviewBlock
                        label="Requested Date"
                        value={formatDate(request.requestedAt)}
                    />

                    <OverviewBlock
                        label="Last Updated"
                        value={request.updatedAt ? formatDate(request.updatedAt) : "Not updated"}
                    />

                    <div>
                        <p className="text-[11px] text-[#505f76] uppercase tracking-wider mb-2">
                            Urgency
                        </p>
                        <UrgencyBadge urgency={request.urgency} />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] overflow-hidden border border-slate-100">
                            <SectionHeader icon="settings_input_component" title="Part Information" />

                            <div className="p-6 space-y-5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#191c1e]">
                                            {request.partName}
                                        </h2>
                                        <p className="text-xs text-[#00355f] font-bold uppercase tracking-wider mt-1">
                                            {request.category}
                                        </p>
                                    </div>

                                    <span className="text-xs px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono font-semibold w-fit">
                                        {request.partNumber || "No part number provided"}
                                    </span>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-[#00355f]">
                                    <p className="text-[11px] text-[#505f76] uppercase tracking-wider mb-1">
                                        Customer Description
                                    </p>
                                    <p className="text-sm text-[#191c1e] leading-relaxed">
                                        {request.description}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] overflow-hidden border border-slate-100">
                            <SectionHeader icon="directions_car" title="Vehicle Details" />

                            <div className="p-6">
                                {request.vehicleId ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoTile
                                            icon="license"
                                            label="Vehicle Number"
                                            value={request.vehicleNumber}
                                        />
                                        <InfoTile
                                            icon="minor_crash"
                                            label="Vehicle Name"
                                            value={request.vehicleName}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-[#f2f4f6] rounded-xl border border-slate-200">
                                        <p className="text-sm font-semibold text-[#00355f]">
                                            General part request
                                        </p>
                                        <p className="text-sm text-[#505f76] mt-1">
                                            This request was submitted without selecting a registered
                                            vehicle.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-slate-900 rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-400">
                                            support_agent
                                        </span>
                                        Service Team Response
                                    </h3>

                                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wide w-fit">
                                        OFFICIAL UPDATE
                                    </span>
                                </div>

                                <p className="text-blue-100 text-base leading-relaxed">
                                    {request.adminResponse ||
                                        "No admin response yet. Our team will update this request after reviewing part availability with vendors."}
                                </p>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] p-6 border border-slate-100">
                            <h3 className="text-xl font-semibold text-[#00355f] mb-8">
                                Request Progress
                            </h3>

                            {request.status === "Cancelled" ? (
                                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
                                    <div className="hidden md:block absolute top-5 left-10 right-10 h-0.5 bg-[#00355f] z-0"></div>

                                    <ProgressStep
                                        label="Submitted"
                                        date={formatDate(request.requestedAt)}
                                        icon="check"
                                        active
                                    />

                                    <ProgressStep
                                        label="Cancelled"
                                        date={request.updatedAt ? formatDate(request.updatedAt) : "Cancelled"}
                                        icon="cancel"
                                        active
                                        current
                                    />
                                </div>
                            ) : (
                                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
                                    <div className="hidden md:block absolute top-5 left-10 right-10 h-0.5 bg-slate-100 z-0">
                                        <div
                                            className="h-full bg-[#00355f]"
                                            style={{ width: getProgressWidth(request.status) }}
                                        ></div>
                                    </div>

                                    <ProgressStep
                                        label="Submitted"
                                        date={formatDate(request.requestedAt)}
                                        icon="check"
                                        active
                                    />

                                    <ProgressStep
                                        label="Reviewed"
                                        date={
                                            ["Reviewed", "Available", "Unavailable"].includes(request.status)
                                                ? "Completed"
                                                : "Pending"
                                        }
                                        icon="hourglass_empty"
                                        active={["Reviewed", "Available", "Unavailable"].includes(request.status)}
                                        current={request.status === "Reviewed"}
                                    />

                                    <ProgressStep
                                        label={request.status === "Unavailable" ? "Unavailable" : "Available"}
                                        date={
                                            request.status === "Available" || request.status === "Unavailable"
                                                ? "Completed"
                                                : "Waiting"
                                        }
                                        icon={request.status === "Unavailable" ? "inventory_2" : "task_alt"}
                                        active={request.status === "Available" || request.status === "Unavailable"}
                                        current={request.status === "Available" || request.status === "Unavailable"}
                                    />
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] p-6 border-t-4 border-[#00355f]">
                            <h3 className="text-xl font-semibold text-[#00355f] mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">info</span>
                                Request Guidelines
                            </h3>

                            <ul className="space-y-3">
                                <Guideline text="Parts are subject to vendor availability." />
                                <Guideline text="Estimated price may vary based on market rate." />
                                <Guideline text="You can cancel only while the request is pending." />
                                <Guideline text="Admin response appears after request review." />
                            </ul>
                        </section>

                        <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] p-6 border border-slate-100">
                            <h3 className="text-xl font-semibold text-[#00355f] mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">support_agent</span>
                                Help & Support
                            </h3>

                            <p className="text-sm text-[#505f76] mb-4">
                                Contact support if you need urgent help about your part
                                request.
                            </p>

                            <div className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 text-[#00355f] font-bold rounded-xl">
                                <span className="material-symbols-outlined text-xl">
                                    call
                                </span>
                                <span className="text-sm">1-800-AUTOCARE</span>
                            </div>
                        </section>

                        <button
                            type="button"
                            onClick={() => navigate("/parts/my")}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-300 text-[#505f76] font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to My Part Requests
                        </button>
                    </aside>
                </div>
            </main>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-semibold text-[#00355f] flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">{icon}</span>
                {title}
            </h3>
        </div>
    );
}

function OverviewBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] text-[#505f76] uppercase tracking-wider">
                {label}
            </p>
            <p className="text-base font-semibold text-[#191c1e]">{value}</p>
        </div>
    );
}

function InfoTile({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#00355f]">
                <span className="material-symbols-outlined">{icon}</span>
            </div>

            <div>
                <p className="text-[11px] text-[#505f76] uppercase tracking-wider">
                    {label}
                </p>
                <p className="text-xl font-semibold text-[#191c1e]">{value}</p>
            </div>
        </div>
    );
}

function ProgressStep({
    label,
    date,
    icon,
    active,
    current = false,
}: {
    label: string;
    date: string;
    icon: string;
    active: boolean;
    current?: boolean;
}) {
    const circleClass = active
        ? "bg-[#00355f] text-white"
        : "bg-slate-100 border-2 border-slate-200 text-slate-400";

    return (
        <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2">
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${circleClass} ${current ? "outline-4 outline-[#d2e4ff]" : ""
                    }`}
            >
                <span className="material-symbols-outlined text-sm">{icon}</span>
            </div>

            <div className="text-left md:text-center">
                <p className={active ? "text-xs font-bold text-[#00355f]" : "text-xs font-bold text-slate-400"}>
                    {label}
                </p>
                <p className="text-xs text-[#505f76]">{date}</p>
            </div>
        </div>
    );
}

function Guideline({ text }: { text: string }) {
    return (
        <li className="flex gap-2 text-sm text-[#505f76]">
            <span className="material-symbols-outlined text-blue-500 text-sm mt-1">
                radio_button_checked
            </span>
            {text}
        </li>
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
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${className}`}
        >
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
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
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
        <div className="bg-white rounded-xl p-12 text-center shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
                {icon}
            </span>
            <h3 className="text-xl font-bold text-[#00355f]">{title}</h3>
            <p className="text-sm text-[#505f76] mt-2">{message}</p>
        </div>
    );
}

function getProgressWidth(status: string) {
    if (status === "Pending") return "0%";
    if (status === "Reviewed") return "50%";
    if (status === "Available" || status === "Unavailable") return "100%";
    return "0%";
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default PartRequestDetails;
