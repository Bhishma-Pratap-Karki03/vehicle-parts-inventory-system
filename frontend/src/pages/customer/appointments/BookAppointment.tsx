import { useEffect, useState } from "react";
import { API_BASE_URL, TEMP_CUSTOMER_ID } from "../../../api/apiConfig";
import { toast } from "react-toastify";
import "./BookAppointment.css";

type CustomerVehicle = {
    vehicleId: number;
    vehicleNumber: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    lastServiceDate: string | null;
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

    if (!text) {
        return null;
    }

    return JSON.parse(text) as ApiResponse<T>;
}

function BookAppointment() {
    const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | "">("");

    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [alternativeDate, setAlternativeDate] = useState("");
    const [alternativeTime, setAlternativeTime] = useState("");

    const [serviceType, setServiceType] = useState("General Maintenance");
    const [urgency, setUrgency] = useState("Normal");
    const [issueDescription, setIssueDescription] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/appointments/customer/${TEMP_CUSTOMER_ID}/vehicles`
                );

                const result = await readApiResponse<CustomerVehicle[]>(response);

                if (!response.ok || !result?.success) {
                    throw new Error(result?.message || "Failed to load vehicles.");
                }

                const vehicleData = result.data ?? [];
                setVehicles(vehicleData);

                if (vehicleData.length > 0) {
                    setSelectedVehicleId(vehicleData[0].vehicleId);
                }
            } catch (error) {
                console.error("Failed to load vehicles:", error);
                toast.error(
                    error instanceof Error ? error.message : "Could not load vehicles.",
                    { toastId: "load-vehicles-error" }
                );
            } finally {
                setIsLoadingVehicles(false);
            }
        };

        loadVehicles();
    }, []);

    const selectedVehicle = vehicles.find(
        (vehicle) => vehicle.vehicleId === selectedVehicleId
    );

    const formatLastServiceDate = (date: string | null) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatInputDate = (date: string) => {
        if (!date) return "Not added";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatSlot = (date: string, time: string) => {
        if (!date || !time) return "Not selected";
        return `${formatInputDate(date)} at ${time}`;
    };

    const resetForm = () => {
        setPreferredDate("");
        setPreferredTime("");
        setAlternativeDate("");
        setAlternativeTime("");
        setServiceType("General Maintenance");
        setUrgency("Normal");
        setIssueDescription("");
        setIsConfirmed(false);
    };

    const handleBookAppointment = async () => {
        if (!selectedVehicleId) {
            toast.error("Please select a vehicle.");
            return;
        }

        if (!preferredDate || !preferredTime) {
            toast.error("Please select preferred appointment date and time.");
            return;
        }

        const selectedDateTime = new Date(`${preferredDate}T${preferredTime}:00`);

        if (selectedDateTime <= new Date()) {
            toast.error("Please select a future appointment date and time.");
            return;
        }

        if (alternativeDate && !alternativeTime) {
            toast.error("Please select alternative appointment time.");
            return;
        }

        if (!alternativeDate && alternativeTime) {
            toast.error("Please select alternative appointment date.");
            return;
        }

        if (!issueDescription.trim()) {
            toast.error("Please describe the issue.");
            return;
        }

        if (!isConfirmed) {
            toast.error("Please confirm your contact details before booking.");
            return;
        }

        const appointmentDate = `${preferredDate}T${preferredTime}:00`;

        const alternativeAppointmentDate =
            alternativeDate && alternativeTime
                ? `${alternativeDate}T${alternativeTime}:00`
                : null;

        const requestBody = {
            customerId: TEMP_CUSTOMER_ID,
            vehicleId: selectedVehicleId,
            appointmentDate,
            alternativeAppointmentDate,
            serviceType,
            urgency,
            issueDescription: issueDescription.trim(),
        };

        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const result = await readApiResponse<unknown>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to book appointment.");
            }

            toast.success(result.message || "Appointment booked successfully.");
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while booking appointment.",
                { toastId: "book-appointment-error" }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="book-appointment-page">
            <main className="book-appointment-container">
                <div className="mb-10">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                        <span className="hover:text-[#00355f] cursor-pointer">Dashboard</span>
                        <span>›</span>
                        <span className="hover:text-[#00355f] cursor-pointer">
                            Appointments
                        </span>
                        <span>›</span>
                        <span className="text-[#00355f] font-bold">New Booking</span>
                    </nav>

                    <h1 className="text-4xl font-bold text-[#00355f] mb-2">
                        Book Service Appointment
                    </h1>

                    <p className="text-base text-[#505f76] max-w-2xl">
                        Select your registered vehicle, preferred schedule, and describe
                        the issue. Our team will review and confirm your appointment.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl appointment-card-shadow border border-slate-100 overflow-hidden">
                            <section className="p-6 border-b border-slate-100">
                                <SectionTitle icon="directions_car" title="Vehicle Information" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div className="flex flex-col gap-2">
                                        <label className="form-label">Select Vehicle</label>

                                        <select
                                            className="form-input"
                                            value={selectedVehicleId}
                                            onChange={(e) =>
                                                setSelectedVehicleId(
                                                    e.target.value ? Number(e.target.value) : ""
                                                )
                                            }
                                            disabled={isLoadingVehicles || vehicles.length === 0}
                                        >
                                            {isLoadingVehicles && (
                                                <option value="">Loading vehicles...</option>
                                            )}

                                            {!isLoadingVehicles && vehicles.length === 0 && (
                                                <option value="">No vehicles found</option>
                                            )}

                                            {vehicles.map((vehicle) => (
                                                <option
                                                    key={vehicle.vehicleId}
                                                    value={vehicle.vehicleId}
                                                >
                                                    {vehicle.vehicleNumber} — {vehicle.brand}{" "}
                                                    {vehicle.model} {vehicle.year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="p-6 border-b border-slate-100">
                                <SectionTitle icon="schedule" title="Appointment Schedule" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="form-label">Preferred Slot</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="form-input flex-1"
                                                type="date"
                                                value={preferredDate}
                                                onChange={(e) => setPreferredDate(e.target.value)}
                                            />
                                            <input
                                                className="form-input w-32"
                                                type="time"
                                                value={preferredTime}
                                                onChange={(e) => setPreferredTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="form-label">
                                            Alternative Slot Optional
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                className="form-input flex-1"
                                                type="date"
                                                value={alternativeDate}
                                                onChange={(e) => setAlternativeDate(e.target.value)}
                                            />
                                            <input
                                                className="form-input w-32"
                                                type="time"
                                                value={alternativeTime}
                                                onChange={(e) => setAlternativeTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="p-6 border-b border-slate-100">
                                <SectionTitle icon="build" title="Service Details" />

                                <div className="flex flex-col gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="form-label">Service Type</label>
                                            <select
                                                className="form-input"
                                                value={serviceType}
                                                onChange={(e) => setServiceType(e.target.value)}
                                            >
                                                <option>General Maintenance</option>
                                                <option>Engine Diagnosis</option>
                                                <option>Brake System Service</option>
                                                <option>Electrical Repair</option>
                                                <option>Transmission Service</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="form-label">Urgency</label>

                                            <div className="grid grid-cols-3 gap-2 p-1 bg-[#eceef0] rounded-xl h-12">
                                                <label className="urgency-option">
                                                    <input
                                                        className="hidden peer"
                                                        name="urgency"
                                                        type="radio"
                                                        checked={urgency === "Normal"}
                                                        onChange={() => setUrgency("Normal")}
                                                    />
                                                    <span>Normal</span>
                                                </label>

                                                <label className="urgency-option">
                                                    <input
                                                        className="hidden peer"
                                                        name="urgency"
                                                        type="radio"
                                                        checked={urgency === "Urgent"}
                                                        onChange={() => setUrgency("Urgent")}
                                                    />
                                                    <span className="text-[#783200]">Urgent</span>
                                                </label>

                                                <label className="urgency-option">
                                                    <input
                                                        className="hidden peer"
                                                        name="urgency"
                                                        type="radio"
                                                        checked={urgency === "Emergency"}
                                                        onChange={() => setUrgency("Emergency")}
                                                    />
                                                    <span className="text-[#ba1a1a]">Emergency</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="form-label">Describe the Issue</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Please provide details about the vehicle problem or specific service requirements..."
                                            rows={4}
                                            value={issueDescription}
                                            onChange={(e) => setIssueDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="p-6 bg-[#f2f4f6]">
                                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                                    <div className="flex flex-wrap gap-x-12 gap-y-4">
                                        <ContactInfo label="Owner Name" value="Test Customer" />
                                        <ContactInfo label="Phone Number" value="9800000000" />
                                        <ContactInfo label="Email Address" value="customer@test.com" />
                                    </div>
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        className="w-5 h-5 rounded border-slate-300 text-[#00355f] focus:ring-[#00355f]"
                                        type="checkbox"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                    />
                                    <span className="text-sm text-[#191c1e]">
                                        I confirm that my contact details are correct and I
                                        authorize AutoCare IMS to contact me regarding this
                                        appointment.
                                    </span>
                                </label>
                            </section>

                            <div className="p-6 flex items-center justify-end gap-4 bg-white">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-8 h-12 rounded-lg border border-slate-300 text-[#505f76] font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBookAppointment}
                                    disabled={isSubmitting || vehicles.length === 0}
                                    className="px-10 h-12 rounded-lg bg-[#00355f] text-white font-bold hover:bg-[#07497d] shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Booking..." : "Book Appointment"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl appointment-card-shadow border border-slate-100 overflow-hidden">
                            <div className="p-4 bg-[#00355f] text-white flex justify-between items-center">
                                <h4 className="text-base font-bold">Selected Vehicle</h4>
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>

                            <div className="p-6">
                                <span className="text-xs bg-[#ffdbca] text-[#783200] px-2 py-1 rounded-full w-fit mb-2 inline-block">
                                    Registered Vehicle
                                </span>

                                <h5 className="text-xl font-bold text-[#00355f]">
                                    {selectedVehicle
                                        ? selectedVehicle.vehicleNumber
                                        : "No vehicle selected"}
                                </h5>

                                <p className="text-sm text-[#505f76]">
                                    {selectedVehicle
                                        ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}`
                                        : "Please select a vehicle"}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm pt-4 mt-6 border-t border-slate-100">
                                    <VehicleDetail
                                        label="Mileage"
                                        value={
                                            selectedVehicle
                                                ? `${selectedVehicle.mileage.toLocaleString()} km`
                                                : "Not available"
                                        }
                                    />
                                    <VehicleDetail
                                        label="Last Service"
                                        value={
                                            selectedVehicle
                                                ? formatLastServiceDate(selectedVehicle.lastServiceDate)
                                                : "Not available"
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl appointment-card-shadow border border-slate-100 p-6">
                            <h4 className="text-xl font-semibold text-[#00355f] mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#783200]">
                                    assignment
                                </span>
                                Appointment Preview
                            </h4>

                            <div className="preview-detail-list">
                                <PreviewDetail label="Service Type" value={serviceType} />
                                <PreviewDetail label="Urgency" value={urgency} />
                                <PreviewDetail
                                    label="Preferred Slot"
                                    value={formatSlot(preferredDate, preferredTime)}
                                />
                                <PreviewDetail
                                    label="Alternative Slot"
                                    value={formatSlot(alternativeDate, alternativeTime)}
                                />
                                <PreviewDetail
                                    label="Issue Description"
                                    value={
                                        issueDescription.trim()
                                            ? issueDescription
                                            : "Not added"
                                    }
                                    fullWidth
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#d0e1fb] flex items-center justify-center text-[#00355f]">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-[#191c1e]">{title}</h3>
        </div>
    );
}

function ContactInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-[#727780]">{label}</span>
            <span className="font-bold text-[#00355f]">{value}</span>
        </div>
    );
}

function VehicleDetail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-[#727780]">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );
}

function PreviewDetail({
    label,
    value,
    fullWidth = false,
}: {
    label: string;
    value: string;
    fullWidth?: boolean;
}) {
    return (
        <div className={fullWidth ? "preview-detail full-width" : "preview-detail"}>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

export default BookAppointment;