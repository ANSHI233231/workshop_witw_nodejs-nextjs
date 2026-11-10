import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { TranslationProvider } from '@/components/i18n/translation-provider';
import { roboto } from '@/lib/fonts';
import { serverTranslator } from '@/lib/i18n/server-translator';

import './globals.css';
import './console-extras.css';
import './console-mobile.css';
import './console-drawer-tools.css';
import './console-responsive-fixes.css';
import './console-shared-safari.css';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await serverTranslator();
    return {
        title: { default: t('Admin Console'), template: `%s | ${t('Admin Console')}` },
        description: t('Manage the whole platform from one place.'),
    };
};

export default async function RootLayout({ children }: { readonly children: ReactNode }) {
    const { locale, languages, dictionary } = await serverTranslator();
    return (
        <html lang={locale} className={roboto.variable}>
            <body suppressHydrationWarning>
                <TranslationProvider locale={locale} languages={languages} dictionary={dictionary}>
                    <div className="root" data-portal="admin">
                        {children}
                    </div>
                </TranslationProvider>
            </body>
        </html>
    );
}
