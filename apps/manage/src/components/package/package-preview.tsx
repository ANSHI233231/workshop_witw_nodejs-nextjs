'use client';

import { useEffect, useState } from 'react';

import {
    durationText,
    INCLUSION_OPTIONS,
    labelOf,
    MEALS_INCLUSION,
    PICK_DROP_INCLUSION,
    rupees,
    SAFARI_TYPE_OPTIONS,
    STAY_OPTIONS,
    THEME_OPTIONS,
    VEHICLE_OPTIONS,
} from '@/components/package-editor/package-labels';
import { useT } from '@/hooks/i18n/use-t';
import { FallbackImage } from '@/components/package/fallback-image';
import { packageFileUrl } from '@/services/package-editor.service';
import { packagePictureSources } from '@/services/package.service';
import type { GalleryCopy, PackageView } from '@/types/package.types';

import {
    BedIcon,
    CameraIcon,
    CarIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockFactIcon,
    CrossIcon,
    FlagIcon,
    PinIcon,
    StarIcon,
    TickIcon,
    UtensilsIcon,
} from './package-preview-icons';

const SLIDE_MS = 3000;

type PreviewTab = 'overview' | 'itinerary' | 'inclusions' | 'gettingThere' | 'faqs';

const TABS: readonly { readonly key: PreviewTab; readonly label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'inclusions', label: 'Inclusions' },
    { key: 'gettingThere', label: 'Getting there' },
    { key: 'faqs', label: 'FAQs' },
];

function Slider({
    gallery,
    packageId,
    versionId,
}: {
    readonly gallery: GalleryCopy;
    readonly packageId: number;
    readonly versionId: number;
}) {
    const t = useT();
    const count = gallery.photos.length;
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (count < 2) return;
        const timer = setInterval(() => setIndex((current) => (current + 1) % count), SLIDE_MS);
        return () => clearInterval(timer);
    }, [count]);
    const photo = gallery.photos[index % count];
    if (!photo) return null;
    const move = (step: number) => setIndex((current) => (current + step + count) % count);
    return (
        <>
            <p className="pk2-gt">{gallery.title ?? t('Gallery')}</p>
            <div className="pk2-slider" aria-roledescription="carousel" aria-label={gallery.title ?? t('Gallery')}>
                <img src={packageFileUrl(packageId, versionId, photo.fileName)} alt={photo.title ?? ''} />
                <span className="pk2-dots">
                    {index + 1} / {count}
                </span>
                <button type="button" className="pk2-arrow is-l" aria-label={t('Previous photo')} onClick={() => move(-1)}>
                    <ChevronLeftIcon />
                </button>
                <button type="button" className="pk2-arrow is-r" aria-label={t('Next photo')} onClick={() => move(1)}>
                    <ChevronRightIcon />
                </button>
                {(photo.title || photo.caption) && (
                    <div className="pk2-cap">
                        <b>{photo.title}</b>
                        <span>{photo.caption}</span>
                    </div>
                )}
            </div>
        </>
    );
}

