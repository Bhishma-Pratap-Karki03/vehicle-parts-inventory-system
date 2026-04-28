import { type ReactNode, useState } from "react";
import VendorManagement from "./VendorManagement";
import StaffManagement from "./StaffManagement";
import NotificationsPage from "./NotificationsPage";

type AdminPage = "vendors" | "staff" | "notifications";

type IconName =
    | "grid"
    | "users"
    | "truck"
    | "bell"
    | "settings"
    | "search"
    | "logout";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        grid: (
            <>
                <path d="M4 4h6v6H4z" />
                <path d="M14 4h6v6h-6z" />
                <path d="M4 14h6v6H4z" />
                <path d="M14 14h6v6h-6z" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="9.5" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        truck: (
            <>
                <path d="M3 7h11v10H3z" />
                <path d="M14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="18" cy="17" r="2" />
            </>
        ),
        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82V22a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.6 20a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.6 4a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82V2a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.2.65.2 1s-.06.69-.2 1a1.65 1.65 0 0 0 0 2c.14.31.2.65.2 1s-.06.69-.2 1Z" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
            </>
        ),
        logout: (
            <>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
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

export default function AdminDashboard() {
    const [page, setPage] = useState<AdminPage>("vendors");

    const navItems: Array<{ id: AdminPage; label: string; icon: IconName }> = [
        { id: "vendors", label: "Vendor Management", icon: "truck" },
        { id: "staff", label: "Staff Management", icon: "users" },
        { id: "notifications", label: "Notifications", icon: "bell" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7fb] text-[#071936]">
            <header className="fixed left-72 right-0 top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
                <label className="flex h-12 w-[420px] items-center gap-3 rounded-full bg-slate-100 px-5 text-sm text-slate-500">
                    <Icon name="search" className="h-5 w-5 text-slate-500" />
                    <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-500"
                        placeholder="Search admin records..."
                    />
                </label>

                <div className="flex items-center gap-5">
                    <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
                        <Icon name="bell" />
                        <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-red-600" />
                    </button>
                    <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Settings">
                        <Icon name="settings" />
                    </button>
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
                        <div className="h-11 w-11 rounded-full border-2 border-[#0b4f86] bg-[#0b4f86] text-center text-sm font-bold leading-10 text-white">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#071936]">Admin User</p>
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                System Manager
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <aside className="fixed left-0 top-0 z-30 flex h-full w-72 flex-col border-r border-slate-200 bg-white px-5 py-8 shadow-sm">
                <div className="mb-12 flex items-center gap-4 px-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0b4f86] text-white shadow">
                        <Icon name="settings" className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#002b66]">AutoCare IMS</h1>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Admin Portal
                        </p>
                    </div>
                </div>

                <nav className="grid gap-3">
                    <button className="flex items-center gap-4 rounded-lg px-5 py-4 text-left font-medium text-slate-700 hover:bg-slate-50">
                        <Icon name="grid" className="h-6 w-6 text-slate-600" />
                        Dashboard
                    </button>
                    {navItems.map((item) => {
                        const active = page === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setPage(item.id)}
                                className={`flex items-center gap-4 rounded-lg px-5 py-4 text-left font-semibold transition ${
                                    active
                                        ? "border-r-4 border-[#003b8f] bg-[#edf4ff] text-[#002b8f]"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <Icon
                                    name={item.icon}
                                    className={`h-6 w-6 ${active ? "text-[#003b8f]" : "text-slate-600"}`}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-200 pt-6">
                    <button className="mb-3 flex w-full items-center gap-4 rounded-lg px-5 py-3 text-left font-medium text-slate-700 hover:bg-slate-50">
                        <Icon name="settings" className="h-5 w-5 text-slate-600" />
                        Settings
                    </button>
                    <button className="flex w-full items-center gap-4 rounded-lg px-5 py-3 text-left font-medium text-slate-700 hover:bg-slate-50">
                        <Icon name="logout" className="h-5 w-5 text-slate-600" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="ml-72 pt-20">
                {page === "vendors" && <VendorManagement />}
                {page === "staff" && <StaffManagement />}
                {page === "notifications" && <NotificationsPage />}
            </main>
        </div>
    );
}
