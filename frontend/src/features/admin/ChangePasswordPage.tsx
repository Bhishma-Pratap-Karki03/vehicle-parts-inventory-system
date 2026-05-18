import { type FormEvent, type ReactNode, useState } from "react";
import { apiRequest } from "../../api/apiClient";

type IconName = "key" | "lock" | "shield";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        key: (
            <>
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m12 11 9-9" />
                <path d="m15 5 4 4" />
            </>
        ),
        lock: (
            <>
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
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

export default function ChangePasswordPage() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setMessage("");
        setIsError(false);

        if (form.newPassword !== form.confirmPassword) {
            setIsError(true);
            setMessage("New password and confirm password must match.");
            return;
        }

        try {
            setIsSubmitting(true);

            await apiRequest("/account/change-password", {
                method: "PUT",
                body: JSON.stringify(form),
            });

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setMessage("Password changed successfully.");
        } catch (error) {
            setIsError(true);
            setMessage(error instanceof Error ? error.message : "Failed to change password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-[#f4f7fb] px-10 py-10 text-[#071936]">
            <div className="mb-10">
                <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-slate-500">
                    DASHBOARD / ACCOUNT
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-[#002b66]">
                    Change Password
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-slate-600">
                    Update your account password after signing in with the password created by admin.
                </p>
            </div>

            {message && (
                <div
                    className={`mb-6 rounded-lg border px-5 py-4 font-medium ${
                        isError
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-green-200 bg-green-50 text-green-800"
                    }`}
                >
                    {message}
                </div>
            )}

            <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
                <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-7 py-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f86]">
                                <Icon name="key" />
                            </span>
                            <h2 className="text-2xl font-semibold text-[#071936]">
                                Account Security
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-5 p-7">
                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Current Password
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="lock" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    type="password"
                                    value={form.currentPassword}
                                    onChange={(event) =>
                                        setForm({ ...form, currentPassword: event.target.value })
                                    }
                                    required
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                New Password
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="shield" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    type="password"
                                    minLength={6}
                                    value={form.newPassword}
                                    onChange={(event) =>
                                        setForm({ ...form, newPassword: event.target.value })
                                    }
                                    required
                                />
                            </div>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                Confirm Password
                            </span>
                            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#0b4f86] focus-within:ring-4 focus-within:ring-blue-50">
                                <Icon name="shield" className="h-5 w-5 text-slate-400" />
                                <input
                                    className="w-full outline-none placeholder:text-slate-400"
                                    type="password"
                                    minLength={6}
                                    value={form.confirmPassword}
                                    onChange={(event) =>
                                        setForm({ ...form, confirmPassword: event.target.value })
                                    }
                                    required
                                />
                            </div>
                        </label>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50 px-7 py-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#0b4f86] px-5 font-bold text-white shadow transition hover:bg-[#073d6a] disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            <Icon name="key" />
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
