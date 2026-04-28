import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/apiClient";
import type { Staff } from "../../types/staff";

type IconName = "users" | "shield" | "userPlus" | "mail" | "phone" | "map" | "key" | "search";

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
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

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

    async function createStaff(e: FormEvent) {
        e.preventDefault();

        try {
            await apiRequest("/admin/staff", {
                method: "POST",
                body: JSON.stringify(form),
            });

            setForm({
                fullName: "",
                email: "",
                phoneNumber: "",
                address: "",
                password: "",
            });

            setMessage("Staff created successfully.");
            await loadStaff();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to create staff.");
        }
    }

    async function updateRole(id: string, role: string) {
        try {
            await apiRequest(`/admin/staff/${id}/role`, {
                method: "PUT",
                body: JSON.stringify({ role }),
            });

            setMessage("Role updated successfully.");
            await loadStaff();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to update role.");
        }
    }

    const filteredStaff = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return staff;
        }

        return staff.filter((member) =>
            [member.fullName, member.email, member.phoneNumber, member.address, member.roles?.[0]]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [search, staff]);

    const adminCount = staff.filter((member) => member.roles?.[0] === "Admin").length;
    const staffCount = staff.length - adminCount;

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-[#f4f7fb] px-10 py-10 text-[#071936]">
            <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
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

                <button
                    type="submit"
                    form="staff-registration-form"
                    className="flex h-14 items-center gap-3 rounded-lg bg-[#0b4f86] px-7 text-lg font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-[#073d6a]"
                >
                    <Icon name="userPlus" className="h-6 w-6" />
                    Create Staff
                </button>
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
                            Active
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
                        Admin Roles
                    </p>
                    <p className="mt-2 text-4xl font-bold text-blue-700">{adminCount}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-green-50 text-green-700">
                        <Icon name="userPlus" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Service Staff
                    </p>
                    <p className="mt-2 text-4xl font-bold text-green-700">{staffCount}</p>
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
                <form
                    id="staff-registration-form"
                    onSubmit={createStaff}
                    className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                    <div className="border-b border-slate-100 px-7 py-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                                <Icon name="userPlus" />
                            </span>
                            <h2 className="text-2xl font-semibold text-[#071936]">Register Staff</h2>
                        </div>
                    </div>

                    <div className="grid gap-5 p-7">
                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Full Name
                            </span>
                            <input
                                className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-[#0b4f86] focus:ring-4 focus:ring-blue-50"
                                placeholder="Example: James Miller"
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
                                    placeholder="+1 (555) 012-3456"
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
                                <Icon name="key" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    placeholder="Create password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                        </label>

                    </div>
                </form>

                <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-[#071936]">Staff Directory</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing {filteredStaff.length} of {staff.length} staff records
                            </p>
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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-600">
                                <tr>
                                    <th className="px-7 py-5">Staff Member</th>
                                    <th className="px-7 py-5">Contact</th>
                                    <th className="px-7 py-5">Address</th>
                                    <th className="px-7 py-5">Role</th>
                                    <th className="px-7 py-5">Change Role</th>
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
                                                <select
                                                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b4f86] focus:ring-4 focus:ring-blue-50"
                                                    value={role}
                                                    onChange={(e) => updateRole(s.id, e.target.value)}
                                                >
                                                    <option value="Admin">Admin</option>
                                                    <option value="Staff">Staff</option>
                                                </select>
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
