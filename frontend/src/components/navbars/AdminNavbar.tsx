import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../../shared/utils/api";
import { useAuth } from "../../shared/auth/useAuth";
import type { AppNotification } from "../../types/notification";
import "./AdminNavbar.css";

function AdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement | null>(null);

    const displayName = user?.fullName || "Administrator";

    useEffect(() => {
        let isCancelled = false;

        async function loadNotifications() {
            setIsNotificationsLoading(true);

            try {
                const response = await apiRequest<AppNotification[]>("/api/notifications");

                if (!isCancelled && response.success) {
                    setNotifications(response.data ?? []);
                }
            } catch {
                if (!isCancelled) {
                    setNotifications([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsNotificationsLoading(false);
                }
            }
        }

        void loadNotifications();

        return () => {
            isCancelled = true;
        };
    }, [location.pathname]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!notificationRef.current?.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        }

        window.addEventListener("mousedown", handlePointerDown);

        return () => {
            window.removeEventListener("mousedown", handlePointerDown);
        };
    }, []);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    function getNotificationActionUrl(notification: AppNotification) {
        if (notification.actionUrl?.trim()) {
            return notification.actionUrl;
        }

        if (notification.notificationType === "LowStock") {
            return "/parts";
        }

        return "/admin/notifications";
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
                    <div className="admin-notification-shell" ref={notificationRef}>
                        <button
                            aria-expanded={isNotificationOpen}
                            aria-label="Open notifications"
                            className="admin-topbar-notification"
                            onClick={() => setIsNotificationOpen((current) => !current)}
                            type="button"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            {notifications.length > 0 ? (
                                <span className="admin-notification-dot"></span>
                            ) : null}
                        </button>

                        {isNotificationOpen ? (
                            <div className="admin-notification-dropdown">
                                <div className="admin-notification-dropdown-header">
                                    <div>
                                        <p>Notifications</p>
                                        <span>{notifications.length} active alert{notifications.length === 1 ? "" : "s"}</span>
                                    </div>
                                    <Link to="/admin/notifications" onClick={() => setIsNotificationOpen(false)}>
                                        Open page
                                    </Link>
                                </div>

                                <div className="admin-notification-dropdown-list">
                                    {isNotificationsLoading ? (
                                        <div className="admin-notification-dropdown-empty">
                                            Loading notifications...
                                        </div>
                                    ) : notifications.length > 0 ? (
                                        notifications.slice(0, 6).map((notification) => (
                                            <Link
                                                className="admin-notification-dropdown-item"
                                                key={notification.notificationId}
                                                onClick={() => setIsNotificationOpen(false)}
                                                to={getNotificationActionUrl(notification)}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {notification.notificationType === "LowStock" ? "warning" : "send_money"}
                                                </span>
                                                <div>
                                                    <strong>{notification.title || "System alert"}</strong>
                                                    <p>{notification.message}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="admin-notification-dropdown-empty">
                                            No system notifications right now.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="admin-topbar-profile">
                        <div className="admin-profile-info">
                            <strong>{displayName}</strong>
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
