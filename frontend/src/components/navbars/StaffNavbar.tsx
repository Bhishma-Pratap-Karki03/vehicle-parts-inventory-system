import { Link, NavLink } from "react-router-dom";
import "./StaffNavbar.css";

function StaffNavbar() {
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

                    <StaffNavLink to="/staff" icon="dashboard" label="Dashboard" />
                    <StaffNavLink to="/staff/appointments" icon="calendar_today" label="Appointments" />
                    <StaffNavLink to="/staff/service-records" icon="build" label="Service Records" />

                    <p className="staff-nav-heading">Customer Support</p>

                    <StaffNavLink to="/staff/part-requests" icon="request_quote" label="Part Requests" />
                    <StaffNavLink to="/staff/parts" icon="inventory_2" label="Parts Inventory" />

                    <p className="staff-nav-heading">Sales & Reports</p>

                    <StaffNavLink to="/staff/sales-invoices" icon="point_of_sale" label="Sales Invoices" />
                    <StaffNavLink to="/staff/reports" icon="analytics" label="Service Reports" />
                </nav>

                <div className="staff-sidebar-footer">
                    <StaffNavLink to="/staff/notifications" icon="notifications" label="Notifications" />
                    <StaffNavLink to="/staff/profile" icon="account_circle" label="Profile" />
                    <StaffNavLink to="/staff/settings" icon="settings" label="Settings" />

                    <Link to="/logout" className="staff-logout-link">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            <header className="staff-topbar">
                <div className="staff-topbar-left">
                    <h2>Staff</h2>

                    <div className="staff-search-box">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Search appointments, parts, services..."
                        />
                    </div>
                </div>

                <div className="staff-topbar-right">
                    <button className="staff-topbar-notification">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="staff-notification-dot"></span>
                    </button>

                    <div className="staff-topbar-profile">
                        <div className="staff-profile-info">
                            <strong>Staff Member</strong>
                            <span>Staff</span>
                        </div>

                        <div className="staff-profile-avatar">S</div>
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
}: {
    to: string;
    icon: string;
    label: string;
}) {
    return (
        <NavLink
            to={to}
            end={to === "/staff"}
            className={({ isActive }) =>
                isActive ? "staff-nav-link active" : "staff-nav-link"
            }
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
        </NavLink>
    );
}

export default StaffNavbar;