import Link from 'next/link';

import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { PARK_REGION_LABEL, type ParkDetail } from '@/types/park.types';

import { ParkDetailActions } from './park-detail-actions';
import { NO_VALUE, PARK_STATUS_BADGE, parkLocation, parkPriceRange, safariBadge, safariDates } from './park-format';
import { PARKS_PATH, sharedSafariPath } from './park-url';

const WEB_ADDRESS = /^https?:/;

function Empty() {
    return <span className="empty-value">{NO_VALUE}</span>;
}

export async function ParkDetailView({ park }: { readonly park: ParkDetail }) {
    const { t } = await serverTranslator();
    const badge = PARK_STATUS_BADGE[park.status];
    const price = parkPriceRange(park);
    const website = park.officialWebsite && WEB_ADDRESS.test(park.officialWebsite) ? park.officialWebsite : null;
    const safaris = park.upcomingSafaris;

    return (
        <div className="page ssc-screen">
            <div className="ss-stack-lg">
                <div>
                    <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                        <a>{t('Shared Safari')}</a>
                        <BreadcrumbChevronIcon />
                        <Link href={PARKS_PATH}>{t('Parks')}</Link>
                        <BreadcrumbChevronIcon />
                        <span>{park.name}</span>
                    </nav>
                    <div className="page-head">
                        <div className="ssc-head">
                            <h1 className="page-title">{park.name}</h1>
                            <span className={badge.className}>{t(badge.label)}</span>
                        </div>
                        <ParkDetailActions park={park} />
                    </div>
                </div>
                <div className="card">
                    <dl className="ss-dl">
                        <dt>{t('Region')}</dt>
                        <dd>{t(PARK_REGION_LABEL[park.region])}</dd>
                        <dt>{t('Slug')}</dt>
                        <dd>{park.slug}</dd>
                        <dt>{t('Avg. price')}</dt>
                        <dd>{price ? t('{range} per safari', { range: price }) : NO_VALUE}</dd>
                        <dt>{t('Location')}</dt>
                        <dd>{parkLocation(park.latitude, park.longitude)}</dd>
                        <dt>{t('Feature image')}</dt>
                        <dd>{park.featureImage ? park.featureImage : <Empty />}</dd>
                        <dt>{t('Website')}</dt>
                        <dd>
                            {website ? (
                                <a href={website} target="_blank" rel="noopener">
                                    {website}
                                </a>
                            ) : (
                                <Empty />
                            )}
                        </dd>
                        <dt>{t('Description')}</dt>
                        <dd>{park.shortDescription?.trim() || NO_VALUE}</dd>
                    </dl>
                </div>
                <div className="table-card">
                    <div className="table-top">
                        <span className="ss-group">
                            {t('Upcoming shared safaris ({count})', { count: safaris.length })}
                        </span>
                    </div>
                    <div className="table-scroll ssc-only-desktop">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">{t('Title')}</th>
                                    <th scope="col">{t('Dates')}</th>
                                    <th scope="col">{t('Host')}</th>
                                    <th scope="col" className="col-status">
                                        {t('Status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {safaris.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <Empty />
                                        </td>
                                    </tr>
                                ) : (
                                    safaris.map((safari) => {
                                        const status = safariBadge(safari);
                                        return (
                                            <tr key={safari.id}>
                                                <td>
                                                    <Link href={sharedSafariPath(safari.id)}>{safari.title}</Link>
                                                </td>
                                                <td>{safariDates(safari.startDate, safari.endDate)}</td>
                                                <td>{safari.hostName}</td>
                                                <td className="col-status">
                                                    <span className={status.className}>{t(status.label)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="ssc-list ssc-only-mobile">
                        {safaris.length === 0 ? (
                            <div className="ssc-card">
                                <Empty />
                            </div>
                        ) : (
                            safaris.map((safari) => {
                                const status = safariBadge(safari);
                                return (
                                    <Link
                                        key={safari.id}
                                        className="ssc-card"
                                        href={sharedSafariPath(safari.id)}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div className="ss-between">
                                            <b>{safari.title}</b>
                                            <span className={status.className}>{t(status.label)}</span>
                                        </div>
                                        <span className="ss-cap">
                                            {safariDates(safari.startDate, safari.endDate)} · {safari.hostName}
                                        </span>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
