'use client';

import { type ReactNode, useState } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { cn } from '@/lib/class-names';
import {
    activityText,
    cardImageSources,
    durationText,
    priceMessageOf,
} from '@/lib/package-format';
import { rupees } from '@/lib/shared-safari-format';
import { packageFileUrl } from '@/services/package.service';
import {
    INCLUSION_OPTIONS,
    labelOf,
    MEALS_INCLUSION,
    type PackageDay,
    type PackageDetail,
    PICK_DROP_INCLUSION,
    STAY_OPTIONS,
    THEME_OPTIONS,
    VEHICLE_OPTIONS,
} from '@/types/package.types';

import { CarIcon, MapPinIcon } from '../shared-safari/safari-icons';

import { FallbackImage } from './fallback-image';
import {
    BedIcon,
    CameraIcon,
    CheckIcon,
    ChevronDownIcon,
    ClockIcon,
    CrossIcon,
    FlagIcon,
    StarIcon,
    UtensilsIcon,
} from './package-icons';
import { PackageSlider } from './package-slider';
import { type QuoteViewer, QuoteForm } from './quote-form';

const TABS = ['overview', 'itinerary', 'inclusions', 'getting-there', 'faqs'] as const;

type TabKey = (typeof TABS)[number];

const TAB_LABEL: Readonly<Record<TabKey, string>> = {
    overview: 'Overview',
    itinerary: 'Itinerary',
    inclusions: 'Inclusions',
    'getting-there': 'Getting there',
    faqs: 'FAQs',
};

const NO_VALUE = '–';

