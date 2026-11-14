'use client';

import { EmptyQuoteIcon } from '@/components/portal/portal-icons';
import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';
import { useQuoteMarks } from '@/hooks/quote/use-quote-marks';
import { formatCount, formatDate, formatStamp } from '@/lib/format';
import { type PortalQuoteRequest, QuoteMark, type QuoteMarkCode } from '@/types/quote-request.types';

type Marks = ReturnType<typeof useQuoteMarks>;

const startText = (item: PortalQuoteRequest): string => formatDate(`${item.startDate}T00:00:00+05:30`);

const packageText = (item: PortalQuoteRequest): string => `${item.package.name} (v${item.package.versionNumber})`;

function UserCell({ item, isPhoneShown }: { readonly item: PortalQuoteRequest; readonly isPhoneShown: boolean }) {
    return (
        <div className="pq-cell">
            <b>{item.user.name}</b>
            {isPhoneShown && item.user.phone && <span className="ss-cap">{item.user.phone}</span>}
        </div>
    );
}

function MarkButtons({ item, marks }: { readonly item: PortalQuoteRequest; readonly marks: Marks }) {
    const t = useT();
    const current = marks.markOf(item);
    const button = (code: QuoteMarkCode, label: string, on: string) => (
        <button
            type="button"
            className={current === code ? on : ''}
            aria-pressed={current === code}
            disabled={marks.busy === item.id}
            onClick={() => marks.mark(item, code)}
        >
            {label}
        </button>
    );
    return (
        <div className="pq-seg" role="group" aria-label={t('Mark')}>
            {button(QuoteMark.HOT, t('Hot'), 'is-hot')}
            {button(QuoteMark.COLD, t('Cold'), 'is-cold')}
        </div>
    );
}

export function QuoteRequestRows({
    items,
    isPhoneShown,
}: {
    readonly items: readonly PortalQuoteRequest[];
    readonly isPhoneShown: boolean;
}) {
    const t = useT();
    const marks = useQuoteMarks();
    const empty = (
        <div className="state">
            <EmptyQuoteIcon className="icon state-icon" />
            <p className="state-title">{t('No quote requests yet.')}</p>
        </div>
    );

    return (
        <>
            <div className="table-scroll ssc-only-desktop">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">{t('User')}</th>
                            <th scope="col">{t('Package')}</th>
                            <th scope="col" className="col-center">
                                {t('Travellers')}
                            </th>
                            <th scope="col">{t('Start date')}</th>
                            <th scope="col">{t('Notes')}</th>
                            <th scope="col">{t('Received')}</th>
                            <th scope="col">{t('Mark')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <UserCell item={item} isPhoneShown={isPhoneShown} />
                                </td>
                                <td>{packageText(item)}</td>
                                <td className="col-center">{formatCount(item.travellerCount)}</td>
                                <td>{startText(item)}</td>
                                <td>
                                    <span style={{ display: 'block', maxWidth: 320 }}>{item.notes}</span>
                                </td>
                                <td>{formatStamp(item.receivedAt)}</td>
                                <td>
                                    <MarkButtons item={item} marks={marks} />
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7}>{empty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="ssc-list ssc-only-mobile">
                {items.map((item) => (
                    <div key={item.id} className="ssc-card">
                        <div className="pq-mrow">
                            <UserCell item={item} isPhoneShown={isPhoneShown} />
                        </div>
                        <div className="pq-kv">
                            <span>{t('Package')}</span>
                            <span>{packageText(item)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Travellers')}</span>
                            <span>{formatCount(item.travellerCount)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Start date')}</span>
                            <span>{startText(item)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Notes')}</span>
                            <span>
                                <span style={{ display: 'block', maxWidth: 320 }}>{item.notes}</span>
                            </span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Received')}</span>
                            <span>{formatStamp(item.receivedAt)}</span>
                        </div>
                        <div className="pq-kv">
                            <span>{t('Mark')}</span>
                            <span>
                                <MarkButtons item={item} marks={marks} />
                            </span>
                        </div>
                    </div>
                ))}
                {items.length === 0 && empty}
            </div>
            {marks.notice && (
                <Toast message={marks.notice.message} isError={marks.notice.isError} onClose={marks.clearNotice} />
            )}
        </>
    );
}
