'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import {
    approvePackageVersion,
    setPackageBestDeal,
    setPackagePopular,
} from '@/services/package.service';
import type { ApprovalItem, PackageListItem } from '@/types/package.types';

export type PackageNotice = { readonly message: string; readonly isError: boolean };

const STALE_CODES: ReadonlySet<string> = new Set([
    'PACKAGE_VERSION_NOT_WAITING',
    'PACKAGE_NOT_FOUND',
    'PACKAGE_VERSION_NOT_FOUND',
    'PACKAGE_DELETED',
    'PACKAGE_NOT_LIVE',
]);

export function usePackageConsoleActions() {
    const t = useT();
    const router = useRouter();
    const [refreshing, startRefresh] = useTransition();
    const refresh = () => startRefresh(() => router.refresh());
    const [busy, setBusy] = useState<number | null>(null);
    const [notice, setNotice] = useState<PackageNotice | null>(null);

    const run = async (id: number, work: () => Promise<string>) => {
        if (busy !== null) return;
        setBusy(id);
        try {
            setNotice({ message: await work(), isError: false });
            refresh();
        } catch (error) {
            const known = error instanceof ApiError && error.code !== ApiError.NETWORK_ERROR;
            setNotice({
                message: known ? t(error.message) : t('This could not be done. Please try again.'),
                isError: true,
            });
            if (known && STALE_CODES.has(error.code)) refresh();
        } finally {
            setBusy(null);
        }
    };

    return {
        busy,
        refreshing,
        notice,
        clearNotice: () => setNotice(null),
        say: (message: string) => {
            setNotice({ message, isError: false });
            refresh();
        },
        approve: (item: ApprovalItem) =>
            run(item.packageId, async () => {
                await approvePackageVersion(item.packageId, item.versionId);
                return t('{name} v{n} is live on the website.', { name: item.name, n: item.versionNumber });
            }),
        setPopular: (item: PackageListItem, on: boolean) =>
            run(item.id, async () => {
                await setPackagePopular(item.id, on);
                return on
                    ? t('{name} is marked Popular.', { name: item.name })
                    : t('{name} is no longer Popular.', { name: item.name });
            }),
        setBestDeal: (item: PackageListItem, on: boolean) =>
            run(item.id, async () => {
                await setPackageBestDeal(item.id, on);
                return on
                    ? t('{name} shows the Best deal badge.', { name: item.name })
                    : t('{name} no longer shows Best deal.', { name: item.name });
            }),
    };
}
