import type { DashboardPackage } from '@/types/package.types';

import { getPartnerDashboard } from './package.service';
import { getPortalQuoteSummary } from './quote-request.service';

export type DashboardSummary = {
    readonly activeQuoteRequests: number;
    readonly latestPackages: readonly DashboardPackage[];
};

export const getDashboardSummary = async (accessToken?: string): Promise<DashboardSummary> => {
    const [dashboard, quotes] = await Promise.all([
        getPartnerDashboard(accessToken),
        getPortalQuoteSummary(accessToken),
    ]);
    return { activeQuoteRequests: quotes.activeCount, latestPackages: dashboard.latestActivePackages };
};
