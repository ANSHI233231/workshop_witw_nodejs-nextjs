import Link from 'next/link';

import { serverTranslator } from '@/lib/i18n/server-translator';

import { PackageStateIcon } from './package-icons';

export async function PackageNotInUse() {
    const { t } = await serverTranslator();
    return (
        <div className="pk2-state">
            <PackageStateIcon className="icon state-icon" />
            <h2>{t('Package Not In Use!')}</h2>
            <p>{t("This package isn't available right now.")}</p>
            <Link className="btn btn-primary" href="/packages">
                {t('See all packages')}
            </Link>
        </div>
    );
}
