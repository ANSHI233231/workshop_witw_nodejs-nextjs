'use client';

import { type ReactNode, useEffect } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { usePackageEditor, type EditorSection } from '@/hooks/package-editor/use-package-editor';
import { useRevealFirstError } from '@/hooks/ui/use-reveal-first-error';
import { formatDate } from '@/lib/format';
import {
    type BasicBody,
    type EditorMode,
    type FormOptions,
    PackageVersionStatus,
    type PackageView,
} from '@/types/package.types';

import { PackageBanners } from './package-banners';
import { PackageDaysDialog } from './package-days-dialog';
import { PackageBasicSection } from './package-basic-section';
import { PackageItinerarySection } from './package-itinerary-section';
import { PackageFaqsSection, PackageGettingThereSection, PackageInclusionsSection } from './package-other-sections';

const SECTIONS: readonly { readonly key: EditorSection; readonly label: string }[] = [
    { key: 'basic', label: 'Basic' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'inclusions', label: 'Inclusions' },
    { key: 'gettingThere', label: 'Getting there' },
    { key: 'faqs', label: 'FAQs' },
];

export type EditorSideContext = {
    readonly view: PackageView | null;
    readonly dirty: boolean;
    readonly busy: boolean;
};

export function PackageEditor({
    mode,
    initial,
    options,
    listPath,
    create,
    renderSide,
    onViewChange,
    onDirtyChange,
}: {
    readonly mode: EditorMode;
    readonly initial: PackageView | null;
    readonly options: FormOptions;
    readonly listPath: string;
    readonly create?: (body: BasicBody) => Promise<PackageView>;
    readonly renderSide: (context: EditorSideContext) => ReactNode;
    readonly onViewChange?: (view: PackageView | null) => void;
    readonly onDirtyChange?: (dirty: boolean) => void;
}) {
    const t = useT();
    const { formRef, revealFirstError } = useRevealFirstError<HTMLDivElement>();
    const editor = usePackageEditor({
        initial,
        listPath,
        create,
        revealFirstError,
        offeredParkIds: options.parks.map((park) => park.id),
    });
    const { view, section } = editor;
    const version = view?.version ?? null;
    const canEdit = view === null || version?.canEdit === true;
    const numbered = mode === 'partner';
    const replaced = version?.status === PackageVersionStatus.REPLACED;

    useEffect(() => onViewChange?.(view), [view, onViewChange]);
    useEffect(() => onDirtyChange?.(editor.dirty), [editor.dirty, onDirtyChange]);

    return (
        <div className="pq-ed">
            <div className="pq-ed-main">
                {view && version && (
                    <PackageBanners
                        mode={mode}
                        view={view}
                        version={version}
                        backHref={`${listPath}/${view.package.id}`}
                        dateOf={formatDate}
                    />
                )}
                <div className="pq-card">
                    <div className="nt-tabs" role="tablist">
                        {SECTIONS.map((item, index) => {
                            const disabled = item.key !== 'basic' && !editor.basicSaved;
                            const css = `nt-tab${section === item.key ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`;
                            return (
                                <a
                                    key={item.key}
                                    className={css}
                                    role="tab"
                                    aria-selected={section === item.key}
                                    aria-disabled={disabled}
                                    onClick={() => editor.pickSection(item.key)}
                                >
                                    {numbered ? `${index + 1}. ${t(item.label)}` : t(item.label)}
                                </a>
                            );
                        })}
                    </div>
                    <div className={canEdit ? 'pq-body' : 'pq-body pq-ro'} ref={formRef}>
                        {section === 'basic' && <PackageBasicSection editor={editor} options={options} />}
                        {section === 'itinerary' && <PackageItinerarySection editor={editor} options={options} />}
                        {section === 'inclusions' && <PackageInclusionsSection editor={editor} />}
                        {section === 'gettingThere' && <PackageGettingThereSection editor={editor} />}
                        {section === 'faqs' && <PackageFaqsSection editor={editor} />}
                    </div>
                    {canEdit && !replaced && (
                        <div className="pq-foot">
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={editor.busy}
                                onClick={() => void editor.save()}
                            >
                                {view ? t('Save section') : t('Save Basic')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {renderSide({ view, dirty: editor.dirty, busy: editor.busy })}
            {editor.daysCut && (
                <PackageDaysDialog
                    from={editor.daysCut.from}
                    to={editor.daysCut.to}
                    busy={editor.busy}
                    onCancel={editor.cancelDaysCut}
                    onConfirm={editor.confirmDaysCut}
                />
            )}
        </div>
    );
}
