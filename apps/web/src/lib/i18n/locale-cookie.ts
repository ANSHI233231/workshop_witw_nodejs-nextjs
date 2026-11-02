import { config } from '@/lib/config';

import { LOCALE_COOKIE, type Locale } from './locale';

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export const saveLocale = (locale: Locale): void => {
    const domain = config.localeCookieDomain ? `; domain=${config.localeCookieDomain}` : '';
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${domain}`;
};
