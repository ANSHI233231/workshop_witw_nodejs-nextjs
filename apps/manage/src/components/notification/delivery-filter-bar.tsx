'use client';

import { useRouter } from 'next/navigation';

import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import { DELIVERY_LOG_PATH, deliveryUrl } from '@/components/notification/notification-url';
import { type DeliveryFilters, NOTIFICATION_LIMITS } from '@/types/notification.types';

import { CHANNEL_OPTIONS, CHANNELS, DELIVERY_BADGES, DELIVERY_STATUS_OPTIONS } from './notification-labels';

export type TemplateChoice = { readonly code: string; readonly name: string };

export function DeliveryFilterBar({
    filters,
    templates,
}: {
    readonly filters: DeliveryFilters;
    readonly templates: readonly TemplateChoice[];
}) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(deliveryUrl({ ...filters, search, page: 1 })),
    );
    const goTo = (changes: Partial<DeliveryFilters>) =>
        router.push(deliveryUrl({ ...filters, search: text.trim(), ...changes, page: 1 }));

    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by recipient, subject or title…')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={NOTIFICATION_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Channel')}
                value={filters.channel ?? ''}
                onChange={(event) =>
                    goTo({ channel: CHANNEL_OPTIONS.find((channel) => String(channel) === event.target.value) })
                }
            >
                <option value="">{t('Channel: All')}</option>
                {CHANNEL_OPTIONS.map((channel) => (
                    <option key={channel} value={channel}>
                        {t(CHANNELS[channel].label)}
                    </option>
                ))}
            </select>
            <select
                className="select fw-sm"
                aria-label={t('Template')}
                value={filters.template ?? ''}
                onChange={(event) => goTo({ template: event.target.value || undefined })}
            >
                <option value="">{t('Template: All')}</option>
                {templates.map((template) => (
                    <option key={template.code} value={template.code}>
                        {template.name}
                    </option>
                ))}
            </select>
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) =>
                    goTo({ status: DELIVERY_STATUS_OPTIONS.find((status) => String(status) === event.target.value) })
                }
            >
                <option value="">{t('Status: All')}</option>
                {DELIVERY_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                        {t(DELIVERY_BADGES[status].label)}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(DELIVERY_LOG_PATH);
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
