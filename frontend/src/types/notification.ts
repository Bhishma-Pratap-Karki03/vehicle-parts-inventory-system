export type AppNotification = {
    notificationId: number;
    userId?: string;
    title?: string;
    message: string;
    notificationType?: string;
    deliveryMethod?: string;
    isSent?: boolean;
    isRead?: boolean;
    createdAt: string;
};