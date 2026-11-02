'use client';

import { useRouter } from 'next/navigation';

import { PageButtons } from '@/components/ui/page-buttons';
import { useT } from '@/hooks/i18n/use-t';
import { formatCount } from '@/lib/format';
import { type ListParams, listUrl } from '@/lib/list-url';

export function TablePager({
    path,
    params,
    page,
    total,
    totalPages,
    limit,
}: {
    readonly path: string;
    readonly params: ListParams;
    readonly page: number;
    readonly total: number;
    readonly totalPages: number;
    readonly limit: number;
}) {
    const t = useT();
    const router = useRouter();
    const goTo = (target: number) => router.push(listUrl(path, { ...params, page: target }));
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className="page-pager">
            <span>
                {total > 0
                    ? t('Showing {from}–{to} of {total}', {
                          from: formatCount(from),
                          to: formatCount(to),
                          total: formatCount(total),
                      })
                    : t('Showing 0 of 0')}
            </span>
            <PageButtons page={page} totalPages={totalPages} onPage={goTo} />
        </div>
    );
}