const scrollToQuote = (): void => {
    document.getElementById('pk-quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function Fact({ icon, label, value }: { readonly icon: ReactNode; readonly label: string; readonly value: string }) {
    return (
        <div className="pk2-fact">
            {icon}
            <div>
                <small>{label}</small>
                <b>{value}</b>
            </div>
        </div>
    );
}

const mealsOf = (day: PackageDay, t: (text: string) => string): string =>
    [
        day.hasBreakfast && t('Breakfast'),
        day.hasLunch && t('Lunch'),
        day.hasDinner && t('Dinner'),
    ]
        .filter(Boolean)
        .join(', ');

function DayBlock({ slug, day }: { readonly slug: string; readonly day: PackageDay }) {
    const t = useT();
    const route = [day.startLocation, day.endLocation].filter(Boolean).join(' → ');
    const meals = mealsOf(day, t);
    const rows: ReadonlyArray<readonly [string, string | null]> = [
        [t('Route'), route || null],
        [t('Hotel'), day.hotelName],
        [t('Meals'), meals || null],
        [t('Activity'), day.activity],
        [t('Accommodation'), day.accommodation],
        [t('Note'), day.note],
    ];
    const gallery = day.gallery && day.gallery.photos.length > 0 ? day.gallery : null;
    return (
        <div className="pk2-day">
            <h3>
                <span>{t('Day {n}:', { n: day.dayNumber })}</span> {day.title}
            </h3>
            <p className="pk2-text">{day.description}</p>
            <dl className="pk2-dl">
                {rows.map(([label, value]) =>
                    value ? (
                        <div key={label} style={{ display: 'contents' }}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ) : null,
                )}
            </dl>
            {day.dayImage && <img className="pk2-dimg" src={packageFileUrl(slug, day.dayImage)} alt="" />}
            {gallery && <PackageSlider slug={slug} gallery={gallery} />}
        </div>
    );
}

function Faq({ question, answer }: { readonly question: string; readonly answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="pk2-faq">
            <button type="button" aria-expanded={open} onClick={() => setOpen((shown) => !shown)}>
                {question}
                <ChevronDownIcon />
            </button>
            {open && <p>{answer}</p>}
        </div>
    );
}

export function PackageView({ pkg, viewer }: { readonly pkg: PackageDetail; readonly viewer: QuoteViewer }) {
    const t = useT();
    const [tab, setTab] = useState<TabKey>('overview');
    const included = (code: number): boolean =>
        pkg.inclusions.some((item) => item.inclusion === code && item.isIncluded);
    const yes = INCLUSION_OPTIONS.filter((option) => included(option.code));
    const no = INCLUSION_OPTIONS.filter((option) => !included(option.code));
    const gallery = pkg.gallery && pkg.gallery.photos.length > 0 ? pkg.gallery : null;
    const includedText = (code: number): string => (included(code) ? t('Included') : t('Not Included'));

    return (
        <>
            <div className="pk2-top">
                <div className="pk2-main">
                    <div className="pk2-pic">
                        <FallbackImage sources={cardImageSources(pkg)} />
                    </div>
                    <div>
                        <h2 className="pk2-name">{pkg.name}</h2>
                        <div className="pk2-parks">
                            <MapPinIcon />
                            <span>{pkg.parks.map((park) => park.name).join(', ')}</span>
                        </div>
                        <div className="pk2-tags">
                            {pkg.tag.text && (
                                <span
                                    className="pk-tag"
                                    style={{ background: pkg.tag.backgroundColor, color: pkg.tag.textColor }}
                                >
                                    {pkg.tag.text}
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
                    <Fact icon={<ClockIcon />} label={t('Trip Duration')} value={durationText(pkg.nightCount, pkg.dayCount, t)} />
                    <Fact icon={<CarIcon />} label={t('Safaris')} value={activityText(pkg, t)} />
                    <Fact icon={<CarIcon />} label={t('Vehicle')} value={t(labelOf(VEHICLE_OPTIONS, pkg.vehicle))} />
                    <Fact icon={<BedIcon />} label={t('Stay')} value={t(labelOf(STAY_OPTIONS, pkg.stay))} />
                    <Fact icon={<CameraIcon />} label={t('Theme')} value={t(labelOf(THEME_OPTIONS, pkg.theme))} />
                    <Fact icon={<MapPinIcon />} label={t('Start place')} value={pkg.startPlace ?? NO_VALUE} />
                    <Fact icon={<FlagIcon />} label={t('End place')} value={pkg.endPlace ?? NO_VALUE} />
                    <Fact icon={<UtensilsIcon />} label={t('Meals')} value={includedText(MEALS_INCLUSION)} />
                    <Fact icon={<CarIcon />} label={t('Pick & Drop')} value={includedText(PICK_DROP_INCLUSION)} />
                </div>
            </div>
            <div className="pk2-pricebar">
                <span></span>
                <div className="pk2-price">
                    <div>
                        {pkg.priceBeforeDiscount !== null && (
                            <span className="pk-old">{rupees(pkg.priceBeforeDiscount)}</span>
                        )}
                        <span className="pk-ppp">
                            {rupees(pkg.pricePerPerson)} <small>{t('/Person')}</small>
                        </span>
                        <span className="pk-tot">{t('Total Price {amount}', { amount: rupees(pkg.totalPrice) })}</span>
                        <span className="pk-tot">{priceMessageOf(pkg.priceMessage, t)}</span>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={scrollToQuote}>
                        {t('Request a quote')}
                    </button>
                </div>
            </div>
            <div className="pk2-body">
                <div className="pk2-col">
                    <div className="nt-tabs pk2-tabs" role="tablist">
                        {TABS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                className={cn('nt-tab', tab === key && 'is-on')}
                                onClick={() => setTab(key)}
                            >
                                {t(TAB_LABEL[key])}
                            </button>
                        ))}
                    </div>
                    {tab === 'overview' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Overview')}</div>
                            <div className="pk2-sec-b">
                                {pkg.overview && <p className="pk2-text">{pkg.overview}</p>}
                                {gallery && <PackageSlider slug={pkg.slug} gallery={gallery} />}
                            </div>
                        </div>
                    )}
                    {tab === 'itinerary' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Itinerary')}</div>
                            <div>
                                {pkg.days.map((day) => (
                                    <DayBlock key={day.id} slug={pkg.slug} day={day} />
                                ))}
                                {pkg.days.length === 0 && (
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
                                    <div>
                                        <h3>{t('Included')}</h3>
                                        <ul>
                                            {yes.map((option) => (
                                                <li key={option.code} className="is-y">
                                                    <CheckIcon />
                                                    {t(option.label)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3>{t('Not included')}</h3>
                                        <ul>
                                            {no.map((option) => (
                                                <li key={option.code} className="is-n">
                                                    <CrossIcon />
                                                    {t(option.label)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                {pkg.moreInclusions && (
                                    <div>
                                        <h3 className="pk2-gt">{t('More inclusions')}</h3>
                                        <p className="pk2-text">{pkg.moreInclusions}</p>
                                    </div>
                                )}
                                {pkg.exclusions && (
                                    <div>
                                        <h3 className="pk2-gt">{t('Exclusions')}</h3>
                                        <p className="pk2-text">{pkg.exclusions}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'getting-there' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('Getting there')}</div>
                            <div className="pk2-sec-b">
                                <p className="pk2-text">{pkg.gettingThere || t('No details yet.')}</p>
                            </div>
                        </div>
                    )}
                    {tab === 'faqs' && (
                        <div className="pk2-sec">
                            <div className="pk2-sec-h">{t('FAQs')}</div>
                            <div>
                                {pkg.faqs.map((faq) => (
                                    <Faq key={faq.id} question={faq.question} answer={faq.answer} />
                                ))}
                                {pkg.faqs.length === 0 && (
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
                <aside className="pk2-col">
                    <QuoteForm
                        packageId={pkg.id}
                        slug={pkg.slug}
                        businessName={pkg.partner.businessName}
                        viewer={viewer}
                    />
                </aside>
            </div>
        </>
    );
}
