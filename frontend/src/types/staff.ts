export type Staff = {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    isActive?: boolean;
    roles?: string[];
};