import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, TEMP_CUSTOMER_ID } from "../../../api/apiConfig";
import { toast } from "react-toastify";
import "./AppointmentDetails.css";

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
    status: string;
    createdAt?: string;
};

type Review = {
    reviewId: number;
    customerId: string;
    appointmentId: number | null;
    rating: number;
    comment: string;
    createdAt: string;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    statusCode: number;
};

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as ApiResponse<T>;
}

function AppointmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [existingReview, setExistingReview] = useState<Review | null>(null);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        loadAppointmentDetails();
    }, [id]);

    const loadAppointmentDetails = async () => {
        if (!id) {
            toast.error("Appointment id is missing.");
            navigate("/appointments/my");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`);
            const result = await readApiResponse<Appointment>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to load appointment details.");
            }

            setAppointment(result.data);

            if (result.data.status === "Completed") {
                await loadExistingReview(result.data.appointmentId);
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not load appointment details."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const loadExistingReview = async (appointmentId: number) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/reviews/appointment/${appointmentId}`
            );

            const result = await readApiResponse<Review>(response);

            if (response.ok && result?.success && result.data) {
                setExistingReview(result.data);
                setRating(result.data.rating);
                setReviewComment(result.data.comment);
            }
        } catch (error) {
            console.error("No existing review found:", error);
        }
    };

    const handleSubmitReview = async () => {
        if (!appointment) return;

        if (appointment.status !== "Completed") {
            toast.error("You can review only completed appointments.");
            return;
        }

        if (existingReview) {
            toast.error("You have already submitted a review for this appointment.");
            return;
        }

        if (!reviewComment.trim()) {
            toast.error("Please write your review comment.");
            return;
        }

        try {
            setIsSubmittingReview(true);

            const response = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: TEMP_CUSTOMER_ID,
                    appointmentId: appointment.appointmentId,
                    rating,
                    comment: reviewComment.trim(),
                }),
            });

            const result = await readApiResponse<Review>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to submit review.");
            }

            toast.success(result.message || "Review submitted successfully.");
            setExistingReview(result.data);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while submitting review."
            );
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!appointment) return;

        if (appointment.status !== "Pending") {
            toast.error("Only pending appointments can be cancelled.");
            return;
        }

        try {
            setIsCancelling(true);

            const response = await fetch(
                `${API_BASE_URL}/api/appointments/${appointment.appointmentId}/cancel`,
                {
                    method: "PATCH",
                }
            );

            const result = await readApiResponse<Appointment>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to cancel appointment.");
            }

            toast.success(result.message || "Appointment cancelled successfully.");
            setAppointment(result.data);
            setShowCancelModal(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while cancelling appointment."
            );
        } finally {
            setIsCancelling(false);
        }
    };

    const progress = useMemo(() => {
        if (!appointment) return 0;
        if (appointment.status === "Pending") return 0;
        if (appointment.status === "Confirmed") return 50;
        if (appointment.status === "Completed") return 100;
        return 0;
    }, [appointment]);

    if (isLoading) {
        return (
            <div className="appointment-details-page">
                <main className="appointment-details-container">
                    <EmptyState
                        icon="progress_activity"
                        title="Loading appointment details..."
                        message="Please wait while we fetch your appointment information."
                    />
                </main>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="appointment-details-page">
                <main className="appointment-details-container">
                    <EmptyState
                        icon="event_busy"
                        title="Appointment not found"
                        message="The appointment you are trying to view could not be found."
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="appointment-details-page">
            <main className="appointment-details-container">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-8">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                                <span
                                    onClick={() => navigate("/")}
                                    className="hover:text-[#00355f] cursor-pointer"
                                >
                                    Dashboard
                                </span>
                                <span>›</span>
                                <span
                                    onClick={() => navigate("/appointments/my")}
                                    className="hover:text-[#00355f] cursor-pointer"
                                >
                                    My Appointments
                                </span>
                                <span>›</span>
                                <span className="text-[#00355f] font-bold">Details</span>
                            </nav>

                            <h1 className="text-4xl font-bold text-[#00355f] tracking-tight">
                                Appointment Details
                            </h1>

                            <p className="text-base text-[#505f76] mt-2">
                                View your appointment request, selected vehicle, schedule,
                                service issue, and current progress.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/appointments/my")}
                                className="flex items-center gap-2 px-4 py-2 text-[#505f76] hover:text-[#00355f] font-medium transition-colors"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back to Appointments
                            </button>

                            {appointment.status === "Pending" && (
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-6 py-2 border border-[#ba1a1a] text-[#ba1a1a] font-semibold rounded-lg hover:bg-red-50 transition-all"
                                >
                                    Cancel Appointment
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100">
                                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                                    <span className="material-symbols-outlined text-[#0f4c81]">
                                        track_changes
                                    </span>
                                    <h3 className="text-xl font-semibold text-[#191c1e]">
                                        Appointment Progress
                                    </h3>
                                </div>

                                <div className="relative flex justify-between items-start px-2 sm:px-4">
                                    <div className="absolute top-5 left-10 right-10 h-1 bg-[#eceef0] rounded-full z-0"></div>

                                    <div
                                        className="absolute top-5 left-10 h-1 bg-[#0f4c81] rounded-full z-0 transition-all"
                                        style={{ width: `calc(${progress}% - 80px)` }}
                                    ></div>

                                    <ProgressStep
                                        label="Requested"
                                        icon="check"
                                        active
                                        current={appointment.status === "Pending"}
                                        date={appointment.createdAt ? formatDate(appointment.createdAt) : "Booked"}
                                    />

                                    <ProgressStep
                                        label="Confirmed"
                                        icon="approval"
                                        active={appointment.status === "Confirmed" || appointment.status === "Completed"}
                                        current={appointment.status === "Confirmed"}
                                    />

                                    <ProgressStep
                                        label="Service Done"
                                        icon="task_alt"
                                        active={appointment.status === "Completed"}
                                        current={appointment.status === "Completed"}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border-l-4 border-[#0f4c81]">
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="material-symbols-outlined text-[#0f4c81]">
                                        car_repair
                                    </span>
                                    <h3 className="text-xl font-semibold text-[#191c1e]">
                                        Service Request Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    <DetailBlock label="Service Type" value={appointment.serviceType} />
                                    <DetailBlock label="Urgency" value={appointment.urgency} />
                                    <DetailBlock
                                        label="Preferred Appointment Slot"
                                        value={`${formatDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentDate)}`}
                                    />
                                    <DetailBlock
                                        label="Alternative Slot"
                                        value={
                                            appointment.alternativeAppointmentDate
                                                ? `${formatDate(appointment.alternativeAppointmentDate)} at ${formatTime(appointment.alternativeAppointmentDate)}`
                                                : "Not provided"
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-[#505f76] uppercase tracking-widest">
                                        Customer Issue Description
                                    </label>
                                    <p className="text-sm text-[#42474f] leading-relaxed bg-[#f2f4f6] p-4 rounded-lg mt-2">
                                        {appointment.issueDescription}
                                    </p>
                                </div>
                            </div>

                            <div
                                className={
                                    appointment.status === "Completed"
                                        ? "bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-blue-100"
                                        : "bg-[#f2f4f6] rounded-xl p-6 border-2 border-dashed border-[#c2c7d1] opacity-70"
                                }
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={
                                                appointment.status === "Completed"
                                                    ? "material-symbols-outlined text-[#0f4c81]"
                                                    : "material-symbols-outlined text-[#727780]"
                                            }
                                        >
                                            rate_review
                                        </span>

                                        <h3
                                            className={
                                                appointment.status === "Completed"
                                                    ? "text-xl font-semibold text-[#191c1e]"
                                                    : "text-xl font-semibold text-[#727780]"
                                            }
                                        >
                                            Service Review
                                        </h3>
                                    </div>

                                    {appointment.status !== "Completed" && (
                                        <span className="px-3 py-1 bg-[#c2c7d1] text-white text-[10px] font-bold rounded-full uppercase">
                                            Locked until service completion
                                        </span>
                                    )}

                                    {existingReview && (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                                            Review Submitted
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="text-[11px] font-bold text-[#505f76] uppercase tracking-widest">
                                        Rating
                                    </label>

                                    <div className="flex gap-2 mt-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                disabled={appointment.status !== "Completed" || !!existingReview}
                                                onClick={() => setRating(star)}
                                                className={
                                                    star <= rating
                                                        ? "material-symbols-outlined filled-star text-4xl text-yellow-500 disabled:cursor-not-allowed"
                                                        : "material-symbols-outlined text-4xl text-slate-300 disabled:cursor-not-allowed"
                                                }
                                            >
                                                star
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-[#505f76] uppercase tracking-widest">
                                        Review Comment
                                    </label>

                                    <textarea
                                        className="w-full h-28 mt-2 bg-white border border-[#c2c7d1] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f4c81]/20 focus:border-[#0f4c81] disabled:bg-white/70 disabled:cursor-not-allowed"
                                        disabled={appointment.status !== "Completed" || !!existingReview}
                                        placeholder={
                                            appointment.status === "Completed"
                                                ? "Write about service quality, staff behaviour, repair experience, or overall satisfaction..."
                                                : "Review can be submitted only after this appointment is completed."
                                        }
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                    />
                                </div>

                                {appointment.status === "Completed" && !existingReview && (
                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="button"
                                            onClick={handleSubmitReview}
                                            disabled={isSubmittingReview}
                                            className="px-6 py-2 bg-[#0f4c81] text-white rounded-lg font-semibold hover:bg-[#00355f] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </div>
                                )}

                                {existingReview && (
                                    <p className="text-sm text-[#505f76] mt-4">
                                        Submitted on {formatDate(existingReview.createdAt)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <div className="bg-[#0f4c81] text-white rounded-xl p-6 shadow-lg overflow-hidden relative">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                            Appointment ID
                                        </p>
                                        <h2 className="text-2xl font-black">
                                            #{formatAppointmentId(appointment.appointmentId)}
                                        </h2>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusClass(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </div>

                                <div className="space-y-4 border-t border-white/20 pt-4">
                                    <SummaryItem
                                        icon="event"
                                        label="Scheduled For"
                                        value={`${formatDate(appointment.appointmentDate)}, ${formatTime(appointment.appointmentDate)}`}
                                    />
                                    <SummaryItem
                                        icon="history"
                                        label="Booked On"
                                        value={appointment.createdAt ? formatDate(appointment.createdAt) : "Not available"}
                                    />
                                    <SummaryItem
                                        icon="priority_high"
                                        label="Urgency"
                                        value={appointment.urgency}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#0f4c81]">directions_car</span>
                                    <h3 className="text-xl font-semibold text-[#191c1e]">
                                        Vehicle Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <DetailBlock label="Vehicle Number" value={appointment.vehicleNumber} />
                                    <DetailBlock label="Vehicle ID" value={`#${appointment.vehicleId}`} />
                                    <div className="col-span-2">
                                        <DetailBlock label="Vehicle Name" value={appointment.vehicleName} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showCancelModal && (
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
                                    This action will mark your booking as cancelled.
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-[#42474f] bg-[#f2f4f6] rounded-xl p-4 mb-6">
                            Are you sure you want to cancel appointment{" "}
                            <strong>#{formatAppointmentId(appointment.appointmentId)}</strong>?
                            You can only cancel appointments while they are still pending.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-lg border border-slate-300 text-[#505f76] font-bold hover:bg-slate-50 transition-all disabled:opacity-60"
                            >
                                Keep Appointment
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelAppointment}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-lg bg-[#ba1a1a] text-white font-bold hover:bg-red-700 transition-all disabled:opacity-60"
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

function ProgressStep({
    label,
    icon,
    active,
    current = false,
    date,
}: {
    label: string;
    icon: string;
    active: boolean;
    current?: boolean;
    date?: string;
}) {
    const circleClass = active
        ? "bg-[#0f4c81] text-white"
        : "bg-[#eceef0] text-[#727780] border-2 border-white";

    return (
        <div className="relative z-10 flex flex-col items-center text-center w-20">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-2 ${circleClass}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>

            <span className={active ? "text-xs font-bold text-[#00355f]" : "text-xs font-semibold text-[#505f76]"}>
                {label}
            </span>

            <span className="text-[10px] text-[#727780]">
                {current ? "Current" : date || (active ? "Done" : "Pending")}
            </span>
        </div>
    );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <label className="text-[11px] font-bold text-[#505f76] uppercase tracking-widest">
                {label}
            </label>
            <p className="text-base font-bold text-[#191c1e] mt-1">{value}</p>
        </div>
    );
}

function SummaryItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined opacity-80">{icon}</span>
            <div>
                <p className="text-[10px] opacity-80 uppercase font-bold">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
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

function getStatusClass(status: string) {
    if (status === "Pending") return "bg-orange-100 text-orange-700";
    if (status === "Confirmed") return "bg-blue-100 text-blue-700";
    if (status === "Completed") return "bg-emerald-100 text-emerald-700";
    if (status === "Cancelled") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
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

function formatAppointmentId(id: number) {
    return `APT-${id.toString().padStart(4, "0")}`;
}

export default AppointmentDetails;