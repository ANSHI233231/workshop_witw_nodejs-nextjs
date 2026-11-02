'use client';

import type { ReactNode } from 'react';

import { BellIcon, MailIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export const fillTemplate = (template: string, values: Readonly<Record<string, string>>): string =>
    template.replace(PLACEHOLDER, (whole: string, name: string) => values[name] ?? whole);

export function EmailPreview({ title, html }: { readonly title: string; readonly html: string }) {
    return (
        <div className="em-prev">
            <div className="em-brand">
                <MailIcon />
                Email
            </div>
            <iframe className="ml-preview" title={title} srcDoc={html} sandbox="" referrerPolicy="no-referrer" />
        </div>
    );
}

export function BellPreview({
    app,
    title,
    message,
    when,
    opens,
}: {
    readonly app: string;
    readonly title: ReactNode;
    readonly message: string | null;
    readonly when: string;
    readonly opens: string | null;
}) {
    const t = useT();
    return (
        <div className="na-prev">
            <div className="na-cap">{t('{app} · bell notification', { app: t(app) })}</div>
            <div className="na-card">
                <span className="na-ic">
                    <BellIcon />
                </span>
                <div>
                    <b>{title}</b>
                    {message && <p>{message}</p>}
                    <small>
                        {when}
                        {opens ? ` · ${t('Opens {opens}', { opens })}` : ''}
                    </small>
                </div>
            </div>
        </div>
    );
}
