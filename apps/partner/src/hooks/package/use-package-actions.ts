'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { announcePackageNotice } from '@/components/package-editor/package-notice';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import {
    deletePackageVersion,
    sendPackageVersion,
    setPackageWebsiteStatus,
    startPackageEdit,
} from '@/services/package.service';
import { PackageWebsiteStatus } from '@/types/package.types';

const STALE_CODES: ReadonlySet<string> = new Set([
    'PACKAGE_VERSION_NOT_EDITABLE',
    'PACKAGE_WORKING_VERSION_EXISTS',
    'PACKAGE_NOT_LIVE',
    'PACKAGE_DELETED',
    'PACKAGE_NOT_FOUND',
    'PACKAGE_VERSION_NOT_FOUND',
    'PACKAGE_VERSION_NOT_SENDABLE',
    'PACKAGE_VERSION_NOT_DELETABLE',
    'PACKAGE_WEBSITE_STATUS_SAME',
    'PACKAGE_PARTNER_NOT_ACTIVE',
]);

export const PACKAGES_PATH = '/packages';

export function usePackageActions() {
    const t = useT();
    const router = useRouter();
    const pathname = usePathname();
    const [busy, setBusy] = useState<number | null>(null);

    const run = async (id: number, work: () => Promise<void>) => {
        if (busy !== null) return;
        setBusy(id);
        try {
            await work();
        } catch (error) {
            const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
            announcePackageNotice(known ? t(error.message) : t('This could not be done. Please try again.'), true);
            if (known && STALE_CODES.has(error.code)) router.refresh();
        } finally {
            setBusy(null);
        }
    };

    return {
        busy,
        send: (packageId: number, versionId: number, versionNumber: number) =>
            run(packageId, async () => {
                await sendPackageVersion(packageId, versionId);
                announcePackageNotice(t('Version {n} sent for approval.', { n: versionNumber }), false);
                router.refresh();
            }),
        discard: (packageId: number, versionId: number) =>
            run(packageId, async () => {
                const outcome = await deletePackageVersion(packageId, versionId);
                announcePackageNotice(t('Draft discarded.'), false);
                if (outcome.packageLeftList && pathname !== PACKAGES_PATH) router.push(PACKAGES_PATH);
                else router.refresh();
            }),
        setActive: (packageId: number, name: string, active: boolean) =>
            run(packageId, async () => {
                await setPackageWebsiteStatus(
                    packageId,
                    active ? PackageWebsiteStatus.ACTIVE : PackageWebsiteStatus.INACTIVE,
                );
                announcePackageNotice(
                    active
                        ? t('{name} is now active on the website.', { name })
                        : t('{name} is now inactive on the website.', { name }),
                    false,
                );
                router.refresh();
            }),
        startEdit: (packageId: number, openAfter: boolean) =>
            run(packageId, async () => {
                await startPackageEdit(packageId);
                announcePackageNotice(t('A new draft is made from the live version.'), false);
                if (openAfter) router.push(`${PACKAGES_PATH}/${packageId}`);
                else router.refresh();
            }),
    };
}
