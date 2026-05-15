import { type ReactNode, useState } from "react";
import VendorManagement from "./VendorManagement";
import StaffManagement from "./StaffManagement";
import NotificationsPage from "./NotificationsPage";
import ChangePasswordPage from "./ChangePasswordPage";

type AdminPage = "vendors" | "staff" | "notifications" | "changePassword";

type IconName =
    | "grid"
    | "users"
    | "truck"
    | "bell"
    | "settings"
    | "key"
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

    function logout() {
        localStorage.removeItem("token");
        window.location.reload();
    }

    return (
        <div className="min-h-screen bg-[#f3f6f9] text-[#071936]">
            <header className="fixed left-44 right-0 top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-7 shadow-sm">
                <label className="flex h-9 w-[360px] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 text-xs text-slate-500">
                    <Icon name="search" className="h-5 w-5 text-slate-500" />
                    <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-500"
                        placeholder="Search staff, vendors, notifications..."
                    />
                </label>

                <div className="flex items-center gap-4">
                    <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
                        <Icon name="bell" className="h-4 w-4" />
                        <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-red-600" />
                    </button>
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                        <div className="h-9 w-9 rounded-full bg-[#005b8f] text-center text-sm font-bold leading-9 text-white">
                            A
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#073b63]">Admin</p>
                            <p className="text-[10px] font-medium text-slate-500">
                                My Account
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <aside className="fixed left-0 top-0 z-30 flex h-full w-44 flex-col border-r border-slate-200 bg-white shadow-sm">
                <div className="flex h-14 items-center border-b border-slate-100 px-5">
                    <img
                        src="/autocare-logo.jpg.jpeg"
                        alt="AutoCare IMS"
                        className="h-auto w-32 object-contain"
                    />
                </div>

                <nav className="flex-1 overflow-y-auto py-4 text-xs font-semibold">
                    <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>
                    <button className="mb-1 flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-2.5 text-left text-slate-600 hover:border-[#0b5f8f] hover:bg-[#eef6fb] hover:text-[#073b63]">
                        <Icon name="grid" className="h-4 w-4 text-slate-500" />
                        <span>Dashboard</span>
                    </button>

                    <p className="px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Administration
                    </p>
                    {navItems.map((item) => {
                        const active = page === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setPage(item.id)}
                                className={`mb-1 flex w-full items-center gap-3 border-l-4 px-4 py-2.5 text-left transition ${
                                    active
                                        ? "border-[#0b5f8f] bg-[#eef6fb] text-[#073b63]"
                                        : "border-transparent text-slate-600 hover:border-[#0b5f8f] hover:bg-[#eef6fb] hover:text-[#073b63]"
                                }`}
                            >
                                <Icon
                                    name={item.icon}
                                    className={`h-4 w-4 ${active ? "text-[#0b5f8f]" : "text-slate-500"}`}
                                />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-100 py-4 text-xs font-semibold">
                    <button
                        onClick={() => setPage("changePassword")}
                        className={`flex w-full items-center gap-3 border-l-4 px-4 py-2.5 text-left hover:border-[#0b5f8f] hover:bg-[#eef6fb] hover:text-[#073b63] ${
                            page === "changePassword"
                                ? "border-[#0b5f8f] bg-[#eef6fb] text-[#073b63]"
                                : "border-transparent text-slate-600"
                        }`}
                    >
                        <Icon
                            name="key"
                            className={`h-4 w-4 ${page === "changePassword" ? "text-[#0b5f8f]" : "text-slate-500"}`}
                        />
                        Change Password
                    </button>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-2.5 text-left text-red-600 hover:border-red-500 hover:bg-red-50"
                    >
                        <Icon name="logout" className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="ml-44 pt-14">
                {page === "vendors" && <VendorManagement />}
                {page === "staff" && <StaffManagement />}
                {page === "notifications" && <NotificationsPage />}
                {page === "changePassword" && <ChangePasswordPage />}
            </main>
        </div>
    );
}
