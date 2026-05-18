import { Link, NavLink } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar() {
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

                    <AdminNavLink to="/admin" icon="dashboard" label="Dashboard" />

                    <AdminNavLink to="/admin/staff" icon="badge" label="Staff Management" />

                    <AdminNavLink to="/admin/parts" icon="settings_suggest" label="Parts Management" />

                    <AdminNavLink to="/admin/vendors" icon="handshake" label="Vendor Management" />

                    <p className="admin-nav-heading">Invoicing & Requests</p>

                    <AdminNavLink to="/admin/purchase-invoices" icon="receipt_long" label="Purchase Invoices" />

                    <AdminNavLink to="/admin/sales-invoices" icon="point_of_sale" label="Sales Invoices" />

                    <AdminNavLink to="/admin/part-requests" icon="request_quote" label="Part Requests" />

                    <AdminNavLink to="/admin/appointments" icon="calendar_month" label="Appointments" />

                    <p className="admin-nav-heading">Reporting</p>

                    <AdminNavLink to="/admin/reports/financial" icon="payments" label="Financial Reports" />

                    <AdminNavLink to="/admin/reports/inventory" icon="inventory_2" label="Inventory Reports" />
                </nav>

                <div className="admin-sidebar-footer">
                    <AdminNavLink to="/admin/notifications" icon="notifications" label="Notifications" />
                    <AdminNavLink to="/admin/settings" icon="settings" label="Settings" />

                    <Link to="/logout" className="admin-logout-link">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            <header className="admin-topbar">
                <div className="admin-topbar-left">
                    <h2>Admin</h2>

                    <div className="admin-search-box">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Search staff, parts, vendors, invoices..."
                        />
                    </div>
                </div>

                <div className="admin-topbar-right">
                    <button className="admin-topbar-notification">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="admin-notification-dot"></span>
                    </button>

                    <div className="admin-topbar-profile">
                        <div className="admin-profile-info">
                            <strong>Administrator</strong>
                            <span>Admin</span>
                        </div>

                        <div className="admin-profile-avatar">A</div>
                    </div>
                </div>
            </header>
        </>
    );
}

function AdminNavLink({
    to,
    icon,
    label,
}: {
    to: string;
    icon: string;
    label: string;
}) {
    return (
        <NavLink
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
            }
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
        </NavLink>
    );
}

export default AdminNavbar;