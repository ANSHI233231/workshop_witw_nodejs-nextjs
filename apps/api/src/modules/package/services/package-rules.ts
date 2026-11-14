import { PartnerStatus } from '../../partner';
import type { ShownCondition } from '../repositories/package-website.repository';
import {
    PortalAction,
    type PortalActionKey,
    type PackageRow,
    PackageVersionStatus,
    PackageWebsiteStatus,
} from '../types/package.types';

export const SHOWN: ShownCondition = [PackageWebsiteStatus.ACTIVE, PartnerStatus.ACTIVE];

export const isShown = (row: PackageRow): boolean =>
    row.live_version_id !== null &&
    row.website_status === PackageWebsiteStatus.ACTIVE &&
    row.partner_status === PartnerStatus.ACTIVE;

export const partnerIsActive = (row: PackageRow): boolean => row.partner_status === PartnerStatus.ACTIVE;

export const hasBeenLive = (row: PackageRow): boolean => row.first_live_at !== null;

const toggleOf = (row: PackageRow): PortalActionKey =>
    row.website_status === PackageWebsiteStatus.ACTIVE ? PortalAction.MAKE_INACTIVE : PortalAction.MAKE_ACTIVE;

export const portalActionsOf = (row: PackageRow): PortalActionKey[] => {
    if (row.website_status === PackageWebsiteStatus.DELETED_BY_ADMIN) return [PortalAction.VIEW];
    const working = row.working_status;
    const isLive = row.live_version_id !== null;
    if (working === PackageVersionStatus.WAITING) return isLive ? [PortalAction.VIEW, toggleOf(row)] : [PortalAction.VIEW];
    if (working === PackageVersionStatus.DRAFT || working === PackageVersionStatus.REJECTED) {
        return isLive
            ? [PortalAction.EDIT, PortalAction.SEND, PortalAction.DELETE_DRAFT, toggleOf(row)]
            : [PortalAction.EDIT, PortalAction.SEND, PortalAction.DELETE];
    }
    return isLive ? [PortalAction.EDIT, toggleOf(row)] : [PortalAction.VIEW];
};

export const consoleActionsOf = (row: PackageRow): PortalActionKey[] =>
    row.website_status === PackageWebsiteStatus.DELETED_BY_ADMIN
        ? [PortalAction.VIEW]
        : [PortalAction.VIEW, PortalAction.EDIT, PortalAction.DELETE];
