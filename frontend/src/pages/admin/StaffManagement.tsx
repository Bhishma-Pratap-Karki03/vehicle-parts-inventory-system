import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/apiClient";
import type { Staff } from "../../types/staff";

type IconName = "users" | "shield" | "userPlus" | "mail" | "phone" | "map" | "key" | "search" | "edit" | "x";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="9.5" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
        userPlus: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6" />
                <path d="M22 11h-6" />
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
        key: (
            <>
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m12 11 9-9" />
                <path d="m15 5 4 4" />
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

export default function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [staffStatusFilter, setStaffStatusFilter] = useState<"active" | "inactive">("active");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
    });

    async function loadStaff() {
        try {
            const response = await apiRequest<unknown>("/admin/staff");

            let staffList: Staff[] = [];

            if (Array.isArray(response)) {
                staffList = response as Staff[];
            } else if (
                typeof response === "object" &&
                response !== null &&
                "data" in response &&
                Array.isArray((response as { data?: unknown }).data)
            ) {
                staffList = (response as { data: Staff[] }).data;
            } else if (
                typeof response === "object" &&
                response !== null &&
                "result" in response &&
                Array.isArray((response as { result?: unknown }).result)
            ) {
                staffList = (response as { result: Staff[] }).result;
            } else if (
                typeof response === "object" &&
                response !== null &&
                "items" in response &&
                Array.isArray((response as { items?: unknown }).items)
            ) {
                staffList = (response as { items: Staff[] }).items;
            } else {
                console.log("Unexpected staff response format:", response);
            }

            setStaff(staffList);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to load staff.");
            setStaff([]);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadStaff();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    function resetForm() {
        setEditingId(null);
        setForm({
            fullName: "",
            email: "",
            phoneNumber: "",
            address: "",
            password: "",
        });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            const payload =
                editingId && !form.password
                    ? {
                          fullName: form.fullName,
                          email: form.email,
                          phoneNumber: form.phoneNumber,
                          address: form.address,
                      }
                    : form;

            if (editingId) {
                await apiRequest(`/admin/staff/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });

                setMessage("Staff updated successfully.");
            } else {
                await apiRequest("/admin/staff", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

                setMessage("Staff created successfully.");
            }

            resetForm();
            await loadStaff();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to save staff.");
        }
    }

    function startEdit(member: Staff) {
        setEditingId(member.id);
        setForm({
            fullName: member.fullName || "",
            email: member.email || "",
            phoneNumber: member.phoneNumber || "",
            address: member.address || "",
            password: "",
        });
    }

    async function deleteStaff(id: string) {
        if (!window.confirm("Delete this staff member?")) {
            return;
        }

        try {
            await apiRequest(`/admin/staff/${id}`, { method: "DELETE" });

            setMessage("Staff deleted successfully.");
            setStaff((currentStaff) =>
                currentStaff.map((member) =>
                    member.id === id ? { ...member, isActive: false } : member
                )
            );
            if (editingId === id) {
                resetForm();
            }
            await loadStaff();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to delete staff.");
        }
    }

    const filteredStaff = useMemo(() => {
        const term = search.trim().toLowerCase();

        const statusFilteredStaff = staff.filter((member) =>
            staffStatusFilter === "active" ? member.isActive !== false : member.isActive === false
        );

        if (!term) {
            return statusFilteredStaff;
        }

        return statusFilteredStaff.filter((member) =>
            [member.fullName, member.email, member.phoneNumber, member.address, member.roles?.[0]]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [search, staff, staffStatusFilter]);

    const activeStaffCount = staff.filter((member) => member.isActive !== false).length;
    const inactiveStaffCount = staff.length - activeStaffCount;
    const currentStatusStaffCount =
        staffStatusFilter === "active" ? activeStaffCount : inactiveStaffCount;

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-[#f4f7fb] px-10 py-10 text-[#071936]">
            <div className="mb-10">
                <div>
                    <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-slate-500">
                        DASHBOARD / STAFF
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-[#002b66]">
                        Staff Management
                    </h1>
                    <p className="mt-2 max-w-2xl text-lg text-slate-600">
                        Register service staff and keep role access aligned with the admin portal.
                    </p>
                </div>
            </div>

            {message && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 font-medium text-blue-900">
                    {message}
                </div>
            )}

            <div className="mb-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                            <Icon name="users" className="h-7 w-7" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            All
                        </span>
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Total Staff
                    </p>
                    <p className="mt-2 text-4xl font-bold text-[#002b66]">{staff.length}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#eaf3ff] text-blue-700">
                        <Icon name="shield" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Active Staff
                    </p>
                    <p className="mt-2 text-4xl font-bold text-blue-700">{activeStaffCount}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-700">
                        <Icon name="x" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Inactive Staff
                    </p>
                    <p className="mt-2 text-4xl font-bold text-red-700">{inactiveStaffCount}</p>
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
                <form
                    id="staff-registration-form"
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                    <div className="border-b border-slate-100 px-7 py-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                                <Icon name="userPlus" />
                            </span>
                            <h2 className="text-2xl font-semibold text-[#071936]">
                                {editingId ? "Edit Staff" : "Register Staff"}
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-5 p-7">
                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Full Name
                            </span>
                            <input
                                className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-[#0b4f86] focus:ring-4 focus:ring-blue-50"
                                placeholder="Example: Ram Narayan"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                required
                            />
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Email Address
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="mail" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="staff@autocare.com"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Phone Number
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="phone" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="+977 98XXXXXXXX"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Address
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="map" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="Service center address"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Password
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="Create password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required={!editingId}
                                />
                            </div>
                        </label>

                    </div>

                    <div className="grid gap-3 border-t border-slate-100 bg-slate-50 px-7 py-6">
                        <button
                            type="submit"
                            className="flex h-12 items-center justify-center gap-3 rounded-lg bg-[#0b4f86] px-5 font-bold text-white shadow transition hover:bg-[#073d6a]"
                        >
                            <Icon name="userPlus" className="h-5 w-5" />
                            {editingId ? "Update Staff" : "Create Staff"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="h-12 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-[#071936]">Staff Directory</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing {filteredStaff.length} of {currentStatusStaffCount} {staffStatusFilter} staff records
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-12 rounded-lg bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setStaffStatusFilter("active")}
                                    className={`rounded-md px-4 text-sm font-bold transition ${
                                        staffStatusFilter === "active"
                                            ? "bg-white text-[#0b4f86] shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStaffStatusFilter("inactive")}
                                    className={`rounded-md px-4 text-sm font-bold transition ${
                                        staffStatusFilter === "inactive"
                                            ? "bg-white text-[#0b4f86] shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    Inactive
                                </button>
                            </div>

                            <label className="flex h-12 min-w-[320px] items-center gap-3 rounded-lg border border-slate-300 px-4 text-slate-500">
                                <Icon name="search" className="h-5 w-5" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="Search staff, email, or role..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-600">
                                <tr>
                                    <th className="px-7 py-5">Staff Member</th>
                                    <th className="px-7 py-5">Contact</th>
                                    <th className="px-7 py-5">Address</th>
                                    <th className="px-7 py-5">Role</th>
                                    <th className="px-7 py-5">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredStaff.map((s) => {
                                    const role = s.roles?.[0] || "Staff";

                                    return (
                                        <tr key={s.id} className="align-middle">
                                            <td className="px-7 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-sm font-bold text-[#0b4f86]">
                                                        {(s.fullName || "S").slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#071936]">{s.fullName}</p>
                                                        <p className="text-sm text-slate-500">ID: {s.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-7 py-6">
                                                <p className="font-medium text-[#071936]">{s.email}</p>
                                                <p className="mt-1 text-sm text-slate-500">{s.phoneNumber || "-"}</p>
                                            </td>
                                            <td className="px-7 py-6 text-slate-600">{s.address || "-"}</td>
                                            <td className="px-7 py-6">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        role === "Admin"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-green-100 text-green-700"
                                                    }`}
                                                >
                                                    {role}
                                                </span>
                                            </td>
                                            <td className="px-7 py-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(s)}
                                                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 px-3 text-sm font-bold text-[#0b4f86] hover:bg-blue-50"
                                                    >
                                                        <Icon name="edit" className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    {s.isActive !== false && (
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteStaff(s.id)}
                                                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50"
                                                        >
                                                            <Icon name="x" className="h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredStaff.length === 0 && (
                                    <tr>
                                        <td className="px-7 py-12 text-center text-slate-500" colSpan={5}>
                                            No staff records found.
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
