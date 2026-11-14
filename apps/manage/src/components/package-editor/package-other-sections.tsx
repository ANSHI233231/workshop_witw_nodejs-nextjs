'use client';

import type { usePackageEditor } from '@/hooks/package-editor/use-package-editor';
import { useT } from '@/hooks/i18n/use-t';
import { PACKAGE_LIMITS } from '@/types/package.types';

import { PackageField } from './package-field';
import { INCLUSION_OPTIONS } from './package-labels';

type Editor = ReturnType<typeof usePackageEditor>;

export function PackageInclusionsSection({ editor }: { readonly editor: Editor }) {
    const t = useT();
    const { inclusions, inclusionErrors: errors } = editor;
    return (
        <>
            <div className="pq-3">
                {INCLUSION_OPTIONS.map((option) => (
                    <div className="field" key={option.code}>
                        <span className="label">{t(option.label)}</span>
                        <select
                            className="select"
                            aria-label={t(option.label)}
                            value={inclusions.included[option.code] ? '1' : '0'}
                            onChange={(event) => editor.setIncluded(option.code, event.target.value === '1')}
                        >
                            <option value="1">{t('Included')}</option>
                            <option value="0">{t('Not included')}</option>
                        </select>
                    </div>
                ))}
            </div>
            <p className="ss-cap" style={{ margin: '-8px 0 0' }}>
                {t('Setting Meals to Included ticks Breakfast, Lunch and Dinner on every day. You can still change each day.')}
            </p>
            <PackageField
                id="e-more"
                label={t('More inclusions')}
                error={errors['moreInclusions']}
                helper={t('Up to 512 characters')}
            >
                <textarea
                    id="e-more"
                    className="textarea"
                    rows={3}
                    maxLength={PACKAGE_LIMITS.INCLUSION_TEXT_MAX}
                    value={inclusions.moreInclusions}
                    aria-invalid={errors['moreInclusions'] ? true : undefined}
                    onChange={(event) => editor.changeInclusions({ moreInclusions: event.target.value })}
                />
            </PackageField>
            <PackageField
                id="e-excl"
                label={t('Exclusions')}
                error={errors['exclusions']}
                helper={t('Up to 512 characters')}
            >
                <textarea
                    id="e-excl"
                    className="textarea"
                    rows={3}
                    maxLength={PACKAGE_LIMITS.INCLUSION_TEXT_MAX}
                    value={inclusions.exclusions}
                    aria-invalid={errors['exclusions'] ? true : undefined}
                    onChange={(event) => editor.changeInclusions({ exclusions: event.target.value })}
                />
            </PackageField>
        </>
    );
}

export function PackageGettingThereSection({ editor }: { readonly editor: Editor }) {
    const t = useT();
    const error = editor.gettingThereErrors['gettingThere'];
    return (
        <PackageField id="e-getting" label={t('Getting there')} error={error} helper={t('Up to 2,000 characters')}>
            <textarea
                id="e-getting"
                className="textarea"
                rows={6}
                maxLength={PACKAGE_LIMITS.GETTING_THERE_MAX}
                value={editor.gettingThere}
                aria-invalid={error ? true : undefined}
                onChange={(event) => editor.changeGettingThere(event.target.value)}
            />
        </PackageField>
    );
}

export function PackageFaqsSection({ editor }: { readonly editor: Editor }) {
    const t = useT();
    const { faqs, faqErrors } = editor;
    const patch = (index: number, change: Partial<(typeof faqs)[number]>) =>
        editor.changeFaqs(faqs.map((faq, position) => (position === index ? { ...faq, ...change } : faq)));
    return (
        <>
            {faqs.map((faq, index) => (
                <div className="pq-faq" key={index}>
                    <div className="ss-stack">
                        <PackageField label={t('Question')} required error={faqErrors[index]?.['question']}>
                            <input
                                className="input"
                                maxLength={PACKAGE_LIMITS.QUESTION_MAX}
                                value={faq.question}
                                aria-label={t('Question {n}', { n: index + 1 })}
                                onChange={(event) => patch(index, { question: event.target.value })}
                            />
                        </PackageField>
                        <PackageField label={t('Answer')} required error={faqErrors[index]?.['answer']}>
                            <textarea
                                className="textarea"
                                rows={2}
                                value={faq.answer}
                                aria-label={t('Answer {n}', { n: index + 1 })}
                                onChange={(event) => patch(index, { answer: event.target.value })}
                            />
                        </PackageField>
                    </div>
                    <button
                        type="button"
                        className="btn-icon is-danger"
                        aria-label={t('Delete FAQ {n}', { n: index + 1 })}
                        data-tooltip={t('Delete')}
                        onClick={() => editor.changeFaqs(faqs.filter((_, position) => position !== index))}
                    >
                        <svg
                            className="icon "
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" x2="10" y1="11" y2="17"></line>
                            <line x1="14" x2="14" y1="11" y2="17"></line>
                        </svg>
                    </button>
                </div>
            ))}
            {faqs.length === 0 && (
                <p className="ss-muted" style={{ margin: 0 }}>
                    {t('No FAQs yet.')}
                </p>
            )}
            <button
                type="button"
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-start' }}
                disabled={faqs.length >= PACKAGE_LIMITS.FAQS_MAX}
                onClick={() => editor.changeFaqs([...faqs, { question: '', answer: '' }])}
            >
                <svg
                    className="icon "
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                {t('Add FAQ')}
            </button>
        </>
    );
}
