import { type ReactNode, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/apiClient";
import type { AppNotification } from "../../types/notification";

type IconName = "bell" | "alert" | "credit" | "search" | "send" | "clock";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </>
        ),
        alert: (
            <>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </>
        ),
        credit: (
            <>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
            </>
        ),
        send: (
            <>
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    async function loadNotifications() {
        try {
            const data = await apiRequest<AppNotification[]>("/notifications");
            setNotifications(data);
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Failed to load notifications."
            );
        }
    }

    useEffect(() => {
        void (async () => {
            await loadNotifications();
        })();
    }, []);

    async function checkLowStock() {
        try {
            const result = await apiRequest<{
                message: string;
                notificationsCreated: number;
            }>("/notifications/low-stock", {
                method: "POST",
            });

            setMessage(`${result.message}. Created: ${result.notificationsCreated}`);
            await loadNotifications();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to check low stock.");
        }
    }

    async function sendCreditReminders() {
        try {
            const result = await apiRequest<{
                message: string;
                remindersSent: number;
            }>("/notifications/credit-reminders", {
                method: "POST",
            });

            setMessage(`${result.message}. Sent: ${result.remindersSent}`);
            await loadNotifications();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Failed to send credit reminders."
            );
        }
    }

    const filteredNotifications = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return notifications;
        }

        return notifications.filter((notification) =>
            [
                notification.title,
                notification.message,
                notification.notificationType,
                notification.deliveryMethod,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [notifications, search]);

    const sentCount = notifications.filter((notification) => notification.isSent).length;
    const pendingCount = notifications.length - sentCount;

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-[#f4f7fb] px-10 py-10 text-[#071936]">
            <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-slate-500">
                        DASHBOARD / NOTIFICATIONS
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-[#002b66]">
                        Stock & Credit Notifications
                    </h1>
                    <p className="mt-2 max-w-3xl text-lg text-slate-600">
                        Monitor system notifications, low stock checks, and overdue credit reminders.
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
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                        <Icon name="bell" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Total Logs
                    </p>
                    <p className="mt-2 text-4xl font-bold text-[#002b66]">{notifications.length}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-green-50 text-green-700">
                        <Icon name="send" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Sent
                    </p>
                    <p className="mt-2 text-4xl font-bold text-green-700">{sentCount}</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                        <Icon name="clock" className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        Pending
                    </p>
                    <p className="mt-2 text-4xl font-bold text-yellow-700">{pendingCount}</p>
                </div>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-7 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                            <Icon name="alert" className="h-6 w-6" />
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                Low Stock Alert
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-[#071936]">
                                Check parts below 10 stock
                            </h2>
                            <p className="mt-2 text-slate-600">
                                Creates admin notifications for parts where stock quantity is below the reorder threshold.
                            </p>
                            <button
                                onClick={checkLowStock}
                                className="mt-6 inline-flex h-12 items-center gap-3 rounded-lg bg-[#0b4f86] px-5 font-bold text-white shadow transition hover:bg-[#073d6a]"
                            >
                                <Icon name="alert" />
                                Check Low Stock
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-7 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                            <Icon name="credit" className="h-6 w-6" />
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                Credit Reminder
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-[#071936]">
                                Send overdue credit emails
                            </h2>
                            <p className="mt-2 text-slate-600">
                                Sends reminder records or emails for customers with unpaid credits older than one month.
                            </p>
                            <button
                                onClick={sendCreditReminders}
                                className="mt-6 inline-flex h-12 items-center gap-3 rounded-lg bg-green-700 px-5 font-bold text-white shadow transition hover:bg-green-800"
                            >
                                <Icon name="send" />
                                Send Reminders
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#071936]">Notification Logs</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Showing {filteredNotifications.length} of {notifications.length} notifications
                        </p>
                    </div>
                    <label className="flex h-12 min-w-[340px] items-center gap-3 rounded-lg border border-slate-300 px-4 text-slate-500">
                        <Icon name="search" />
                        <input
                            className="w-full outline-none placeholder:text-slate-400"
                            placeholder="Search title, message, or type..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-600">
                            <tr>
                                <th className="px-7 py-5">Type</th>
                                <th className="px-7 py-5">Subject</th>
                                <th className="px-7 py-5">Message</th>
                                <th className="px-7 py-5">Delivery</th>
                                <th className="px-7 py-5">Status</th>
                                <th className="px-7 py-5">Created At</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredNotifications.map((notification) => (
                                <tr key={notification.notificationId}>
                                    <td className="px-7 py-6">
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                            {notification.notificationType || "Notification"}
                                        </span>
                                    </td>
                                    <td className="px-7 py-6 font-bold text-[#071936]">
                                        {notification.title || "-"}
                                    </td>
                                    <td className="max-w-xl px-7 py-6 text-slate-600">
                                        {notification.message}
                                    </td>
                                    <td className="px-7 py-6 text-slate-600">
                                        {notification.deliveryMethod || "-"}
                                    </td>
                                    <td className="px-7 py-6">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                notification.isSent
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {notification.isSent ? "Sent" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-7 py-6 text-slate-600">
                                        {notification.createdAt
                                            ? new Date(notification.createdAt).toLocaleString()
                                            : "-"}
                                    </td>
                                </tr>
                            ))}

                            {filteredNotifications.length === 0 && (
                                <tr>
                                    <td className="px-7 py-12 text-center text-slate-500" colSpan={6}>
                                        No notification logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
