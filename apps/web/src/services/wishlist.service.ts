import {
    type WishlistChange,
    type WishlistIds,
    type WishlistPackage,
    type WishlistPage,
    type WishlistSafari,
} from '@/types/wishlist.types';

import { apiClient } from './api-client';

const BASE = '/wishlist';

export const getWishlistIds = (): Promise<WishlistIds> => apiClient.get<WishlistIds>(`${BASE}/ids`);

export const listWishlistPackages = (page: number): Promise<WishlistPage<WishlistPackage>> =>
    apiClient.get<WishlistPage<WishlistPackage>>(`${BASE}/packages`, { query: { page } });

export const listWishlistSafaris = (page: number): Promise<WishlistPage<WishlistSafari>> =>
    apiClient.get<WishlistPage<WishlistSafari>>(`${BASE}/shared-safaris`, { query: { page } });

export const savePackage = (packageId: number): Promise<WishlistChange> =>
    apiClient.put<WishlistChange>(`${BASE}/packages/${packageId}`);

export const removePackage = (packageId: number): Promise<WishlistChange> =>
    apiClient.delete<WishlistChange>(`${BASE}/packages/${packageId}`);

export const saveSafari = (safariId: number): Promise<WishlistChange> =>
    apiClient.put<WishlistChange>(`${BASE}/shared-safaris/${safariId}`);

export const removeSafari = (safariId: number): Promise<WishlistChange> =>
    apiClient.delete<WishlistChange>(`${BASE}/shared-safaris/${safariId}`);
