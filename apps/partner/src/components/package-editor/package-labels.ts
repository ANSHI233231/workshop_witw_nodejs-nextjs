import {
    PackageVersionStatus,
    type PackageVersionStatusCode,
    PackageWebsiteStatus,
    type PackageWebsiteStatusCode,
} from '@/types/package.types';

export type CodeOption = { readonly code: number; readonly label: string };

export const SAFARI_TYPE_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Shared' },
    { code: 2, label: 'Private' },
];

export const VEHICLE_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Gypsy / Jeep' },
    { code: 2, label: 'Canter / Bus' },
    { code: 3, label: 'Other (Elephant, Boat)' },
];

export const THEME_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Photography' },
    { code: 2, label: 'Safari Experience' },
    { code: 3, label: 'Wildlife Exploration' },
];

export const STAY_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Premium' },
    { code: 2, label: 'Standard' },
    { code: 3, label: 'Economical' },
    { code: 4, label: 'Not Included' },
    { code: 5, label: 'Forest Rest House' },
    { code: 6, label: 'Home Stay' },
];

export const FEATURE_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Multiple Parks' },
    { code: 2, label: 'Customizable' },
    { code: 3, label: 'Private Room' },
    { code: 4, label: 'Shared Room' },
    { code: 5, label: 'Private Safari' },
    { code: 6, label: 'Shared Safari' },
    { code: 7, label: 'Photography Special' },
    { code: 8, label: 'Forest Rest House Stay' },
    { code: 9, label: 'Other Activities' },
];

export const INCLUSION_OPTIONS: readonly CodeOption[] = [
    { code: 1, label: 'Accommodation' },
    { code: 2, label: 'Meals' },
    { code: 3, label: 'Pick & Drop' },
    { code: 4, label: 'Camera Fee' },
    { code: 5, label: 'Permit' },
    { code: 6, label: 'Guide Fee' },
];

export const MEALS_INCLUSION = 2;

export const PICK_DROP_INCLUSION = 3;

export const labelOf = (options: readonly CodeOption[], code: number): string =>
    options.find((option) => option.code === code)?.label ?? '';

export const VERSION_STATUS_BADGE: Readonly<
    Record<PackageVersionStatusCode, { readonly label: string; readonly css: string }>
> = {
    [PackageVersionStatus.DRAFT]: { label: 'Draft', css: 'badge badge-neutral' },
    [PackageVersionStatus.WAITING]: { label: 'Waiting for approval', css: 'badge badge-warning' },
    [PackageVersionStatus.REJECTED]: { label: 'Rejected', css: 'badge badge-danger' },
    [PackageVersionStatus.LIVE]: { label: 'Approved', css: 'badge badge-success' },
    [PackageVersionStatus.REPLACED]: { label: 'Replaced', css: 'badge badge-neutral' },
    [PackageVersionStatus.DISCARDED]: { label: 'Deleted', css: 'badge badge-neutral' },
};

export const WEBSITE_STATUS_BADGE: Readonly<
    Record<PackageWebsiteStatusCode, { readonly label: string; readonly css: string }>
> = {
    [PackageWebsiteStatus.NOT_LIVE]: { label: 'Not live yet', css: 'badge badge-neutral' },
    [PackageWebsiteStatus.ACTIVE]: { label: 'Active', css: 'badge badge-success' },
    [PackageWebsiteStatus.INACTIVE]: { label: 'Inactive', css: 'badge badge-neutral' },
    [PackageWebsiteStatus.DELETED_BY_ADMIN]: { label: 'Deleted by Super Admin', css: 'badge badge-danger' },
};

export const nightsText = (dayCount: number): string => {
    const nights = Math.max(0, dayCount - 1);
    return `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
};

export const daysText = (dayCount: number): string => `${dayCount} ${dayCount === 1 ? 'Day' : 'Days'}`;

export const durationText = (dayCount: number): string => `${nightsText(dayCount)}, ${daysText(dayCount)}`;

const RUPEES = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const rupees = (amount: number): string => `₹${RUPEES.format(amount)}`;
