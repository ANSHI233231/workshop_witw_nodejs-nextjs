import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import type {
    BasicBody,
    DeletedVersion,
    FormOptions,
    PackageListItem,
    PackageView,
    PackageWebsiteStatusCode,
    ParkOfVersion,
    PartnerDashboard,
} from '@/types/package.types';

import { apiClient } from './api-client';
import { packageFileUrl } from './package-editor.service';

const DEFAULT_PACKAGE_PICTURE = '/witw/default-cover.jpg';

const parkPictureUrl = (park: ParkOfVersion | null): string | null =>
    park?.slug && park.featureImage
        ? apiClient.fileUrl(`/park/parks/${encodeURIComponent(park.slug)}/feature-image`, { v: park.featureImage })
        : null;

export const packagePictureSources = (
    packageId: number,
    versionId: number | null,
    packageImage: string | null,
    mainPark: ParkOfVersion | null,
): readonly string[] => {
    const own = versionId !== null && packageImage ? packageFileUrl(packageId, versionId, packageImage) : null;
    const park = parkPictureUrl(mainPark);
    return [...(own ? [own] : []), ...(park ? [park] : []), DEFAULT_PACKAGE_PICTURE];
};

const PORTAL = '/package/portal';

const cookieHeader = (accessToken: string | undefined): Readonly<Record<string, string>> =>
    accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : {};

export const listPackages = (accessToken?: string): Promise<readonly PackageListItem[]> =>
    apiClient.get<readonly PackageListItem[]>(`${PORTAL}/packages`, { headers: cookieHeader(accessToken) });

export const getPackageView = (packageId: number, versionId: number | undefined, accessToken?: string): Promise<PackageView> =>
    apiClient.get<PackageView>(
        versionId === undefined
            ? `${PORTAL}/packages/${packageId}`
            : `${PORTAL}/packages/${packageId}/versions/${versionId}`,
        { headers: cookieHeader(accessToken) },
    );

export const getFormOptions = (accessToken?: string): Promise<FormOptions> =>
    apiClient.get<FormOptions>(`${PORTAL}/form-options`, { headers: cookieHeader(accessToken) });

export const getPartnerDashboard = (accessToken?: string): Promise<PartnerDashboard> =>
    apiClient.get<PartnerDashboard>(`${PORTAL}/dashboard`, { headers: cookieHeader(accessToken) });

export const createPackage = (body: BasicBody): Promise<PackageView> =>
    apiClient.post<PackageView>(`${PORTAL}/packages`, body);

export const startPackageEdit = (packageId: number): Promise<PackageView> =>
    apiClient.post<PackageView>(`${PORTAL}/packages/${packageId}/edit`);

export const sendPackageVersion = (packageId: number, versionId: number): Promise<PackageView> =>
    apiClient.post<PackageView>(`${PORTAL}/packages/${packageId}/versions/${versionId}/send`);

export const deletePackageVersion = (packageId: number, versionId: number): Promise<DeletedVersion> =>
    apiClient.delete<DeletedVersion>(`${PORTAL}/packages/${packageId}/versions/${versionId}`);

export const setPackageWebsiteStatus = (
    packageId: number,
    websiteStatus: PackageWebsiteStatusCode,
): Promise<PackageListItem> =>
    apiClient.put<PackageListItem>(`${PORTAL}/packages/${packageId}/website-status`, { websiteStatus });
