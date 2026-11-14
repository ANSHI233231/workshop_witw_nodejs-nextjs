import type {
    BasicBody,
    DayBody,
    FaqBody,
    InclusionsBody,
    PackageImageKindKey,
    SavedSection,
} from '@/types/package.types';

import { apiClient } from './api-client';

const BASE = '/package/portal';

const versionPath = (packageId: number, versionId: number): string =>
    `${BASE}/packages/${packageId}/versions/${versionId}`;

const imageBody = (image: File): FormData => {
    const body = new FormData();
    body.append('image', image);
    return body;
};

export const savePackageBasic = (packageId: number, versionId: number, body: BasicBody): Promise<SavedSection> =>
    apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/basic`, body);

export const savePackageItinerary = (
    packageId: number,
    versionId: number,
    days: readonly DayBody[],
): Promise<SavedSection> => apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/itinerary`, { days });

export const savePackageInclusions = (
    packageId: number,
    versionId: number,
    body: InclusionsBody,
): Promise<SavedSection> => apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/inclusions`, body);

export const savePackageGettingThere = (
    packageId: number,
    versionId: number,
    gettingThere: string | null,
): Promise<SavedSection> =>
    apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/getting-there`, { gettingThere });

export const savePackageFaqs = (
    packageId: number,
    versionId: number,
    faqs: readonly FaqBody[],
): Promise<SavedSection> => apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/faqs`, { faqs });

export const uploadPackageImage = (
    packageId: number,
    versionId: number,
    kind: PackageImageKindKey,
    image: File,
): Promise<SavedSection> =>
    apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/images/${kind}`, imageBody(image));

export const removePackageImage = (
    packageId: number,
    versionId: number,
    kind: PackageImageKindKey,
): Promise<SavedSection> => apiClient.delete<SavedSection>(`${versionPath(packageId, versionId)}/images/${kind}`);

export const uploadDayImage = (
    packageId: number,
    versionId: number,
    dayNumber: number,
    image: File,
): Promise<SavedSection> =>
    apiClient.put<SavedSection>(`${versionPath(packageId, versionId)}/days/${dayNumber}/image`, imageBody(image));

export const removeDayImage = (packageId: number, versionId: number, dayNumber: number): Promise<SavedSection> =>
    apiClient.delete<SavedSection>(`${versionPath(packageId, versionId)}/days/${dayNumber}/image`);

export const packageFileUrl = (packageId: number, versionId: number, fileName: string): string =>
    apiClient.fileUrl(`${versionPath(packageId, versionId)}/files/${encodeURIComponent(fileName)}`);
