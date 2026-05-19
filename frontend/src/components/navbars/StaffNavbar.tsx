import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../shared/auth/useAuth";
import "./StaffNavbar.css";

function StaffNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const displayName = user?.fullName || "Staff Member";

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    function isLinkActive(to: string) {
        const pathname = location.pathname;

        if (to === "/staff") {
            return pathname === "/staff";
        }

        if (to === "/customers/search") {
            return (
                pathname === "/customers/search" ||
                (
                    /^\/customers\/[^/]+$/.test(pathname) &&
                    pathname !== "/customers/create"
                )
            );
        }

        if (to === "/customers/create") {
            return pathname === "/customers/create";
        }

        if (to === "/sales-invoices") {
            return (
                pathname === "/sales-invoices" ||
                (
                    /^\/sales-invoices\/[^/]+$/.test(pathname) &&
                    pathname !== "/sales-invoices/create"
                )
            );
        }

        if (to === "/sales-invoices/create") {
            return pathname === "/sales-invoices/create";
        }

        return pathname === to;
    }

    return (
        <>
            <aside className="staff-sidebar">
                <div className="staff-sidebar-brand">
                    <img
                        src="/images/autocare-logo.jpg"
                        alt="AutoCare IMS Logo"
                        className="staff-sidebar-logo"
                    />
                </div>

                <nav className="staff-sidebar-nav">
                    <p className="staff-nav-heading">Main Menu</p>

                    <StaffNavLink
                        to="/staff"
                        icon="dashboard"
                        label="Dashboard"
                        isActive={isLinkActive("/staff")}
                    />
                    <StaffNavLink
                        to="/customers/search"
                        icon="groups"
                        label="Customers"
                        isActive={isLinkActive("/customers/search")}
                    />
                    <StaffNavLink
                        to="/customers/create"
                        icon="person_add"
                        label="Add Customer"
                        isActive={isLinkActive("/customers/create")}
                    />
                    <StaffNavLink
                        to="/staff/customer-reports"
                        icon="analytics"
                        label="Customer Reports"
                        isActive={isLinkActive("/staff/customer-reports")}
                    />

                    <p className="staff-nav-heading">Sales</p>

                    <StaffNavLink
                        to="/sales-invoices"
                        icon="point_of_sale"
                        label="Sales Invoices"
                        isActive={isLinkActive("/sales-invoices")}
                    />
                    <StaffNavLink
                        to="/sales-invoices/create"
                        icon="post_add"
                        label="Create Invoice"
                        isActive={isLinkActive("/sales-invoices/create")}
                    />
                </nav>

                <div className="staff-sidebar-footer">
                    <StaffNavLink
                        to="/change-password"
                        icon="lock_reset"
                        label="Change Password"
                        isActive={isLinkActive("/change-password")}
                    />

                    <button className="staff-logout-link" onClick={handleLogout} type="button">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="staff-nav-link-label">Logout</span>
                    </button>
                </div>
            </aside>

            <header className="staff-topbar">
                <div className="staff-topbar-left">
                    <h2>Staff</h2>
                </div>

                <div className="staff-topbar-right">
                    <button className="staff-topbar-notification" type="button">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="staff-notification-dot"></span>
                    </button>

                    <div className="staff-topbar-profile">
                        <div className="staff-profile-info">
                            <strong>{displayName}</strong>
                            <span>Staff</span>
                        </div>

                        <div className="staff-profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    </div>
                </div>
            </header>
        </>
    );
}

function StaffNavLink({
    to,
    icon,
    label,
    isActive,
}: {
    to: string;
    icon: string;
    label: string;
    isActive: boolean;
}) {
    return (
        <Link
            to={to}
            title={label}
            className={isActive ? "staff-nav-link active" : "staff-nav-link"}
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="staff-nav-link-label">{label}</span>
        </Link>
    );
}

export default StaffNavbar;
