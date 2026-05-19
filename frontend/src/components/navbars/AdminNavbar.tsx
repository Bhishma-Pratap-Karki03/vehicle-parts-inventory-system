import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../shared/auth/useAuth";
import "./AdminNavbar.css";

function AdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const displayName = user?.fullName || "Administrator";

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <>
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <img
                        src="/images/autocare-logo.jpg"
                        alt="AutoCare IMS Logo"
                        className="admin-sidebar-logo"
                    />
                </div>

                <nav className="admin-sidebar-nav">
                    <p className="admin-nav-heading">Main Menu</p>

                    <AdminNavLink currentPath={location.pathname} to="/admin/dashboard" icon="dashboard" label="Dashboard" />
                    <AdminNavLink currentPath={location.pathname} to="/parts" icon="settings_suggest" label="Parts Management" />
                    <AdminNavLink currentPath={location.pathname} to="/admin/vendors" icon="local_shipping" label="Vendors" />
                    <AdminNavLink currentPath={location.pathname} to="/admin/staff" icon="manage_accounts" label="Staff Management" />
                    <AdminNavLink currentPath={location.pathname} to="/admin/notifications" icon="notifications_active" label="Notifications" />

                    <p className="admin-nav-heading">Inventory & Invoices</p>

                    <AdminNavLink currentPath={location.pathname} to="/purchase-invoices" icon="receipt_long" label="Purchase Invoices" />
                    <AdminNavLink
                        activeMatch={(pathname) =>
                            pathname === "/stock-transactions" ||
                            (/^\/stock-transactions\/[^/]+$/.test(pathname) && pathname !== "/stock-transactions/adjust")
                        }
                        currentPath={location.pathname}
                        to="/stock-transactions"
                        icon="sync_alt"
                        label="Stock Transactions"
                    />
                    <AdminNavLink
                        activeMatch={(pathname) => pathname === "/stock-transactions/adjust"}
                        currentPath={location.pathname}
                        to="/stock-transactions/adjust"
                        icon="tune"
                        label="Stock Adjustment"
                    />

                    <p className="admin-nav-heading">Reporting</p>

                    <AdminNavLink currentPath={location.pathname} to="/admin/reports/financial" icon="payments" label="Financial Reports" />
                </nav>

                <div className="admin-sidebar-footer">
                    <AdminNavLink currentPath={location.pathname} to="/change-password" icon="lock_reset" label="Change Password" />

                    <button className="admin-logout-link" onClick={handleLogout} type="button">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="admin-nav-link-label">Logout</span>
                    </button>
                </div>
            </aside>

            <header className="admin-topbar">
                <div className="admin-topbar-left">
                    <h2>Admin</h2>
                </div>

                <div className="admin-topbar-right">
                    <button className="admin-topbar-notification" type="button">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="admin-notification-dot"></span>
                    </button>

                    <div className="admin-topbar-profile">
                        <div className="admin-profile-info">
                            <strong>{displayName}</strong>
                            <span>Admin</span>
                        </div>

                        <div className="admin-profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    </div>
                </div>
            </header>
        </>
    );
}

function AdminNavLink({
    activeMatch,
    currentPath,
    to,
    icon,
    label,
}: {
    activeMatch?: (pathname: string) => boolean;
    currentPath: string;
    to: string;
    icon: string;
    label: string;
}) {
    const isActive = activeMatch
        ? activeMatch(currentPath)
        : to === "/admin/dashboard"
            ? currentPath === to
            : currentPath === to || currentPath.startsWith(`${to}/`);

    return (
        <NavLink
            to={to}
            title={label}
            className={() =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
            }
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="admin-nav-link-label">{label}</span>
        </NavLink>
    );
}

export default AdminNavbar;
