'use client';

import { useRouter } from 'next/navigation';

import { ResetIcon, SearchIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { useSearchText } from '@/hooks/list/use-search-text';
import {
    NOTIFICATION_LIMITS,
    type NotificationTemplateStatusCode,
    type TemplateFilters,
} from '@/types/notification.types';

import { TEMPLATE_STATUS_OPTIONS } from './notification-labels';
import { templatesUrl } from './notification-url';

export function TemplateFilterBar({ filters }: { readonly filters: TemplateFilters }) {
    const t = useT();
    const router = useRouter();
    const [text, setText, clearText] = useSearchText(filters.search, (search) =>
        router.replace(templatesUrl({ ...filters, search })),
    );
    return (
        <div className="filter-bar">
            <div className="input-group fw-md">
                <SearchIcon />
                <input
                    className="input"
                    placeholder={t('Search by name, subject or title…')}
                    aria-label={t('Search')}
                    value={text}
                    maxLength={NOTIFICATION_LIMITS.SEARCH}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <select
                className="select fw-sm"
                aria-label={t('Status')}
                value={filters.status ?? ''}
                onChange={(event) =>
                    router.push(
                        templatesUrl({
                            ...filters,
                            search: text.trim(),
                            status: TEMPLATE_STATUS_OPTIONS.find(
                                (option) => String(option.value) === event.target.value,
                            )?.value as NotificationTemplateStatusCode | undefined,
                        }),
                    )
                }
            >
                <option value="">{t('Status: All')}</option>
                {TEMPLATE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.label)}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                    clearText();
                    router.push(templatesUrl({ tab: filters.tab, search: '', status: undefined }));
                }}
            >
                <ResetIcon />
                {t('Reset')}
            </button>
        </div>
    );
}
