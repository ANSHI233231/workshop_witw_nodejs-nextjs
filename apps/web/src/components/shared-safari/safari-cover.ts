import { safariCoverUrl } from '@/services/shared-safari.service';

export const DEFAULT_COVER = '/witw/default-cover.jpg';

export const coverSource = (id: number, coverVersion: string | null): string =>
    coverVersion ? safariCoverUrl(id, coverVersion) : DEFAULT_COVER;
