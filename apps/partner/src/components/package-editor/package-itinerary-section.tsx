'use client';

import type { usePackageEditor } from '@/hooks/package-editor/use-package-editor';
import { useT } from '@/hooks/i18n/use-t';
import { packageFileUrl } from '@/services/package-editor.service';
import { type FormOptions, PACKAGE_LIMITS } from '@/types/package.types';

import { PackageField } from './package-field';
import { PackageImageField } from './package-image-field';
import { galleryChoices, GallerySelect } from './package-basic-section';
import type { DayDraft } from './package-rules';

type Editor = ReturnType<typeof usePackageEditor>;

const ARIA_SUFFIX = {
    title: 'title',
    description: 'description',
    startLocation: 'start location',
    endLocation: 'end location',
    hotelName: 'hotel name',
    activity: 'activity',
    accommodation: 'accommodation',
    note: 'note',
} as const;

const MEALS = [
    { key: 'hasBreakfast', label: 'Breakfast' },
    { key: 'hasLunch', label: 'Lunch' },
    { key: 'hasDinner', label: 'Dinner' },
] as const;

export function PackageItinerarySection({
    editor,
    options,
}: {
    readonly editor: Editor;
    readonly options: FormOptions;
}) {
    const t = useT();
    const { days, dayErrors, changeDay, view } = editor;
    const version = view?.version;
    const dayCount = version?.dayCount ?? days.length;

    const textField = (
        index: number,
        key: 'title' | 'startLocation' | 'endLocation' | 'hotelName',
        label: string,
        max: number,
        required = false,
    ) => (
        <PackageField label={label} required={required} error={dayErrors[index]?.[key]}>
            <input
                className="input"
                maxLength={max}
                value={days[index]?.[key] ?? ''}
                aria-label={`${t('Day {n}', { n: index + 1 })} ${t(ARIA_SUFFIX[key])}`}
                onChange={(event) => changeDay(index, { [key]: event.target.value })}
            />
        </PackageField>
    );

    const areaField = (
        index: number,
        key: 'description' | 'activity' | 'accommodation' | 'note',
        label: string,
        rows: number,
        max: number,
        required = false,
    ) => (
        <PackageField label={label} required={required} error={dayErrors[index]?.[key]}>
            <textarea
                className="textarea"
                rows={rows}
                maxLength={max}
                value={days[index]?.[key] ?? ''}
                aria-label={`${t('Day {n}', { n: index + 1 })} ${t(ARIA_SUFFIX[key])}`}
                onChange={(event) => changeDay(index, { [key]: event.target.value })}
            />
        </PackageField>
    );

    const savedImage = (index: number): string | null => {
        const name = version?.days.find((day) => day.dayNumber === index + 1)?.dayImage;
        return name && version && view ? packageFileUrl(view.package.id, version.id, name) : null;
    };

    return (
        <>
            <p className="ss-muted" style={{ margin: 0 }}>
                {t('One block for each of the {n} days set in Basic.', { n: dayCount })}
            </p>
            {days.map((day: DayDraft, index) => (
                <div className="pq-day" key={index}>
                    <h3>{t('Day {n}', { n: index + 1 })}</h3>
                    {textField(index, 'title', t('Day title'), PACKAGE_LIMITS.DAY_TITLE_MAX, true)}
                    {areaField(index, 'description', t('Description'), 3, PACKAGE_LIMITS.DAY_DESCRIPTION_MAX, true)}
                    <div className="pq-3">
                        {textField(index, 'startLocation', t('Start location'), PACKAGE_LIMITS.DAY_TEXT_MAX)}
                        {textField(index, 'endLocation', t('End location'), PACKAGE_LIMITS.DAY_TEXT_MAX)}
                        {textField(index, 'hotelName', t('Hotel name'), PACKAGE_LIMITS.DAY_TEXT_MAX)}
                    </div>
                    <div className="field">
                        <span className="label">{t('Meals')}</span>
                        <div className="pq-checks">
                            {MEALS.map((meal) => (
                                <label className="check" key={meal.key}>
                                    <input
                                        type="checkbox"
                                        checked={day[meal.key]}
                                        onChange={() => changeDay(index, { [meal.key]: !day[meal.key] })}
                                    />
                                    {t(meal.label)}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="pq-3">
                        {areaField(index, 'activity', t('Activity'), 2, PACKAGE_LIMITS.DAY_NOTE_MAX)}
                        {areaField(index, 'accommodation', t('Accommodation'), 2, PACKAGE_LIMITS.DAY_NOTE_MAX)}
                        {areaField(index, 'note', t('Note'), 2, PACKAGE_LIMITS.DAY_NOTE_MAX)}
                    </div>
                    <div className="pq-2">
                        <PackageField
                            label={t('Day image')}
                            error={dayErrors[index]?.['image']}
                            helper={t('JPG, JPEG or PNG, any size')}
                        >
                            <PackageImageField
                                label={`${t('Day {n}', { n: index + 1 })} ${t('image')}`}
                                savedUrl={savedImage(index)}
                                image={day.image}
                                maxBytes={PACKAGE_LIMITS.DAY_IMAGE_MAX_BYTES}
                                onChange={(image) => changeDay(index, { image })}
                                onProblem={() => undefined}
                            />
                        </PackageField>
                        <GallerySelect
                            id={`f-gallery-${index}`}
                            label={t('Day gallery')}
                            value={day.galleryId}
                            options={galleryChoices(
                                options,
                                version?.days.find((saved) => saved.dayNumber === index + 1)?.gallery ?? null,
                            )}
                            onChange={(value) => changeDay(index, { galleryId: value })}
                            error={dayErrors[index]?.['galleryId']}
                        />
                    </div>
                </div>
            ))}
        </>
    );
}
