export type AppNotification = {
    notificationId: number;
    userId?: string;
    title?: string;
    message: string;
    notificationType?: string;
    deliveryMethod?: string;
    isSent?: boolean;
    isRead?: boolean;
    actionUrl?: string;
    relatedEntityId?: number | null;
    relatedEntityType?: string | null;
    createdAt: string;
};

export type OverdueCreditReminder = {
    salesInvoiceId: number;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhoneNumber?: null | string;
    vehicleNumber: string;
    finalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    invoiceDate: string;
    dueDate?: null | string;
    hasInvoicePdf: boolean;
    lastReminderSentAt?: null | string;
};

export type OverdueCreditReminderSendResult = {
    salesInvoiceId: number;
    invoiceNumber: string;
    recipientEmail: string;
    sentAt: string;
};
