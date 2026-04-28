import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/apiClient";
import type { Vendor } from "../../types/vendor";

type IconName = "truck" | "plus" | "mail" | "phone" | "map" | "user" | "search" | "edit" | "x";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        truck: (
            <>
                <path d="M3 7h11v10H3z" />
                <path d="M14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="18" cy="17" r="2" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        mail: (
            <>
                <path d="M4 4h16v16H4z" />
                <path d="m22 6-10 7L2 6" />
            </>
        ),
        phone: (
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z" />
        ),
        map: (
            <>
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
            </>
        ),
        user: (
            <>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </>
        ),
        x: (
            <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </>
        ),
    };

    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

export default function VendorManagement() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        vendorName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        isActive: true,
    });

    async function loadVendors() {
        try {
            const response = await apiRequest<unknown>("/admin/vendors");

            let vendorList: Vendor[] = [];

            if (Array.isArray(response)) {
                vendorList = response as Vendor[];
            } else if (
                typeof response === "object" &&
                response !== null &&
                "data" in response &&
                Array.isArray((response as { data?: unknown }).data)
            ) {
                vendorList = (response as { data: Vendor[] }).data;
            } else if (
                typeof response === "object" &&
                response !== null &&
                "result" in response &&
                Array.isArray((response as { result?: unknown }).result)
            ) {
                vendorList = (response as { result: Vendor[] }).result;
            } else if (
                typeof response === "object" &&
                response !== null &&
                "items" in response &&
                Array.isArray((response as { items?: unknown }).items)
            ) {
                vendorList = (response as { items: Vendor[] }).items;
            } else {
                console.log("Unexpected vendor response format:", response);
            }

            setVendors(vendorList);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to load vendors.");
            setVendors([]);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadVendors();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    function resetForm() {
        setEditingId(null);
        setForm({
            vendorName: "",
            contactPerson: "",
            email: "",
            phone: "",
            address: "",
            isActive: true,
        });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            if (editingId) {
                await apiRequest(`/admin/vendors/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });

                setMessage("Vendor updated successfully.");
            } else {
                await apiRequest("/admin/vendors", {
                    method: "POST",
                    body: JSON.stringify(form),
                });

                setMessage("Vendor created successfully.");
            }

            resetForm();
            await loadVendors();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to save vendor.");
        }
    }

    function startEdit(vendor: Vendor) {
        setEditingId(vendor.vendorId);
        setForm({
            vendorName: vendor.vendorName || "",
            contactPerson: vendor.contactPerson || "",
            email: vendor.email || "",
            phone: vendor.phone || "",
            address: vendor.address || "",
            isActive: vendor.isActive,
        });
    }

    async function deleteVendor(id: number) {
        try {
            await apiRequest(`/admin/vendors/${id}`, { method: "DELETE" });
            setMessage("Vendor deleted or deactivated successfully.");
            await loadVendors();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to delete vendor.");
        }
    }

    const filteredVendors = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return vendors;
        }

        return vendors.filter((vendor) =>
            [vendor.vendorName, vendor.contactPerson, vendor.email, vendor.phone, vendor.address]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [search, vendors]);

    const activeCount = vendors.filter((vendor) => vendor.isActive).length;
    const inactiveCount = vendors.length - activeCount;

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-[#f4f7fb] px-10 py-10 text-[#071936]">
            <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-slate-500">
                        DASHBOARD / VENDORS
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-[#002b66]">
                        Vendor Management
                    </h1>
                    <p className="mt-2 max-w-2xl text-lg text-slate-600">
                        Add suppliers, maintain contact details, and manage vendor availability.
                    </p>
                </div>

                <button
                    type="submit"
                    form="vendor-form"
                    className="flex h-14 items-center gap-3 rounded-lg bg-[#0b4f86] px-7 text-lg font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-[#073d6a]"
                >
                    <Icon name="plus" className="h-6 w-6" />
                    {editingId ? "Update Vendor" : "Add Vendor"}
                </button>
            </div>

            {message && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 font-medium text-blue-900">
                    {message}
                </div>
            )}

            <div className="mb-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                        <Icon name="truck" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Total Vendors
                    </p>
                    <p className="mt-2 text-4xl font-bold text-[#002b66]">{vendors.length}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-green-50 text-green-700">
                        <Icon name="truck" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Active
                    </p>
                    <p className="mt-2 text-4xl font-bold text-green-700">{activeCount}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-700">
                        <Icon name="x" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Inactive
                    </p>
                    <p className="mt-2 text-4xl font-bold text-red-700">{inactiveCount}</p>
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
                <form id="vendor-form" onSubmit={handleSubmit} className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-7 py-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                                <Icon name="truck" />
                            </span>
                            <h2 className="text-2xl font-semibold text-[#071936]">
                                {editingId ? "Edit Vendor" : "Add New Vendor"}
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-5 p-7">
                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Vendor Name
                            </span>
                            <input
                                className="h-12 rounded-lg border border-slate-300 px-4 outline-none placeholder:text-slate-400 focus:border-[#0b4f86] focus:ring-4 focus:ring-blue-50"
                                placeholder="Example: Elite Spares Ltd"
                                value={form.vendorName}
                                onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                                required
                            />
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Contact Person
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="user" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="Vendor representative"
                                    value={form.contactPerson}
                                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Email Address
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="mail" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="vendor@example.com"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Phone
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="phone" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="+1 (555) 012-3456"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Address
                            </span>
                            <textarea
                                className="min-h-24 rounded-lg border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-[#0b4f86] focus:ring-4 focus:ring-blue-50"
                                placeholder="Vendor service or warehouse address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </label>

                        {editingId !== null && (
                            <label className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                Active vendor
                                <input
                                    className="h-5 w-5 accent-[#0b4f86]"
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                />
                            </label>
                        )}

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="h-12 rounded-lg border border-slate-300 font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-[#071936]">Vendor Directory</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing {filteredVendors.length} of {vendors.length} vendors
                            </p>
                        </div>
                        <label className="flex h-12 min-w-[320px] items-center gap-3 rounded-lg border border-slate-300 px-4 text-slate-500">
                            <Icon name="search" />
                            <input
                                className="w-full outline-none placeholder:text-slate-400"
                                placeholder="Search vendors or contacts..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-600">
                                <tr>
                                    <th className="px-7 py-5">Vendor</th>
                                    <th className="px-7 py-5">Contact</th>
                                    <th className="px-7 py-5">Address</th>
                                    <th className="px-7 py-5">Status</th>
                                    <th className="px-7 py-5">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendorId}>
                                        <td className="px-7 py-6">
                                            <p className="font-bold text-[#071936]">{vendor.vendorName}</p>
                                            <p className="mt-1 text-sm text-slate-500">ID: VEN-{vendor.vendorId}</p>
                                        </td>
                                        <td className="px-7 py-6">
                                            <p className="font-medium text-[#071936]">{vendor.contactPerson || "-"}</p>
                                            <p className="mt-1 text-sm text-slate-500">{vendor.email || "-"}</p>
                                            <p className="mt-1 text-sm text-slate-500">{vendor.phone || "-"}</p>
                                        </td>
                                        <td className="max-w-xs px-7 py-6 text-slate-600">{vendor.address || "-"}</td>
                                        <td className="px-7 py-6">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                    vendor.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {vendor.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(vendor)}
                                                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 px-3 text-sm font-bold text-[#0b4f86] hover:bg-blue-50"
                                                >
                                                    <Icon name="edit" className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteVendor(vendor.vendorId)}
                                                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50"
                                                >
                                                    <Icon name="x" className="h-4 w-4" />
                                                    Deactivate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredVendors.length === 0 && (
                                    <tr>
                                        <td className="px-7 py-12 text-center text-slate-500" colSpan={5}>
                                            No vendor records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
