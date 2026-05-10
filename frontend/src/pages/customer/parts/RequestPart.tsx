import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./RequestPart.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TEMP_CUSTOMER_ID = import.meta.env.VITE_TEMP_CUSTOMER_ID;

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
    if (!text) return null;
    return JSON.parse(text) as ApiResponse<T>;
}

function RequestPart() {
    const navigate = useNavigate();

    const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | "">("");

    const [partName, setPartName] = useState("");
    const [partNumber, setPartNumber] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [urgency, setUrgency] = useState("Normal");
    const [isConfirmed, setIsConfirmed] = useState(false);

    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            setIsLoadingVehicles(true);

            const response = await fetch(
                `${API_BASE_URL}/api/appointments/customer/${TEMP_CUSTOMER_ID}/vehicles`
            );

            const result = await readApiResponse<CustomerVehicle[]>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to load vehicles.");
            }

            const vehicleData = result.data ?? [];
            setVehicles(vehicleData);

            setSelectedVehicleId("");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not load vehicles."
            );
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    const selectedVehicle = vehicles.find(
        (vehicle) => vehicle.vehicleId === selectedVehicleId
    );

    const resetForm = () => {
        setPartName("");
        setPartNumber("");
        setCategory("");
        setDescription("");
        setUrgency("Normal");
        setIsConfirmed(false);

        setSelectedVehicleId("");
    };

    const handleSubmitRequest = async () => {
        if (!partName.trim()) {
            toast.error("Please enter the part name.");
            return;
        }

        if (!category) {
            toast.error("Please select a part category.");
            return;
        }

        if (!description.trim()) {
            toast.error("Please describe the unavailable part requirement.");
            return;
        }

        if (!isConfirmed) {
            toast.error("Please confirm your contact details.");
            return;
        }

        const requestBody = {
            customerId: TEMP_CUSTOMER_ID,
            vehicleId: selectedVehicleId || null,
            partName: partName.trim(),
            partNumber: partNumber.trim() || null,
            category,
            description: description.trim(),
            urgency,
        };

        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/api/part-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const result = await readApiResponse<unknown>(response);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to submit part request.");
            }

            toast.success(result.message || "Part request submitted successfully.");
            resetForm();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while submitting request."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-10">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                        <span
                            onClick={() => navigate("/")}
                            className="hover:text-[#00355f] cursor-pointer"
                        >
                            Dashboard
                        </span>
                        <span>›</span>
                        <span className="hover:text-[#00355f] cursor-pointer">
                            Part Requests
                        </span>
                        <span>›</span>
                        <span className="text-[#00355f] font-bold">
                            Request Unavailable Part
                        </span>
                    </nav>

                    <h1 className="text-4xl font-bold text-[#00355f] mb-2">
                        Request Unavailable Part
                    </h1>

                    <p className="text-base text-[#505f76] max-w-2xl">
                        Can’t find the part you need? Submit a request with your vehicle
                        and part details. Our team will review availability and update your
                        request status.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                            <SectionHeader icon="inventory_2" title="Part Information" />

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Part Name
                                    </label>
                                    <input
                                        className="w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] px-4 py-2.5 outline-none"
                                        placeholder="Example: Toyota Corolla brake pad"
                                        type="text"
                                        value={partName}
                                        onChange={(e) => setPartName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Part Number Optional
                                    </label>
                                    <input
                                        className="w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] px-4 py-2.5 outline-none"
                                        placeholder="Example: BRK-2026-TY"
                                        type="text"
                                        value={partNumber}
                                        onChange={(e) => setPartNumber(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        Part Category
                                    </label>

                                    <div className="relative">
                                        <select
                                            className="appearance-none w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] pl-4 pr-12 py-2.5 outline-none bg-white"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="">Select Category</option>
                                            <option>Engine</option>
                                            <option>Brake</option>
                                            <option>Electrical</option>
                                            <option>Suspension</option>
                                            <option>Body</option>
                                            <option>Tires</option>
                                            <option>Filters</option>
                                            <option>Batteries</option>
                                            <option>Other</option>
                                        </select>

                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                            expand_more
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                            <SectionHeader icon="directions_car" title="Vehicle Information Optional" />

                            <div className="p-6">
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                    Select Vehicle Optional
                                </label>

                                <div className="relative">
                                    <select
                                        className="appearance-none w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] pl-4 pr-12 py-2.5 outline-none bg-white"
                                        value={selectedVehicleId}
                                        disabled={isLoadingVehicles}
                                        onChange={(e) =>
                                            setSelectedVehicleId(
                                                e.target.value ? Number(e.target.value) : ""
                                            )
                                        }
                                    >
                                        <option value="">No vehicle / General part request</option>

                                        {isLoadingVehicles && (
                                            <option value="">Loading vehicles...</option>
                                        )}

                                        {!isLoadingVehicles && vehicles.length === 0 && (
                                            <option value="">No registered vehicles found</option>
                                        )}

                                        {vehicles.map((vehicle) => (
                                            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                                {vehicle.vehicleNumber} — {vehicle.brand}{" "}
                                                {vehicle.model} {vehicle.year}
                                            </option>
                                        ))}
                                    </select>

                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                        expand_more
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 mt-2">
                                    You can submit a request without selecting a vehicle.
                                </p>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                            <SectionHeader icon="description" title="Request Details" />

                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="flex items-end justify-between gap-4 mb-2">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Describe the Part Requirement
                                            </label>

                                            <p className="text-xs text-[#727780] mt-1">
                                                Describe your requirement clearly (max 500 characters).
                                            </p>
                                        </div>

                                        <span className="text-xs text-[#727780] whitespace-nowrap">
                                            {description.length}/500 characters
                                        </span>
                                    </div>

                                    <textarea
                                        className="w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00355f]/20 focus:border-[#00355f] px-4 py-2.5 outline-none"
                                        placeholder="Provide details such as model compatibility, brand preference, size, part condition, or why the part is needed..."
                                        rows={4}
                                        maxLength={500}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 max-w-md">
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
                        </section>

                        <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                            <SectionHeader icon="contact_mail" title="Contact Confirmation" />

                            <div className="p-6">
                                <div className="bg-[#f2f4f6] rounded-lg p-4 border border-slate-200 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <ContactInfo label="Full Name" value="Test Customer" />
                                        <ContactInfo label="Phone Number" value="9800000000" />
                                        <ContactInfo
                                            label="Email Address"
                                            value="customer@test.com"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        className="w-5 h-5 rounded border-slate-300 text-[#00355f] focus:ring-[#00355f]"
                                        type="checkbox"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                    />

                                    <span className="text-sm text-slate-700 group-hover:text-[#00355f] transition-colors">
                                        I confirm that my contact details are correct and I
                                        authorize AutoCare IMS to contact me regarding this part
                                        request.
                                    </span>
                                </label>
                            </div>
                        </section>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleSubmitRequest}
                                disabled={isSubmitting}
                                className="bg-[#0F4C81] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#00355f] transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="bg-white text-slate-600 border border-slate-300 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-[#0F4C81] rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">
                                            schedule
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Review Time
                                        </p>
                                        <p className="font-bold text-slate-800">24-48 Hours</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">
                                            pending
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Request Status
                                        </p>
                                        <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                                            Pending Review
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <InfoLine text="Once submitted, staff or admin can verify availability with suppliers." />
                                    <InfoLine text="You can track the request status from My Part Requests." />
                                </div>

                                <div className="bg-[#0F4C81] rounded-lg p-4 text-white">
                                    <p className="text-xs opacity-80 mb-1">
                                        Need Immediate Help?
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined">call</span>
                                        <span className="font-bold">1-800-AUTOCARE</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">
                                        verified
                                    </span>
                                    Request Guidelines
                                </h4>
                            </div>

                            <div className="p-6">
                                <ul className="space-y-4">
                                    <GuidelineItem
                                        number="1"
                                        title="Accurate Part Name"
                                        text="Use the standard manufacturer or common market name."
                                    />
                                    <GuidelineItem
                                        number="2"
                                        title="Vehicle Info"
                                        text="Select the correct registered vehicle for compatibility."
                                    />
                                    <GuidelineItem
                                        number="3"
                                        title="Part Number"
                                        text="Providing an OEM or model part number speeds up review."
                                    />
                                    <GuidelineItem
                                        number="4"
                                        title="Clear Description"
                                        text="Mention brand preference, alternative options, or urgency."
                                    />
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                            <h4 className="text-xl font-semibold text-[#00355f] mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#783200]">
                                    assignment
                                </span>
                                Request Preview
                            </h4>

                            <div className="space-y-4">
                                <PreviewDetail label="Part Name" value={partName || "Not added"} />
                                <PreviewDetail
                                    label="Part Number"
                                    value={partNumber || "Not provided"}
                                />
                                <PreviewDetail label="Category" value={category || "Not selected"} />
                                <PreviewDetail label="Urgency" value={urgency} />
                                <PreviewDetail
                                    label="Vehicle"
                                    value={
                                        selectedVehicle
                                            ? `${selectedVehicle.vehicleNumber} — ${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}`
                                            : "No vehicle selected"
                                    }
                                />
                                <PreviewDetail
                                    label="Description"
                                    value={description || "Not added"}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <span className="material-symbols-outlined text-[#00355f]">{icon}</span>
            <h3 className="text-xl font-semibold text-[#00355f]">{title}</h3>
        </div>
    );
}

function ContactInfo({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="font-semibold text-slate-800">{value}</p>
        </div>
    );
}

function InfoLine({ text }: { text: string }) {
    return (
        <div className="flex gap-3">
            <span className="material-symbols-outlined text-slate-400 text-sm">
                info
            </span>
            <p className="text-xs font-semibold text-slate-600">{text}</p>
        </div>
    );
}

function GuidelineItem({
    number,
    title,
    text,
}: {
    number: string;
    title: string;
    text: string;
}) {
    return (
        <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0F4C81] flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                {number}
            </span>

            <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{title}</p>
                <p className="text-xs">{text}</p>
            </div>
        </li>
    );
}

function PreviewDetail({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {label}
            </span>
            <p className="text-sm font-bold text-[#191c1e] mt-1">{value}</p>
        </div>
    );
}

export default RequestPart;