export function PackagePreview({ view }: { readonly view: PackageView }) {
    const t = useT();
    const [tab, setTab] = useState<PreviewTab>('overview');
    const [openFaq, setOpenFaq] = useState<ReadonlySet<number>>(new Set());
    const { package: pkg, version } = view;
    const includedOf = (code: number) => version.inclusions.find((choice) => choice.inclusion === code)?.isIncluded === true;
    const parks = version.parks.map((park) => park.name).join(', ');
    const typeLabel = t(labelOf(SAFARI_TYPE_OPTIONS, version.safariType));
    const activity =
        version.activityMessage ??
        `${version.safariCount} ${typeLabel} ${version.safariCount === 1 ? t('Safari') : t('Safaris')}`;
    const facts = [
        { Icon: ClockFactIcon, label: 'Trip Duration', value: t(durationText(version.dayCount)) },
        { Icon: CarIcon, label: 'Safaris', value: activity },
        { Icon: CarIcon, label: 'Vehicle', value: t(labelOf(VEHICLE_OPTIONS, version.vehicle)) },
        { Icon: BedIcon, label: 'Stay', value: t(labelOf(STAY_OPTIONS, version.stay)) },
        { Icon: CameraIcon, label: 'Theme', value: t(labelOf(THEME_OPTIONS, version.theme)) },
        { Icon: PinIcon, label: 'Start place', value: version.startPlace ?? '–' },
        { Icon: FlagIcon, label: 'End place', value: version.endPlace ?? '–' },
        { Icon: UtensilsIcon, label: 'Meals', value: includedOf(MEALS_INCLUSION) ? t('Included') : t('Not Included') },
        { Icon: CarIcon, label: 'Pick & Drop', value: includedOf(PICK_DROP_INCLUSION) ? t('Included') : t('Not Included') },
    ];
    const mainPark = version.parks.find((park) => park.isMain) ?? null;
    const pictures = packagePictureSources(pkg.id, version.id, version.packageImage, mainPark);

    return (
        <div className="pq-pv">
            <div className="pk2-top">
                <div className="pk2-main">
                    <div className="pk2-pic">
                        <FallbackImage sources={pictures} />
                    </div>
                    <div>
                        <h2 className="pk2-name">{version.name}</h2>
                        <div className="pk2-parks">
                            <PinIcon />
                            <span>{parks}</span>
                        </div>
                        <div className="pk2-tags">
                            {version.tag.text && (
                                <span
                                    className="pk-tag"
                                    style={{ background: version.tag.backgroundColor, color: version.tag.textColor }}
                                >
                                    {version.tag.text}
                                </span>
                            )}
                            {pkg.isBestDeal && (
                                <span className="pk-best">
                                    <StarIcon />
                                    {t('Best deal')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pk2-facts">
                    {facts.map((fact) => (
                        <div className="pk2-fact" key={fact.label}>
                            <fact.Icon />
                            <div>
                                <small>{t(fact.label)}</small>
                                <b>{fact.value}</b>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pk2-pricebar">
                <span></span>
                <div className="pk2-price">
                    <div>
                        {version.priceBeforeDiscount !== null && (
                            <span className="pk-old">{rupees(version.priceBeforeDiscount)}</span>
                        )}
                        <span className="pk-ppp">
                            {rupees(version.pricePerPerson)} <small>{t('/Person')}</small>
                        </span>
                        <span className="pk-tot">{t('Total Price {price}', { price: rupees(version.totalPrice) })}</span>
                        <span className="pk-tot">{version.priceMessage ?? t('Include taxes and fees')}</span>
                    </div>
                </div>
            </div>
            <div className="pk2-body" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                <div className="pk2-col">
                    <div className="nt-tabs pk2-tabs" role="tablist">
                        {TABS.map((item) => (
                            <a
                                key={item.key}
                                className={tab === item.key ? 'nt-tab is-on' : 'nt-tab'}
                                role="tab"
                                aria-selected={tab === item.key}
                                onClick={() => setTab(item.key)}
                            >
                                {t(item.label)}
                            </a>
                        ))}
                    </div>
                    {tab === 'overview' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Overview')}</div>
                            <div className="pk2-sec-b">
                                {version.overview ? <p className="pk2-text">{version.overview}</p> : null}
                                {!version.overview && !version.gallery && <p className="pk2-text">{t('No details yet.')}</p>}
                                {version.gallery && version.gallery.photos.length > 0 && (
                                    <Slider gallery={version.gallery} packageId={pkg.id} versionId={version.id} />
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'itinerary' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Itinerary')}</div>
                            <div>
                                {version.days.map((day) => {
                                    const meals = [
                                        day.hasBreakfast ? t('Breakfast') : null,
                                        day.hasLunch ? t('Lunch') : null,
                                        day.hasDinner ? t('Dinner') : null,
                                    ].filter(Boolean);
                                    const route = [day.startLocation, day.endLocation].filter(Boolean).join(' → ');
                                    const rows: readonly (readonly [string, string])[] = [
                                        [t('Route'), route],
                                        [t('Hotel'), day.hotelName ?? ''],
                                        [t('Meals'), meals.join(', ')],
                                        [t('Activity'), day.activity ?? ''],
                                        [t('Accommodation'), day.accommodation ?? ''],
                                        [t('Note'), day.note ?? ''],
                                    ];
                                    return (
                                        <div className="pk2-day" key={day.id}>
                                            <h3>
                                                <span>{t('Day {n}', { n: day.dayNumber })}:</span> {day.title}
                                            </h3>
                                            <p className="pk2-text">{day.description}</p>
                                            <dl className="pk2-dl">
                                                {rows
                                                    .filter(([, value]) => value !== '')
                                                    .map(([label, value]) => (
                                                        <div key={label} style={{ display: 'contents' }}>
                                                            <dt>{label}</dt>
                                                            <dd>{value}</dd>
                                                        </div>
                                                    ))}
                                            </dl>
                                            {day.dayImage && (
                                                <img
                                                    className="pk2-dimg"
                                                    src={packageFileUrl(pkg.id, version.id, day.dayImage)}
                                                    alt=""
                                                />
                                            )}
                                            {day.gallery && day.gallery.photos.length > 0 && (
                                                <Slider gallery={day.gallery} packageId={pkg.id} versionId={version.id} />
                                            )}
                                        </div>
                                    );
                                })}
                                {version.days.length === 0 && (
                                    <div className="pk2-day">
                                        <p className="pk2-text">{t('No itinerary yet.')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'inclusions' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Inclusions')}</div>
                            <div className="pk2-sec-b">
                                <div className="pk2-inc">
                                    {[
                                        { title: 'Included', css: 'is-y', on: true },
                                        { title: 'Not included', css: 'is-n', on: false },
                                    ].map((group) => (
                                        <div key={group.title}>
                                            <h3>{t(group.title)}</h3>
                                            <ul>
                                                {INCLUSION_OPTIONS.filter((option) => includedOf(option.code) === group.on).map(
                                                    (option) => (
                                                        <li className={group.css} key={option.code}>
                                                            {group.on ? <TickIcon /> : <CrossIcon />}
                                                            {t(option.label)}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                {version.moreInclusions && (
                                    <div>
                                        <h3 className="pk2-gt">{t('More inclusions')}</h3>
                                        <p className="pk2-text">{version.moreInclusions}</p>
                                    </div>
                                )}
                                {version.exclusions && (
                                    <div>
                                        <h3 className="pk2-gt">{t('Exclusions')}</h3>
                                        <p className="pk2-text">{version.exclusions}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'gettingThere' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Getting there')}</div>
                            <div className="pk2-sec-b">
                                <p className="pk2-text">{version.gettingThere ?? t('No details yet.')}</p>
                            </div>
                        </div>
                    )}
                    {tab === 'faqs' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('FAQs')}</div>
                            <div>
                                {version.faqs.map((faq, index) => {
                                    const open = openFaq.has(index);
                                    return (
                                        <div className="pk2-faq" key={faq.id}>
                                            <button
                                                type="button"
                                                aria-expanded={open}
                                                onClick={() =>
                                                    setOpenFaq((current) => {
                                                        const next = new Set(current);
                                                        if (!next.delete(index)) next.add(index);
                                                        return next;
                                                    })
                                                }
                                            >
                                                {faq.question}
                                                <ChevronDownIcon />
                                            </button>
                                            {open && <p>{faq.answer}</p>}
                                        </div>
                                    );
                                })}
                                {version.faqs.length === 0 && (
                                    <div className="pk2-day">
                                        <p className="pk2-text">{t('No FAQs yet.')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="pk2-disc">
                        <h2>{t('Disclaimer')}</h2>
                        <p>
                            {t(
                                'This tour is operated by our authorised safari tour operator, not directly by Walk Into The Wild. This tour is governed by the terms and conditions set forth by Walk Into The Wild.',
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
