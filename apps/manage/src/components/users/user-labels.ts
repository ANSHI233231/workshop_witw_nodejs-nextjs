import { SystemRole, UserStatus, type UserStatusCode } from '@/types/users.types';

export const STATUS_BADGES: Readonly<Record<UserStatusCode, { readonly className: string; readonly label: string }>> = {
    [UserStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
    [UserStatus.INACTIVE]: { className: 'badge badge-neutral', label: 'Inactive' },
};

export const SYSTEM_ROLE_OPTIONS: readonly {
    readonly id: number;
    readonly label: string;
}[] = [{ id: SystemRole.SUPER_ADMIN, label: 'Super Admin' }];
